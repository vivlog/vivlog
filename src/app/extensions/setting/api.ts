import { ServerHost } from '../../../host/host'
import { deleteItemSchema, deleteItemsSchema, getItemSchema, getItemsSchema, setItemSchema, setItemsSchema } from './entities'
import { SettingService } from './service'


export function createSettingApi(host: ServerHost) {
    const settingService = host.container.resolve(SettingService.name) as SettingService

    host.addRoute('setting', 'getItem', getItemSchema, async (req) => {
        return await settingService.getItem(req.body)
    })

    host.addRoute('setting', 'getItems', getItemsSchema, async (req) => {
        return await settingService.getItems(req.body)
    })

    host.addRoute('setting', 'setItem', setItemSchema, async (req) => {
        return await settingService.setItem(req.body)
    })

    host.addRoute('setting', 'setItems', setItemsSchema, async (req) => {
        return await settingService.setItems(req.body)
    })

    host.addRoute('setting', 'deleteItem', deleteItemSchema, async (req) => {
        return await settingService.deleteItem(req.body)
    })

    host.addRoute('setting', 'deleteItems', deleteItemsSchema, async (req) => {
        return await settingService.deleteItems(req.body)
    })

}
