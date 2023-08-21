/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'crypto'
import { DataSource } from 'typeorm'
import { ConfigProvider } from '../../../config'
import { Container } from '../../../container'
import { Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { rpc } from '../../../utils/rpc'
import { Settings } from '../../types'
import { Masker } from '../../util/mask'
import { Connection, ConnectionDirections } from '../connection/entities'
import { ConnectionService } from '../connection/service'
import { SettingService } from '../setting/service'
import { UserMaskFields } from '../user/entities'
import { UserService } from '../user/service'
import { BrowsePostsDto, CreatePostDto, DeletePostDto, GetPostDto, GetPostsDto, Post, SyncPostsDto, UpdatePostDto } from './entities'

export class PostService {
    private db: DataSource
    private logger: Logger
    private settingService: SettingService
    private connectionService: ConnectionService
    private userService: UserService
    private config: ConfigProvider
    get defaultSite() {
        return this.settingService.getValue<string>(Settings.System._group, Settings.System.site)
    }

    constructor(container: Container) {
        lazy(this, 'db', () => container.resolve('db') as DataSource)
        lazy(this, 'logger', () => container.resolve('logger') as Logger)
        lazy(this, 'settingService', () => container.resolve(SettingService.name) as SettingService)
        lazy(this, 'userService', () => container.resolve(UserService.name) as UserService)
        lazy(this, 'connectionService', () => container.resolve(ConnectionService.name) as ConnectionService)
        lazy(this, 'config', () => container.resolve('config') as ConfigProvider)
    }

    async createPost(dto: CreatePostDto) {
        const post = this.db.getRepository(Post).create(dto)
        if (post.status === 'published') {
            post.published_at = new Date()
        }
        post.uuid = randomUUID()
        await this.db.getRepository(Post).save(post)
        return post
    }

    async updatePost(dto: UpdatePostDto) {
        const post = await this.db.getRepository(Post).findOneBy({ uuid: dto.uuid })
        if (!post) {
            throw new Error('Post not found')
        }
        return this.getPost({ site: dto.site ?? await this.defaultSite, uuid: dto.uuid })
    }

    async deletePost(dto: DeletePostDto) {
        await this.db.getRepository(Post).delete(dto.uuid)
        return { deleted: true }
    }

    async getPost(dto: GetPostDto) {
        if (!dto.site) {
            dto.site = await this.defaultSite
        }
        return this.db.getRepository(Post).findOneBy(dto)
    }

    async syncPosts({ site, limit, after_time }: SyncPostsDto): Promise<{ posts: Post[] }> {
        const remotePosts: Post[] = []
        const { connections } = await this.connectionService.getConnections({
            filters: {
                remote_site: site,
                direction: ConnectionDirections.Outgoing
            }
        })

        await Promise.all(connections.map(async ({ remote_site, remote_token, options }: Connection) => {
            const baseUrl = remote_site + options.api_path

            const request = rpc(baseUrl)
            let ret: { posts: Post[] } | undefined
            try {
                ret = await request<ReturnType<typeof this.getPosts>, GetPostsDto>('post', 'getPosts', {
                    filters: {
                        after_time
                    },
                    limit
                }, { token: remote_token })
            } catch (error) {
                this.logger.error('failed to sync posts from %s: %o', remote_site, error)
            }
            if (!ret) {
                return
            }
            ret.posts.forEach(post => {
                try {
                    this.validateRemotePost(remote_site, post)
                    remotePosts.push(post)
                } catch (error) {
                    this.logger.error('failed to validate remote post %s from %s: %o', post.uuid, remote_site, error)
                }
            })

        }))

        // sync remote posts to database
        remotePosts.forEach(async post => {
            const existingPost = await this.db.getRepository(Post).findOneBy({ uuid: post.uuid, site: post.site })
            if (existingPost) {
                post.remote_author = post.author
                post.author = undefined
                post.id = undefined as any
                await this.db.getRepository(Post).update(existingPost.id, post)
            } else {
                post.id = undefined as any
                post.remote_author = post.author
                await this.db.getRepository(Post).save(post)
            }
        })

        return {
            posts: remotePosts
        }
    }

    private validateRemotePost(site: string, post: Post) {
        if (post.site != site) {
            throw new Error(`site mismatch: expect ${site}, got ${post.site}`)
        }
        if (!post.uuid) {
            throw new Error('uuid is required')
        }
        if (post.site != post.author_site) {
            throw new Error(`author site mismatch: expect ${site}, got ${post.site}`)
        }
        if (!post.author_uuid) {
            throw new Error('author uuid is required')
        }
        return true
    }

    async browsePosts(dto: BrowsePostsDto): Promise<{ posts: Post[] }> {
        return this.getPosts(dto, dto.filters?.site ?? '*')
    }

    async getPosts(dto: GetPostsDto, site?: Post['site']): Promise<{ posts: Post[]; total?: number }> {

        const { filters, limit, offset, with_total, with_author } = dto

        const query = this.db.getRepository(Post)
            .createQueryBuilder('post')

        if (filters) {
            if (filters.title) {
                query.andWhere('post.title like :title', { title: `%${filters.title}%` })
            }
        }

        // getPosts is call without site param if it's called from API
        // these means a external call, so we only return posts from current site
        if (site === undefined) {
            query.andWhere('post.site = :site', { site: await this.defaultSite })
        } else {
            // but if the site param is provided, we return posts from that site
            // and * means all sites
            if (site !== '*') {
                query.andWhere('post.site = :site', { site })
            }
        }

        if (limit) {
            query.limit(limit)
        }

        if (offset) {
            query.offset(offset)
        }

        if (with_total) {
            const [posts, total] = await query.getManyAndCount()
            return {
                posts,
                total
            }
        }

        if (with_author) {
            // query.innerJoinAndSelect('post.author', 'author')
            query.leftJoinAndMapOne('post.author', 'user', 'author', 'author.uuid = post.author_uuid')
        }
        const posts = Masker
            .of(await query.getMany())
            .mask('author', UserMaskFields)
            .get()
            .map(post => {
                if (post.author) {
                    post.author.is_local = true
                    post.author.site = post.author_site
                } else {
                    post.author = post.remote_author
                    if (post.author) {
                        post.author.is_local = false
                    }
                }
                delete post.remote_author
                return post
            })

        return {
            posts
        }
    }
}
