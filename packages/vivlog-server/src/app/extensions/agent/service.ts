import { randomUUID } from 'crypto'
import { DataSource } from 'typeorm'
import { DefaultContainer } from '../../../container'
import { Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { Settings } from '../../types'
import { SettingService } from '../setting/service'
import { Agent, CreateAgentDto, DeleteAgentDto, GetAgentDto, GetAgentsDto, UpdateAgentDto } from './entities'

export class AgentService {
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

    async createAgent(dto: CreateAgentDto) {
        const agent = this.db.getRepository(Agent).create(dto)
        agent.uuid = randomUUID()
        await this.db.getRepository(Agent).save(agent)
        return agent
    }

    async updateAgent(dto: UpdateAgentDto) {
        const agent = await this.db.getRepository(Agent).findOneBy({ uuid: dto.uuid })
        if (!agent) {
            throw new Error('Agent not found')
        }
        return this.getAgent({ site: dto.site ?? await this.defaultSite, uuid: dto.uuid })
    }

    async deleteAgent(dto: DeleteAgentDto) {
        await this.db.getRepository(Agent).delete(dto.uuid)
        return { deleted: true }
    }

    async getAgent(dto: GetAgentDto) {
        if (!dto.site) {
            dto.site = await this.defaultSite
        }
        return this.db.getRepository(Agent).findOneBy(dto)
    }

    async getAgents(dto: GetAgentsDto) {

        const { filters, limit, offset, with_total } = dto

        const query = this.db.getRepository(Agent)
            .createQueryBuilder('agent')

        if (filters) {
            if (filters.title) {
                query.andWhere('agent.title like :title', { title: `%${filters.title}%` })
            }
        }

        if (limit) {
            query.limit(limit)
        }

        if (offset) {
            query.offset(offset)
        }

        if (with_total) {
            const [agents, total] = await query.getManyAndCount()
            return {
                agents,
                total
            }
        }

        const agents = await query.getMany()
        return {
            agents
        }
    }
}
