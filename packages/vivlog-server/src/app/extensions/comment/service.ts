import { randomUUID } from 'crypto'
import { DataSource } from 'typeorm'
import { DefaultContainer } from '../../../container'
import { AgentInfo, Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { Settings } from '../../types'
import { SettingService } from '../setting/service'
import { Comment, CreateCommentDto, DeleteCommentDto, GetCommentDto, GetCommentsDto, UpdateCommentDto } from './entities'

export class CommentService {
    public db: DataSource
    public logger: Logger
    public settingService: SettingService
    get defaultSite() {
        return this.settingService.getValue<string>(Settings.System._group, Settings.System.site)
    }

    constructor(container: DefaultContainer) {
        lazy(this, 'db', () => container.resolve('db') as DataSource)
        lazy(this, 'logger', () => container.resolve('logger') as Logger)
        lazy(this, 'settingService', () => container.resolve(SettingService.name) as SettingService)
    }

    async createComment(dto: CreateCommentDto, agent: AgentInfo) {
        const comment = this.db.getRepository(Comment).create(dto)
        comment.uuid = randomUUID()
        comment.site = await this.defaultSite
        comment.agent = agent
        comment.resource_site = comment.site
        // make sure resource with uuid exists
        const resource = comment.resource_type
        const resource = await this.db.createQueryBuilder().select(resource).where(`${resource}.uuid = :uuid`, { uuid: comment.resource_uuid }).getOne()
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
