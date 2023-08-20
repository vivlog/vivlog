import { randomUUID } from 'crypto'
import { DataSource } from 'typeorm'
import { Container } from '../../../container'
import { Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { Settings } from '../../types'
import { SettingService } from '../setting/service'
import { CreateCommentDto, DeleteCommentDto, Comment, GetCommentsDto, GetCommentDto, UpdateCommentDto } from './entities'

export class CommentService {
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

    async createComment(dto: CreateCommentDto) {
        const comment = this.db.getRepository(Comment).create(dto)
        comment.uuid = randomUUID()
        await this.db.getRepository(Comment).save(comment)
        return comment
    }

    async updateComment(dto: UpdateCommentDto) {
        const comment = await this.db.getRepository(Comment).findOneBy({ uuid: dto.uuid })
        if (!comment) {
            throw new Error('Comment not found')
        }
        return this.getComment({ site: dto.site ?? await this.defaultSite, uuid: dto.uuid })
    }

    async deleteComment(dto: DeleteCommentDto) {
        await this.db.getRepository(Comment).delete(dto.uuid)
        return { deleted: true }
    }

    async getComment(dto: GetCommentDto) {
        if (!dto.site) {
            dto.site = await this.defaultSite
        }
        return this.db.getRepository(Comment).findOneBy(dto)
    }

    async getComments(dto: GetCommentsDto) {

        const { filters, limit, offset, with_total } = dto

        const query = this.db.getRepository(Comment)
            .createQueryBuilder('comment')

        if (filters) {
            if (filters.title) {
                query.andWhere('comment.title like :title', { title: `%${filters.title}%` })
            }
        }

        if (limit) {
            query.limit(limit)
        }

        if (offset) {
            query.offset(offset)
        }

        if (with_total) {
            const [comments, total] = await query.getManyAndCount()
            return {
                comments,
                total
            }
        }

        const comments = await query.getMany()
        return {
            comments
        }
    }
}
