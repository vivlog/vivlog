import jwt from 'jsonwebtoken'
import { ConfigProvider } from '../../../config'
import { Authenticator, Host, Logger, VirtualUser } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { TokenType, User } from './entities'
import { UserService } from './service'

export type Payload = {
    sub: string // user id, site name
    type: TokenType
}

export class AppPayload {
    private payload: Partial<Payload>
    private constructor() {
    }

    static ofUser(uid: User['id']) {
        const builder = new AppPayload()
        builder.payload = {
            type: TokenType.User,
            sub: uid.toString()
        }
        return this
    }

    static ofSite(site: string) {
        const builder = new AppPayload()
        builder.payload = {
            type: TokenType.Site,
            sub: site
        }
        return this
    }

    build() {
        return this.payload as Payload
    }
}

export class JwtAuthenticator implements Authenticator {

    public userService: UserService
    public config: ConfigProvider
    public logger: Logger
    public secret: string
    constructor(host: Host) {
        lazy(this, 'userService', () => host.container.resolve(UserService.name) as UserService)
        lazy(this, 'config', () => host.container.resolve('config') as ConfigProvider)
        lazy(this, 'logger', () => host.container.resolve('logger') as Logger)
        lazy(this, 'secret', () => this.config.get('jwtSecret') as string)
    }

    async verify(token: string): Promise<VirtualUser | null> {
        try {
            const decoded = jwt.verify(token, this.secret)

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
