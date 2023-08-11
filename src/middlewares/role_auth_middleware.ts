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

    // Auth user and set `req.user`
    private setupUser: () => Middleware
        = () => async (req) => {
            console.log('setupUser for ', req.url)
            const authHeaderValue = req.headers['authorization'] as string | undefined
            if (!authHeaderValue) {
                throw new UnauthorizedError('unauthorized')
            }

            // Remove Bearer
            const parts = authHeaderValue.split(' ')
            if (parts.length !== 2) {
                throw new UnauthorizedError('broken token')
            }

            const user = await this.authenticator.verify(parts[1])
            if (!user) {
                throw new UnauthorizedError('invalid token')
            }
            req.user = user
        }

    // 该方法用于检查用户角色是否满足要求
    private roleCheck: (allowRoles: string[]) => Middleware
        = (allowRoles) => async (req) => {
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

    // 返回中间件数组
    getMiddlewares(requireLogin: boolean, allowRoles: string[]): Middleware[] {
        const middlewares = []

        if (requireLogin || allowRoles.length > 0) {
            middlewares.push(this.setupUser())
        }

        if (allowRoles.length > 0) {
            middlewares.push(this.roleCheck(allowRoles))
        }

        return middlewares
    }
}
