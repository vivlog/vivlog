import { randomUUID } from 'crypto'
import { DataSource } from 'typeorm'
import { Container } from '../../../container'
import { Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { Settings } from '../../types'
import { SettingService } from '../setting/service'
import { CreatePostDto, DeletePostDto, GetPostDto, GetPostsDto, Post, UpdatePostDto } from './entities'

export class PostService {
    private db: DataSource
    private logger: Logger
    private settingService: SettingService
    get defaultSite() {
        return this.settingService.getValue<string>(Settings.System._group, Settings.System.site)
    }

    constructor(container: Container) {
        lazy(this, 'db', () => container.resolve('db') as DataSource)
        lazy(this, 'logger', () => container.resolve('logger') as Logger)
        lazy(this, 'settingService', () => container.resolve(SettingService.name) as SettingService)
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

    async getPosts(dto: GetPostsDto) {

        const { filters, limit, offset, with_total } = dto

        const query = this.db.getRepository(Post)
            .createQueryBuilder('post')

        if (filters) {
            if (filters.title) {
                query.andWhere('post.title like :title', { title: `%${filters.title}%` })
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

        const posts = await query.getMany()
        return {
            posts
        }
    }
}
