import { Type } from '@sinclair/typebox'
import { RpcRequest } from '../../../host/host'
import { Host } from '../../../host/types'
import { RouteHelper } from '../../helper/route_helper'
import { Role, Settings } from '../../types'
import { deleteItemSchema, deleteItemsSchema, getItemSchema, getItemsSchema, getSchemaSchema, initSettingsSchema, setItemSchema, setItemsSchema } from './entities'
import { SettingService } from './service'


export function createSettingApi(host: Host) {
    const settingService = host.container.resolve(SettingService.name) as SettingService
    const routes = host.container.resolve('routes') as RouteHelper

    const module_ = 'setting'

    routes.new()
        .handle(module_, 'initSettings', initSettingsSchema, async (req: RpcRequest<typeof initSettingsSchema>) => {
            return await settingService.initSettings(req.body!)
        })

    routes.new()
        .handle(module_, 'getPublicItems', getItemSchema, async (req) => {
            return await settingService.getPublicItems(req.body!)
        })

    routes.new()
        .handle(module_, 'getSystemInfo', Type.Any(), async () => {
            return await settingService.getPublicItems({ group: Settings.System._group })
        })

    routes.new().minRole(Role.Reader)
        .handle(module_, 'getItem', getItemSchema, async (req) => {
            return await settingService.getItem(req.body!)
        })

    routes.new().minRole(Role.Admin)
        .handle(module_, 'getItems', getItemsSchema, async (req) => {
            return await settingService.getItems(req.body!)
        })

    routes.new().minRole(Role.Admin)
        .handle(module_, 'setItem', setItemSchema, async (req) => {
            return await settingService.setItem(req.body!)
        })

    routes.new().minRole(Role.Admin)
        .handle(module_, 'setItems', setItemsSchema, async (req) => {
            return await settingService.setItems(req.body!)
        })

    routes.new().minRole(Role.Admin)
        .handle(module_, 'deleteItem', deleteItemSchema, async (req) => {
            return await settingService.deleteItem(req.body!)
        })

    routes.new().minRole(Role.Admin)
        .handle(module_, 'deleteItems', deleteItemsSchema, async (req) => {
            return await settingService.deleteItems(req.body!)
        })

    routes.new().minRole(Role.Admin)
        .handle(module_, 'getSchema', getSchemaSchema, async (req) => {
            return await settingService.getSchema(req.body!)
        })
}
