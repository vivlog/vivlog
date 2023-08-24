import { ConnectionDirections } from '../app/extensions/connection/entities'
import { ConnectionService } from '../app/extensions/connection/service'
import { DefaultContainer } from '../container'
import { BadRequestError, ExHeaders, Middleware } from '../host/types'
import { isLocalhost } from '../utils/network'

export const verifyTarget: (container: DefaultContainer) => Middleware = (container: DefaultContainer) => {
    const connectionService = container.resolve(ConnectionService.name) as ConnectionService
    return async (req) => {
        let targetSite = req.headers[ExHeaders.TargetSite]
        if (!targetSite) {
            return
        }

        if (typeof targetSite !== 'string') {
            return
        }

        targetSite = targetSite.trim()

        if (!targetSite) {
            return
        }

        const connection = await connectionService.getConnection({ remote_site: targetSite })

        if (!connection) {
            throw new BadRequestError('connection not found')
        }

        if (connection.direction === ConnectionDirections.Incoming) {
            throw new BadRequestError('connection is incoming, cannot be used as target')
        }

        req.target = {
            schema: isLocalhost(targetSite) ? 'http' : 'https',
            site: targetSite,
            apiPath: connection.options.api_path ?? '/api',
            token: connection.remote_token
        }
    }
}
