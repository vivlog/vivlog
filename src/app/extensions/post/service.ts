import { DataSource } from 'typeorm'
import { Container } from '../../../container'
import { BadRequestError, Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { DeleteItemDto, DeleteItemsDto, GetItemDto, GetItemsDto, SetItemDto, Setting } from './entities'


export class SettingService {
    private db: DataSource
    private logger: Logger
    constructor(container: Container) {
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

    async setItem({ group, name, value }: SetItemDto) {
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
        const newItems = items.map(item => {
            const newItem = new Setting()
            newItem.group = item.group
            newItem.name = item.name
            newItem.value = item.value
            return newItem
        })

        await this.db.manager.save(newItems)
        return newItems
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
