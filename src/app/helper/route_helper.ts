import { TSchema } from '@sinclair/typebox'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { RpcRequest } from '../../host/host'
import { Host, Logger, UnauthorizedError } from '../../host/types'
import { lazy } from '../../utils/lazy'
import { UserDto } from '../extensions/user/entities'

export interface Authenticator {
    verify(token: string): Promise<UserDto | null>
}

type Next = (err?: Error) => void
type Middleware = (req: FastifyRequest, res: FastifyReply, next: Next) => void
declare module 'fastify' {
    interface FastifyRequest {
        user?: UserDto
    }
}

class RouteBuilder {
    private allowRoles: string[] = []
    private requireLogin_: boolean = false
    private logger: Logger
    private app: FastifyInstance
    private authenticator: Authenticator

    constructor(private host: Host) {
        lazy(this, 'logger', () => this.host.container.resolve('logger') as Logger)
        lazy(this, 'app', () => this.host.container.resolve('app') as FastifyInstance)
        lazy(this, 'authenticator', () => this.host.container.resolve('authenticator') as Authenticator)
    }

    roles(roles: string[]) {
        this.allowRoles = roles
        return this
    }

    requireLogin() {
        this.requireLogin_ = true
        return this
    }

    private createPreHandlers() {
        const setupUser: Middleware = async (req, res, next) => {
            const token = req.headers['authorization'] as string | undefined
            if (!token) {
                throw new UnauthorizedError('unauthorized')
            }

            // Remove Bearer
            const tokenParts = token.split(' ')
            if (tokenParts.length !== 2) {
                throw new UnauthorizedError('broken token')
            }

            const user = await this.authenticator.verify(token)
            if (!user) {
                throw new UnauthorizedError('invalid token')
            }
            req.context.user = user
            next()
        }

        const roleCheck: Middleware = async (req, res, next) => {
            const { user: rawUser } = req
            if (!rawUser) {
                throw new UnauthorizedError('not logged in')
            }

            const user = rawUser as UserDto

            if (this.allowRoles.length > 0) {
                if (!this.allowRoles.includes(user.role)) {
                    throw new Error('Forbidden')
                }
            }
            next()
        }

        const ret = []
        if (this.requireLogin_ || this.allowRoles.length > 0) {
            ret.push(setupUser)
        }
        if (this.allowRoles.length > 0) {
            ret.push(roleCheck)
        }
        return ret
    }

    build<T extends TSchema>(module: string, action: string, schema: T, handler: (req: RpcRequest<T>) => any) {
        this.logger.debug('add route %s.%s', module, action)
        this.app.route({
            method: 'POST',
            schema: {
                body: schema
            },
            url: `/${module}/${action}`,
            preHandler: this.createPreHandlers(),
            handler: async (req: RpcRequest<T>, res) => {
                const ret = await handler(req)
                res.send({
                    data: ret
                })
            }
        })
    }
}

export class RouteHelper {
    constructor(private host: Host) {
    }

    prepare() {
        return new RouteBuilder(host)
    }
}
