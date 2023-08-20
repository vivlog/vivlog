import { FastifyReply, FastifyRequest } from 'fastify'
import { AuthedUser, Authenticator, UnauthorizedError } from '../host/types'

type Done = (err?: Error) => void
type Middleware = (req: FastifyRequest, res: FastifyReply, done: Done) => void

declare module 'fastify' {
    interface FastifyRequest {
        user?: AuthedUser
    }
}


export class RoleAuthMiddleware {

    constructor(private authenticator: Authenticator) {
    }
    private setupUser: Middleware = async (req) => {
        const authHeaderValue = req.headers['authorization'] as string | undefined
        if (!authHeaderValue) {
            throw new UnauthorizedError('unauthorized')
        }

        // Remove Bearer
        const parts = authHeaderValue.split(' ')
        let token = ''
        if (parts.length !== 2) {
            token = authHeaderValue
        } else {
            token = parts[1]
        }

        const user = await this.authenticator.verify(token)
        if (!user) {
            throw new UnauthorizedError('invalid token')
        }
        req.user = user
        console.log(`setupUser [${user.username}] for ${req.url}`)
    }

    private trySetupUser: Middleware = async (...args) => {
        try {
            await this.setupUser(...args)
        } catch (err) {
            console.debug('user not set for ', args[0].url)
        }
    }

    private _roleCheckCache: Record<string, Middleware> = {}
    // 该方法用于检查用户角色是否满足要求
    private roleCheck: (allowRoles: string[]) => Middleware
        = (allowRoles) => {
            const f: Middleware = async (req) => {
                console.log('roleCheck for ', req.url)
                const { user: rawUser } = req
                if (!rawUser) {
                    throw new UnauthorizedError('not logged in')
                }

                const user = rawUser as AuthedUser

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
