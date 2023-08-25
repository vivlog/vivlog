import { randomUUID } from 'crypto'
import { DataSource } from 'typeorm'
import { DefaultContainer } from '../../../container'
import { AgentInfo, BadRequestError, Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { Settings } from '../../types'
import { SettingService } from '../setting/service'
import { Comment, CreateCommentDto, DeleteCommentDto, GetCommentDto, GetCommentsDto, UpdateCommentDto } from './entities'

export class CommentService {
    public db: DataSource
    public logger: Logger
    public settingService: SettingService
    public commentableEntities: string[]
    get defaultSite() {
        return this.settingService.getValue<string>(Settings.System._group, Settings.System.site)
    }

    constructor(container: DefaultContainer) {
        lazy(this, 'db', () => container.resolve('db') as DataSource)
        lazy(this, 'logger', () => container.resolve('logger') as Logger)
        lazy(this, 'settingService', () => container.resolve(SettingService.name) as SettingService)
        lazy(this, 'commentableEntities', () => container.resolve<string[]>('commentableEntities'))
    }

    async createComment(dto: CreateCommentDto, agent: AgentInfo) {
        const comment = this.db.getRepository(Comment).create(dto)
        comment.uuid = randomUUID()
        comment.site = await this.defaultSite
        comment.resource_site = dto.resource.site
        comment.resource_type = dto.resource.type
        comment.resource_uuid = dto.resource.uuid
        comment.content = dto.content
        comment.agent = agent
        comment.user_uuid = agent.uuid
        comment.user_site = agent.site
        if (!this.commentableEntities.includes(comment.resource_type)) {
            throw new BadRequestError('Resource type not supported')
        }
        // make sure resource with uuid exists
        const resource = await this.db.createQueryBuilder()
            .select(comment.resource_type)
            .from(comment.resource_type, comment.resource_type)
            .where('uuid = :uuid', { uuid: comment.resource_uuid })
            .getRawOne()
        if (!resource) {
            throw new BadRequestError('Resource with given uuid not found')
        }
        await this.db.getRepository(Comment).save(comment)
        return comment
    }

    async updateComment(dto: UpdateCommentDto) {
        const comment = await this.db.getRepository(Comment).findOneBy({ uuid: dto.uuid })
        if (!comment) {
            throw new Error('Comment not found')
        }
        return this.getComment({ site: dto.resource.site ?? await this.defaultSite, uuid: dto.uuid })
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
