import { TSchema } from '@sinclair/typebox'
import { FastifyInstance } from 'fastify'
import { ConfigProvider } from '../../config'
import { RpcRequest } from '../../host/host'
import { Authenticator, Host, Logger } from '../../host/types'
import { RoleAuthMiddleware } from '../../middlewares/role_auth_middleware'
import { lazy } from '../../utils/lazy'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcHandler<T extends TSchema> = (req: RpcRequest<T>) => any
class RoleBasedRpcRouteBuilder {
    private allowRoles_: string[] = []
    private requireLogin_: boolean = false
    private logger: Logger
    private app: FastifyInstance
    private authenticator: Authenticator
    private roleAuth: RoleAuthMiddleware
    private config: ConfigProvider
    private sitePath: string = '' // for site that is not running at root path
    private apiPath: string = '' // for site that is not running at root path

    constructor(private host: Host, private rolePriorityMap: { [role: string]: number }) {
        lazy(this, 'logger', () => this.host.container.resolve('logger') as Logger)
        lazy(this, 'app', () => this.host.container.resolve('app') as FastifyInstance)
        lazy(this, 'authenticator', () => this.host.container.resolve('authenticator') as Authenticator)
        lazy(this, 'roleAuth', () => new RoleAuthMiddleware(this.authenticator))
        lazy(this, 'config', () => this.host.container.resolve('config') as ConfigProvider)
        lazy(this, 'sitePath', () => this.config.get('sitePath') as string)
        lazy(this, 'apiPath', () => this.config.get('apiPath') as string)
    }

    allowRoles(roles: string[]) {
        this.allowRoles_.push(...roles)
        return this
    }

    allowRole(role: string) {
        this.allowRoles_.push(role)
        return this
    }

    minRole(role: string) {
        if (!this.rolePriorityMap) {
            throw new Error('rolePriorityMap is not set')
        }
        if (!this.rolePriorityMap[role]) {
            throw new Error(`role ${role} is not in rolePriorityMap`)
        }
        if (this.allowRoles_.length > 0) {
            throw new Error('allowRoles is already set')
        }
        this.allowRoles_ = Object.keys(this.rolePriorityMap).filter(r => this.rolePriorityMap[r] >= this.rolePriorityMap[role])
        return this
    }

    requireLogin() {
        this.requireLogin_ = true
        return this
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handle<T extends TSchema>(module_: string, action: string, bodySchema: T, handler: (req: RpcRequest<T>) => any) {
        this.handleWithQuery(module_, action, bodySchema, undefined, handler)
    }




    handleWithQuery<T extends TSchema>(
        module_: string,
        action: string,
        bodySchema: TSchema | undefined,
        querySchema: TSchema | undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: RpcHandler<T>) {
        const url = `${this.sitePath}${this.apiPath}/${module_}/${action}`
        this.app.route({
            method: 'POST',
            schema: {
                ...(bodySchema ? { body: bodySchema } : {}),
                ...(querySchema ? { querystring: querySchema } : {})
            },
            url,
            preHandler: this.roleAuth.getMiddlewares(this.requireLogin_,
                this.allowRoles_),
            handler: async (req: RpcRequest<T>, res) => {
                this.logger.info('rpc %s.%s', module_, action)
                const ret = await handler(req)
                res.send({
                    data: ret
                })
            }
        })
    }
}

export class RouteHelper {
    constructor(private host: Host, private rolePriorityMap: { [role: string]: number }) {
    }

    new() {
        return new RoleBasedRpcRouteBuilder(this.host, this.rolePriorityMap)
    }
}
