import { Host } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { RouteHelper } from '../../helper/route_helper'
import { Roles, Settings } from '../../types'
import { SettingService } from '../setting/service'
import { CreateConnectionDto, RequestConnectionDto, ValidateConnectionRequestDto, createConnectionSchema, deleteConnectionSchema, getConnectionSchema, getConnectionsSchema, requestConnectionSchema, validateConnectionRequestSchema } from './entities'
import { ConnectionService } from './service'

/**
 * 1. Admin->LocalSite: createConnection(remote.site)
 * 2.    LocalSite->RemoteSite: requestConnection(local.site, token_local_site)
 * 3.       RemoteSite->LocalSite: validateConnectionRequest(token_local_site, token_remote_site)
 * 4.       LocalSite->RemoteSite: reponse ok
 * 5.    RemoteSite->LocalSite: response ok
 * 6. LocalSite->Admin: response ok
 * 
 * */
export function createConnectionApi(host: Host) {
    const connectionService = host.container.resolve(ConnectionService.name) as ConnectionService
    const settingService = host.container.resolve(SettingService.name) as SettingService

    const module_ = 'connection'
    const routes = host.container.resolve('routes') as RouteHelper
    const cachedValues = {
        'site': null
    } as { [key: string]: Promise<string> | null }

    lazy(cachedValues, 'site', async () => {
        const index = { group: Settings.System._group, name: Settings.System.site }
        return (await settingService.getItem(index))?.value ?? ''
    })

    routes.new().minRole(Roles.Admin).handle(module_, 'createConnection', createConnectionSchema, async (req) => {
        const dto = req.body! as CreateConnectionDto
        return await connectionService.createConnection(dto)
    })

    // routes.new().minRole(Roles.Admin).handle(module_, 'updateConnection', updateConnectionSchema, async (req) => {
    //     return await connectionService.updateConnection(req.body!)
    // })

    routes.new().minRole(Roles.Admin).handle(module_, 'deleteConnection', deleteConnectionSchema, async (req) => {
        return await connectionService.deleteConnection(req.body!)
    })

    routes.new().handle(module_, 'getConnection', getConnectionSchema, async (req) => {
        return await connectionService.getConnection(req.body!)
    })

    routes.new().handle(module_, 'getConnections', getConnectionsSchema, async (req) => {
        return await connectionService.getConnections(req.body!)
    })

    routes.new().handle(module_, 'requestConnection', requestConnectionSchema, async (req) => {
        const dto = req.body! as RequestConnectionDto
        return await connectionService.requestConnection(dto)
    })

    routes.new().handle(module_, 'validateConnectionRequest', validateConnectionRequestSchema, async (req) => {
        const dto = req.body! as ValidateConnectionRequestDto
        return await connectionService.validateConnectionRequest(dto)
    })

}
