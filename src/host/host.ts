/* eslint-disable @typescript-eslint/no-explicit-any */
import { Static, TSchema } from '@sinclair/typebox'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { DataSource } from 'typeorm'
import { ConfigProvider } from '../config'
import { Container } from '../container'
import { topoSort } from '../utils/algorithms'
import { Extension, Host, Logger } from './types'

export type RpcRequest<T extends TSchema> = FastifyRequest<{
    Body: Static<T>
}>

export class ServerHost implements Host {

    public extensions: Extension[]
    constructor(
        extensions: Extension[],
        public db: DataSource,
        public app: FastifyInstance,
        public logger: Logger,
        public config: ConfigProvider,
        public container: Container
    ) {

        this.container.register('host', this)
        this.container.register('db', this.db)
        this.container.register('app', this.app)
        this.container.register('logger', this.logger)
        this.container.register('config', this.config)
        this.extensions = this.setupExtensions(extensions)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.app.get('/health', (_req, _res) => {
            return { status: 'ok' }
        })
        this.app.setErrorHandler((error, request, reply) => {
            if (error.statusCode == 500) {
                this.logger.error('error: %o', error)
            }
            reply.send(error)
        })
    }

    setupExtensions(extensions: Extension[]): Extension[] {
        const retExtensions =
            topoSort(extensions,
                i => extensions[i].meta.name,
                i => Object.keys(extensions[i].meta.depends)
            ).map(i => extensions[i])
        // TODO: version compatibility check
        retExtensions.forEach((e) => {
            this.logger.debug('setup extension %s', e.meta.name)
            e.onActivate?.(this)
        })
        retExtensions.forEach((e) => {
            e.onAllActivated?.(this)
        })
        return retExtensions
    }

    addRoute<T extends TSchema>(module: string, action: string, schema: T, handler: (req: RpcRequest<T>) => any) {
        this.logger.debug('add route %s.%s', module, action)
        this.app.route({
            method: 'POST',
            schema: {
                body: schema
            },
            url: `/${module}/${action}`,
            handler: async (req: RpcRequest<T>, res) => {
                const ret = await handler(req)
                res.send({
                    data: ret
                })
            }
        })
    }

    async start() {
        if (this.db.isInitialized) {
            this.logger.warn('db is initialized')
        }
        await this.db.initialize()
        const addr = await this.app.listen({
            port: parseInt(this.config.get('port', '9000')!),
        })
        this.logger.debug('server started at %s', addr)
    }

    async stop() {
        this.logger.debug('stop server')
        await this.app.close()
        await this.db.destroy()
    }
}
