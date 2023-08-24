import jwt from 'jsonwebtoken'
import { ConfigProvider } from '../../../config'
import { AgentInfo, AgentType, Authenticator, Host, Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { Payload, Role, Settings, SourceType, payloadValidator, rolePriorities } from '../../types'
import { SettingService } from '../setting/service'
import { UserService } from './service'


export class JwtAuthenticator implements Authenticator {

    public userService: UserService
    public settingService: SettingService
    public config: ConfigProvider
    public logger: Logger
    public secret: string

    // TODO: this should be implemented outside of this class
    private payloadHandlers: Record<SourceType, (payload: Payload) => Promise<AgentInfo | null>> = {
        [SourceType.User]: async (payload) => {
            const uid = parseInt(payload.sub)
            const user = await this.userService.getUser({ id: uid })
            if (!user) {
                return null
            }
            const site = await this.settingService.getValue<string>(Settings.System._group, Settings.System.site)
            if (!Object.keys(rolePriorities).includes(user.role)) {
                throw new Error('invalid role')
            }
            return {
                type: AgentType.User,
                id: user.id.toString(),
                site: site,
                uuid: user.uuid,
                local: true,
                email: user.email,
                username: user.username,
                role: user.role as Role,
            }
        },
        [SourceType.Site]: async (payload) => {
            const site = payload.sub
            return {
                type: AgentType.Site,
                site: site,
                uuid: site,
                local: true,
                role: 'admin',
            }
        }
    }
    constructor(host: Host) {
        lazy(this, 'userService', () => host.container.resolve(UserService.name) as UserService)
        lazy(this, 'settingService', () => host.container.resolve(SettingService.name) as SettingService)
        lazy(this, 'config', () => host.container.resolve('config') as ConfigProvider)
        lazy(this, 'logger', () => host.container.resolve('logger') as Logger)
        lazy(this, 'secret', () => this.config.get('jwtSecret') as string)
    }

    async setPayloadHandler(type: SourceType, handler: (payload: Payload) => Promise<AgentInfo | null>) {
        this.payloadHandlers[type] = handler
    }

    async verify(token: string): Promise<AgentInfo | null> {
        try {
            const decoded = jwt.verify(token, this.secret)
            if (!payloadValidator.Check(decoded)) {
                throw new Error('invalid token, payload is bad format')
            }
            const payload = decoded as Payload
            if (!this.payloadHandlers[payload.type]) {
                throw new Error('invalid token, payload type is not supported')
            }
            return this.payloadHandlers[payload.type](payload)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            this.logger.error('verify token failed: %s', err.message)
            return null
        }
    }

}
