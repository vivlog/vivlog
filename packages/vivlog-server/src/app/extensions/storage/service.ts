import { randomUUID } from 'crypto'
import { DataSource } from 'typeorm'
import { DefaultContainer } from '../../../container'
import { Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { Settings } from '../../types'
import { SettingService } from '../setting/service'
import { CreateStorageDto, DeleteStorageDto, Storage, GetStorageDto, GetStoragesDto, UpdateStorageDto } from './entities'

export class StorageService {
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

    async createStorage(dto: CreateStorageDto) {
        const storage = this.db.getRepository(Storage).create(dto)
        storage.uuid = randomUUID()
        await this.db.getRepository(Storage).save(storage)
        return storage
    }

    async updateStorage(dto: UpdateStorageDto) {
        const storage = await this.db.getRepository(Storage).findOneBy({ uuid: dto.uuid })
        if (!storage) {
            throw new Error('Storage not found')
        }
        return this.getStorage({ site: dto.site ?? await this.defaultSite, uuid: dto.uuid })
    }

    async deleteStorage(dto: DeleteStorageDto) {
        await this.db.getRepository(Storage).delete(dto.uuid)
        return { deleted: true }
    }

    async getStorage(dto: GetStorageDto) {
        if (!dto.site) {
            dto.site = await this.defaultSite
        }
        return this.db.getRepository(Storage).findOneBy(dto)
    }

    async getStorages(dto: GetStoragesDto) {

        const { filters, limit, offset, with_total } = dto

        const query = this.db.getRepository(Storage)
            .createQueryBuilder('storage')

        if (filters) {
            if (filters.title) {
                query.andWhere('storage.title like :title', { title: `%${filters.title}%` })
            }
        }

        if (limit) {
            query.limit(limit)
        }

        if (offset) {
            query.offset(offset)
        }

        if (with_total) {
            const [storages, total] = await query.getManyAndCount()
            return {
                storages,
                total
            }
        }

        const storages = await query.getMany()
        return {
            storages
        }
    }
}
