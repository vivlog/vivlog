import { DataSource } from 'typeorm'
import { DefaultContainer } from '../../../container'
import { BadRequestError, Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { Settings, defaultSettings } from '../../types'
import { DeleteItemDto, DeleteItemsDto, GetItemDto, GetItemsDto, SetItemDto, Setting } from './entities'


export class SettingService {
    public db: DataSource
    public logger: Logger
    constructor(container: DefaultContainer) {
        lazy(this, 'db', () => container.resolve('db') as DataSource)
        lazy(this, 'logger', () => container.resolve('logger') as Logger)
    }

    async getItems({ group }: GetItemsDto) {
        const items = await this.db.manager.find(Setting, {
            where: {
                ...(group ? { group } : {})
            }
        })
        return items
    }
    async getItem({ group, name }: GetItemDto) {
        const item = await this.db.manager.findOne(Setting, {
            where: {
                group,
                name
            }
        })
        return item
    }

    async getValueOrDefault<T>(group: string, name: string, default_: T): Promise<T> {
        const item = await this.getItem({ group, name })
        if (item) {
            return item.value as T
        } else {
            return default_
        }
    }

    async getValue<T>(group: string, name: string): Promise<T> {
        const item = await this.getItem({ group, name })
        if (item) {
            return item.value as T
        } else {
            throw new BadRequestError(`setting ${group}.${name} not found`)
        }
    }

    async setItem({ group, name, value }: SetItemDto) {
        this.logger.debug('set setting %s.%s=%s', group, name, value)
        const item = await this.db.manager.findOne(Setting, {
            where: {
                group,
                name
            }
        })
        if (item) {
            item.value = value
            await this.db.manager.save(item)
            return item
        } else {
            const newItem = new Setting()
            newItem.group = group
            newItem.name = name
            newItem.value = value
            await this.db.manager.save(newItem)
            return newItem
        }

    }

    async setItems(items: SetItemDto[]) {
        const newItems = items.map((item: { group: string; name: string; value: unknown }) => {
            const newItem = new Setting()
            newItem.group = item.group
            newItem.name = item.name
            newItem.value = item.value
            return newItem
        })

        await this.db.manager.save(newItems)
        return newItems
    }

    async createDefaultSettings(): Promise<SetItemDto[]> {
        return defaultSettings
    }

    async initSettings(items: SetItemDto[]) {
        const r = await this.getItem({ group: Settings.System._group, name: Settings.System.initialized })
        if (r) {
            throw new BadRequestError('already initialized')
        }
        const defaultSettings = await this.createDefaultSettings()
        const mergedItems = [...defaultSettings, ...items]
        const newItems = mergedItems.map(item => {
            const newItem = new Setting()
            newItem.group = item.group
            newItem.name = item.name
            newItem.value = item.value
            return newItem
        })

        await this.db.manager.save(newItems)
        return null
    }

    async deleteItem({ group, name }: DeleteItemDto) {
        const item = await this.db.manager.findOne(Setting, {
            where: {
                group,
                name
            }
        })
        if (item) {
            await this.db.manager.remove(item)
            return null
        } else {
            throw new BadRequestError('item not found')
        }
    }

    async deleteItems({ group }: DeleteItemsDto) {
        const items = await this.db.manager.find(Setting, {
            where: {
                group
            }
        })
        await this.db.manager.remove(items)
        return null
    }

}
