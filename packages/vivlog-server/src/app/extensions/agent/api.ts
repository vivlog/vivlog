import { assert } from 'console'
import { Host } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { RouteHelper } from '../../helper/route_helper'
import { Role, Settings } from '../../types'
import { SettingService } from '../setting/service'
import { UserService } from '../user/service'
import { CreateAgentDto, ProxyRequestQueryDto, createAgentSchema, deleteAgentSchema, getAgentSchema, getAgentsSchema, proxyRequestQuerySchema, updateAgentSchema } from './entities'
import { AgentService } from './service'


export function createAgentApi(host: Host) {
    const agentService = host.container.resolve(AgentService.name) as AgentService
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

    routes.new().minRole(Role.Author).handle('agent', 'createAgent', createAgentSchema, async (req) => {
        const dto = req.body! as CreateAgentDto
        const user = await userService.getUser({ id: parseInt(req.agent!.id!) })
        assert(user !== null)
        dto.site = await cachedValues['site'] as string
        assert(dto.site)
        dto.author_site = await cachedValues['site'] as string
        assert(dto.author_site)
        dto.author_uuid = user!.uuid
        return await agentService.createAgent(dto)
    })

    routes.new().minRole(Role.Author).handle('agent', 'updateAgent', updateAgentSchema, async (req) => {
        return await agentService.updateAgent(req.body!)
    })

    routes.new().minRole(Role.Author).handle('agent', 'deleteAgent', deleteAgentSchema, async (req) => {
        return await agentService.deleteAgent(req.body!)
    })

    routes.new().handle('agent', 'getAgent', getAgentSchema, async (req) => {
        return await agentService.getAgent(req.body!)
    })

    routes.new().handle('agent', 'getAgents', getAgentsSchema, async (req) => {
        return await agentService.getAgents(req.body!)
    })

    routes.new().minRole(Role.Author).handleWithQuery('agent', 'proxyRequest', proxyRequestQuerySchema, updateAgentSchema, async (req) => {
        const { endpoint, site } = (req.query as ProxyRequestQueryDto)
        console.log('endpoint', endpoint, site)

        return null
    })
}
