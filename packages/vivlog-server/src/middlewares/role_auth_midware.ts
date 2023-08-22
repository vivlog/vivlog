import { FastifyRequest } from 'fastify'
import { GuestInfo, guestInfoValidator } from '../app/extensions/comment/entities'
import { Role } from '../app/types'
import { AgentInfo, AgentType, Authenticator, Middleware, UnauthorizedError } from '../host/types'
import { base64Decode } from '../utils/data'


export function extractToken(req: FastifyRequest) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        throw new UnauthorizedError('no authorization header')
    }

    if (authHeader.indexOf(' ') === -1) {
        return authHeader
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2) {
        throw new UnauthorizedError('invalid authorization header')
    }

    const [scheme, token] = parts
    if (scheme !== 'Bearer') {
        throw new UnauthorizedError('invalid authorization scheme')
    }

    return token
}

export class RoleAuthMiddlewareBuilder {

    constructor(private authenticator: Authenticator) {
    }
    private setupUser: Middleware = async (req) => {
        const token = extractToken(req)
        const user = await this.authenticator.verify(token)
        if (!user) {
            throw new UnauthorizedError('invalid token')
        }
        req.visitor = user
        console.log(`setupUser [${user.username}] for ${req.url}`)
    }

    private trySetupUser: Middleware = async (req, ...args) => {
        try {
            await this.setupUser(req, ...args)
        } catch (err) {
            console.error('trySetupUser error', err)
            // try setup guest user
            const guestBase64 = req.headers['x-vivlog-guest']
            if (!guestBase64) {
                return
            }
            if (typeof guestBase64 !== 'string') {
                throw new Error('invalid guest info, not a string')
            }

            const guest = base64Decode<GuestInfo>(guestBase64)
            if (!guest) {
                throw new Error('invalid guest info, not base64')
            }

            if (!guestInfoValidator.Check(guest)) {
                throw new Error('invalid guest info')
            }
            req.visitor = {
                type: AgentType.Guest,
                role: Role.Agent,
                id: '',
                email: guest.email,
                username: guest.name,
                site: guest.site,
                local: false,
            }
        }
    }
    private _roleCheckCache: Record<string, Middleware> = {}
    // 该方法用于检查用户角色是否满足要求
    private roleCheck: (allowRoles: string[]) => Middleware
        = (allowRoles) => {
            const f: Middleware = async (req) => {
                console.log('roleCheck for ', req.url)
                const { visitor: rawUser } = req
                if (!rawUser) {
                    throw new UnauthorizedError('not logged in')
                }

                const user = rawUser as AgentInfo

                if (allowRoles.length > 0) {
                    if (!allowRoles.includes(user.role)) {
                        throw new Error('Forbidden')
                    }
                }
            }

            const cacheKey = allowRoles.join(',')
            if (!this._roleCheckCache[cacheKey]) {
                this._roleCheckCache[cacheKey] = f
            }

            return this._roleCheckCache[cacheKey]
        }

    // 返回中间件数组
    getMiddlewares(requireLogin: boolean, allowRoles: string[]): Middleware[] {
        const middlewares = []

        if (requireLogin || allowRoles.length > 0) {
            middlewares.push(this.setupUser)
        } else {
            middlewares.push(this.trySetupUser)
        }

        if (allowRoles.length > 0) {
            middlewares.push(this.roleCheck(allowRoles))
        }

        return middlewares
    }
}
