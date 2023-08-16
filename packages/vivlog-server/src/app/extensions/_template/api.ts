import { assert } from 'console'
import { Host } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { RouteHelper } from '../../helper/route_helper'
import { Roles, Settings } from '../../types'
import { SettingService } from '../setting/service'
import { UserService } from '../user/service'
import { CreateExampleDto, createExampleSchema, deleteExampleSchema, getExampleSchema, getExamplesSchema, updateExampleSchema } from './entities'
import { ExampleService } from './service'


export function createExampleApi(host: Host) {
    const exampleService = host.container.resolve(ExampleService.name) as ExampleService
    const userService = host.container.resolve(UserService.name) as UserService
    const settingService = host.container.resolve(SettingService.name) as SettingService

    const routes = host.container.resolve('routes') as RouteHelper
    const cachedValues = {
        'site': null
    } as { [key: string]: Promise<string> | null }

    lazy(cachedValues, 'site', async () => {
        const index = { group: Settings.System._group, name: Settings.System.site }
        return (await settingService.getItem(index))?.value ?? ''
    })

    routes.new().minRole(Roles.Author).handle('example', 'createExample', createExampleSchema, async (req) => {
        const dto = req.body! as CreateExampleDto
        assert(req.user?.id, 'user id is not defined')
        const user = await userService.getUser({ id: parseInt(req.user!.id) })
        assert(user !== null)
        dto.site = await cachedValues['site'] as string
        assert(dto.site !== '')
        dto.author_site = await cachedValues['site'] as string
        dto.author_uuid = user!.uuid
        return await exampleService.createExample(dto)
    })

    routes.new().minRole(Roles.Author).handle('example', 'updateExample', updateExampleSchema, async (req) => {
        return await exampleService.updateExample(req.body!)
    })

    routes.new().minRole(Roles.Author).handle('example', 'deleteExample', deleteExampleSchema, async (req) => {
        return await exampleService.deleteExample(req.body!)
    })

    routes.new().handle('example', 'getExample', getExampleSchema, async (req) => {
        return await exampleService.getExample(req.body!)
    })

    routes.new().handle('example', 'getExamples', getExamplesSchema, async (req) => {
        return await exampleService.getExamples(req.body!)
    })
}
