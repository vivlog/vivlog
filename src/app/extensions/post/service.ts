import { DataSource } from 'typeorm'
import { Container } from '../../../container'
import { Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { CreatePostDto, DeletePostDto, GetPostDto, GetPostsDto, Post, UpdatePostDto } from './entities'

export class PostService {
    private db: DataSource
    private logger: Logger

    constructor(container: Container) {
        lazy(this, 'db', () => container.resolve('db') as DataSource)
        lazy(this, 'logger', () => container.resolve('logger') as Logger)
    }

    async createPost(req: CreatePostDto) {
        const post = this.db.getRepository(Post).create(req)
        await this.db.getRepository(Post).save(post)
        return post
    }

    async updatePost(req: UpdatePostDto) {
        const post = await this.db.getRepository(Post).findOneBy({ uuid: req.uuid })
        if (!post) {
            throw new Error('Post not found')
        }
        return this.getPost({ site: req.site, uuid: req.uuid })
    }

    async deletePost(req: DeletePostDto) {
        await this.db.getRepository(Post).delete(req.uuid)
        return { deleted: true }
    }

    async getPost(req: GetPostDto) {
        return this.db.getRepository(Post).findOneBy({ uuid: req.uuid })
    }

    async getPosts(req: GetPostsDto) {

        const { filters, limit, offset, with_total } = req

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
