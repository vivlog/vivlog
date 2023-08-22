import { ConnectionService } from '../app/extensions/connection/service'
import { Container } from '../container'
import { BadRequestError, ExHeaders, Middleware } from '../host/types'

export const verifyTarget: (container: Container) => Middleware = (container: Container) => {
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

        req.target = targetSite
    }
}
