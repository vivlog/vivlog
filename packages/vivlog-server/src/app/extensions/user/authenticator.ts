import jwt from 'jsonwebtoken'
import { ConfigProvider } from '../../../config'
import { AuthedUser, Authenticator, Host, Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { UserService } from './service'
export class JwtAuthenticator implements Authenticator {

    private userService: UserService
    private config: ConfigProvider
    private logger: Logger
    constructor(host: Host) {
        lazy(this, 'userService', () => host.container.resolve(UserService.name) as UserService)
        lazy(this, 'config', () => host.container.resolve('config') as ConfigProvider)
        lazy(this, 'logger', () => host.container.resolve('logger') as Logger)
    }

    async verify(token: string): Promise<AuthedUser | null> {
        try {
            const decoded = jwt.verify(token, this.config.get('jwtSecret', 'secret')!)

            if (!decoded || !decoded.sub || typeof decoded.sub !== 'string') {
                throw new Error('invalid token')
            }

            const user = await this.userService.getUser({ id: parseInt(decoded.sub) })

            if (!user) {
                throw new Error('user not found')
            }

            return {
                id: user.id.toString(),
                username: user.username,
                role: user.role,
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            this.logger.error('verify token failed: %s', err.message)
            return null
        }
    }

}
