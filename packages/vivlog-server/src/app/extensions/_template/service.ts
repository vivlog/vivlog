import { randomUUID } from 'crypto'
import { DataSource } from 'typeorm'
import { Container } from '../../../container'
import { Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { Settings } from '../../types'
import { SettingService } from '../setting/service'
import { CreateExampleDto, DeleteExampleDto, Example, GetExamplesDto, GetExampleDto, UpdateExampleDto } from './entities'

export class ExampleService {
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

    async createExample(dto: CreateExampleDto) {
        const example = this.db.getRepository(Example).create(dto)
        example.uuid = randomUUID()
        await this.db.getRepository(Example).save(example)
        return example
    }

    async updateExample(dto: UpdateExampleDto) {
        const example = await this.db.getRepository(Example).findOneBy({ uuid: dto.uuid })
        if (!example) {
            throw new Error('Example not found')
        }
        return this.getExample({ site: dto.site ?? await this.defaultSite, uuid: dto.uuid })
    }

    async deleteExample(dto: DeleteExampleDto) {
        await this.db.getRepository(Example).delete(dto.uuid)
        return { deleted: true }
    }

    async getExample(dto: GetExampleDto) {
        if (!dto.site) {
            dto.site = await this.defaultSite
        }
        return this.db.getRepository(Example).findOneBy(dto)
    }

    async getExamples(dto: GetExamplesDto) {

        const { filters, limit, offset, with_total } = dto

        const query = this.db.getRepository(Example)
            .createQueryBuilder('example')

        if (filters) {
            if (filters.title) {
                query.andWhere('example.title like :title', { title: `%${filters.title}%` })
            }
        }

        if (limit) {
            query.limit(limit)
        }

        if (offset) {
            query.offset(offset)
        }

        if (with_total) {
            const [examples, total] = await query.getManyAndCount()
            return {
                examples,
                total
            }
        }

        const examples = await query.getMany()
        return {
            examples
        }
    }
}
