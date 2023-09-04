import assert from 'assert'
import { Host } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { RouteHelper } from '../../helper/route_helper'
import { Role, Settings } from '../../types'
import { SettingService } from '../setting/service'
import { UserService } from '../user/service'
import { CreateStorageDto, createStorageSchema, deleteStorageSchema, getStorageSchema, getStoragesSchema, updateStorageSchema } from './entities'
import { StorageService } from './service'


export function createStorageApi(host: Host) {
    const storageService = host.container.resolve(StorageService.name) as StorageService
    const userService = host.container.resolve(UserService.name) as UserService
    const settingService = host.container.resolve(SettingService.name) as SettingService

    const routes = host.container.resolve('routes') as RouteHelper
    const cachedValues = {
        'site': undefined
    } as { [key: string]: Promise<string> | undefined }

    lazy(cachedValues, 'site', async () => {
        const index = { group: Settings.System._group, name: Settings.System.site }
        return (await settingService.getItem(index))?.value ?? ''
    })

    routes.new().minRole(Role.Author).handle('storage', 'createStorage', createStorageSchema, async (req) => {
        const dto = req.body! as CreateStorageDto
        assert(req.agent?.id, 'user id is not defined')
        const user = await userService.getUser({ id: parseInt(req.agent!.id) })
        assert(user !== null)
        dto.site = await cachedValues['site'] as string
        assert(dto.site)
        dto.author_site = await cachedValues['site'] as string
        assert(dto.author_site)
        dto.author_uuid = user!.uuid
        return await storageService.createStorage(dto)
    })

    routes.new().minRole(Role.Author).handle('storage', 'updateStorage', updateStorageSchema, async (req) => {
        return await storageService.updateStorage(req.body!)
    })

    routes.new().minRole(Role.Author).handle('storage', 'deleteStorage', deleteStorageSchema, async (req) => {
        return await storageService.deleteStorage(req.body!)
    })

    routes.new().handle('storage', 'getStorage', getStorageSchema, async (req) => {
        return await storageService.getStorage(req.body!)
    })

    routes.new().handle('storage', 'getStorages', getStoragesSchema, async (req) => {
        return await storageService.getStorages(req.body!)
    })
}
