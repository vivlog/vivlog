import { RpcRequest } from '../../../host/host'
import { Host } from '../../../host/types'
import { deleteItemSchema, deleteItemsSchema, getItemSchema, getItemsSchema, initSettingsSchema, setItemSchema, setItemsSchema } from './entities'
import { SettingService } from './service'


export function createSettingApi(host: Host) {
    const settingService = host.container.resolve(SettingService.name) as SettingService
    const routes = host.container.resolve('routes')
    routes.role('user').add('setting', 'initSettings', initSettingsSchema, async (req: RpcRequest<typeof initSettingsSchema>) => {
        return await settingService.initSettings(req.body)
    })

    routes.role('user').add('setting', 'getItem', getItemSchema, async (req) => {
        return await settingService.getItem(req.body)
    })

    routes.role('user').add('setting', 'getItems', getItemsSchema, async (req) => {
        return await settingService.getItems(req.body)
    })

    routes.role('user').add('setting', 'setItem', setItemSchema, async (req) => {
        return await settingService.setItem(req.body)
    })

    routes.role('user').add('setting', 'setItems', setItemsSchema, async (req) => {
        return await settingService.setItems(req.body)
    })

    routes.role('user').add('setting', 'deleteItem', deleteItemSchema, async (req) => {
        return await settingService.deleteItem(req.body)
    })

    routes.role('user').add('setting', 'deleteItems', deleteItemsSchema, async (req) => {
        return await settingService.deleteItems(req.body)
    })

}
