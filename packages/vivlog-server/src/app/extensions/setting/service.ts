/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { DataSource } from 'typeorm'
import { DefaultContainer } from '../../../container'
import { BadRequestError, Logger } from '../../../host/types'
import { always, lazy } from '../../../utils/lazy'
import { Settings, } from '../../types'
import { DeleteItemDto, DeleteItemsDto, GetItemDto, GetItemsDto, SetItemDto, Setting, SettingItem } from './entities'

export const defaultSettings = [
    // TODO: add default settings here
    { group: Settings.System._group, name: Settings.System.site, value: 'vivlog.net/x/demo' },
    { group: Settings.System._group, name: Settings.System.title, value: 'Vivlog' },
    { group: Settings.System._group, name: Settings.System.initialized, value: true },
    { group: Settings.Comment._group, name: Settings.Comment.enabled, value: true },
    { group: Settings.Comment._group, name: Settings.Comment.allow_guest, value: true },
]
export class SettingService {
    public db: DataSource
    public logger: Logger
    public schemas: SettingItem<any>[]
    public publicItems: Map<string, string> // group -> name
    constructor(container: DefaultContainer) {
        lazy(this, 'db', () => container.resolve('db') as DataSource)
        lazy(this, 'logger', () => container.resolve('logger') as Logger)
        always(this, 'schemas', () => container.resolve('SettingService::settingItems') as SettingItem<any>[])

        this.publicItems = new Map()
        this.publicItems.set(Settings.System._group, Settings.System.site)
        this.publicItems.set(Settings.System._group, Settings.System.title)
    }

    async getItems({ group }: GetItemsDto) {
        const items = await this.db.manager.find(Setting, {
            where: {
                ...(group ? { group } : {})
            }
        })
        return items
    }

    async getPublicItems({ group }: GetItemsDto) {
        const items = await this.getItems({ group })
        return items.filter(item => {
            return this.publicItems.has(item.group) && this.publicItems.get(item.group) === item.name
        })
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
        const schemaItem = this.schemas.find(item => item.group === group && item.name === name)
        if (schemaItem) {
            if (schemaItem.schema) {
                const validator = TypeCompiler.Compile(schemaItem.schema)
                const iter = validator.Errors(value)
                const err = iter.First()
                if (err !== undefined) {
                    throw new BadRequestError(err.message)
                }
            }
        }
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

    async getSchema({ group }: GetItemsDto) {
        const qb = this.db.manager.createQueryBuilder(Setting, 'setting')
        this.schemas
            .filter(item => !group || item.group === group)
            .map(({ group, name }) => ({ group, name }))
            .forEach(({ group, name }, i) => {
                // qb.orWhere('(setting.group = :group AND setting.name = :name)', { group, name })
                qb.orWhere(`(setting.group = :group${i} AND setting.name = :name${i})`, { [`group${i}`]: group, [`name${i}`]: name })
            })

        const items = await qb.getMany()

        return this.schemas.map(item => {
            console.log('items', items)
            console.log('item', item)


            const found = items.find(i => i.group === item.group && i.name === item.name)
            console.log('found', found)

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { schema, ...rest } = item
            const ret = found ? { ...rest, defaultValue: found.value } : rest
            console.log('ret', ret)
            return ret
        })
    }
}
