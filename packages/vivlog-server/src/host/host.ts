/* eslint-disable @typescript-eslint/no-explicit-any */
import { Static, TSchema } from '@sinclair/typebox'
import assert from 'assert'
import { FastifyInstance, FastifyRequest } from 'fastify'
import * as semver from 'semver'
import { DataSource } from 'typeorm'
import { JwtAuthenticator } from '../app/extensions/user/authenticator'
import { RouteHelper } from '../app/helper/route_helper'
import { rolePriorities } from '../app/types'
import { ConfigProvider } from '../config'
import { DefaultContainer } from '../container'
import { transformBodyOptions } from '../middlewares/handle_body_options'
import { handleRequestId } from '../middlewares/handle_request_id'
import { inflateAgent } from '../middlewares/inflate_agent'
import { proxyRequest } from '../middlewares/proxy_request'
import { verifySource } from '../middlewares/verify_source'
import { verifyTarget } from '../middlewares/verify_target'
import { verifyVersionCompat } from '../middlewares/verify_version_compat'
import { Extension, Host, Logger, Middleware } from './types'

export type RpcRequest<T extends TSchema> = FastifyRequest<{
    Body?: Static<T>
}>

export class ServerHost implements Host {

    public extensions: Extension[]
    public sitePath: string
    public apiPath: string
    constructor(
        extensions: Extension[],
        public db: DataSource,
        public app: FastifyInstance,
        public logger: Logger,
        public config: ConfigProvider,
        public container: DefaultContainer
    ) {

        this.container.register('host', this)
        this.container.register('db', this.db)
        this.container.register('app', this.app)
        this.container.register('routes', new RouteHelper(this, rolePriorities))
        this.container.register('logger', this.logger)
        this.container.register('config', this.config)
        this.container.register('authenticator', new JwtAuthenticator(this))

        this.extensions = this.setupExtensions(extensions)
        this.sitePath = this.config.get('sitePath')!
        this.apiPath = this.config.get('apiPath')!
        this.logger.info('sitePath: %s', this.sitePath)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.app.post(`${this.sitePath}${this.apiPath}/status/ready`, (_req, _res) => {
            return { data: true }
        })
        this.setupPrehandlers()

        // access log
        this.app.addHook('onRequest', (request, reply, done) => {
            this.logger.info('[%s] %s', request.method, request.url)
            done()
        })
        this.app.setErrorHandler((error, request, reply) => {
            if (error.statusCode == 500) {
                this.logger.error('error: %o', error)
            }
            reply.send(error)
        })
    }

    private setupPrehandlers() {
        const prehandlers = {
            'handleRequestId': handleRequestId,
            'verifyVersionCompat': verifyVersionCompat,
            'transformBodyOptions': transformBodyOptions,
            'verifySource': verifySource(this.config.get('jwtSecret')!),
            'verifyTarget': verifyTarget(this.container),
            'inflateAgent': inflateAgent(this.container),
            'proxyRequest': proxyRequest(this.container),
        } as Record<string, Middleware>

        for (const name in prehandlers) {
            const handler = prehandlers[name]
            this.logger.debug('register prehandler %s', name)
            this.app.addHook('preHandler', (...args) => {
                this.logger.debug('prehandler %s', name)
                return handler(...args)
            })
        }
    }

    setupExtensions(extensions: Extension[]): Extension[] {
        const coreVersion = process.env.npm_package_version
        const coreName = process.env.npm_package_name
        assert(coreVersion !== undefined)
        this.logger.info(`core version: ${coreName} ${coreVersion}`)

        // check core version
        extensions.forEach(e => {
            const meta = e.meta
            if (!('core' in meta.depends)) {
                new Error(`'core' should be in the dependencies of '${meta.name}', but the dependencies are ${JSON.stringify(meta.depends)}`)
            }
            if (!semver.satisfies(coreVersion, meta.depends.core)) {
                throw new Error(`core version ${coreVersion} does not satisfy ${meta.depends.core}`)
            }
        })

        // const extensions =
        //     topoSort(extensions,
        //         i => extensions[i].meta.name,
        //         i => Object.keys(omit(extensions[i].meta.depends, ['core']))
        //     ).map(i => extensions[i])
        // TODO: version compatibility check
        extensions.forEach((e) => {
            this.logger.debug('notify activate of %s', e.meta.name)
            e.onActivate?.(this)
        })
        extensions.forEach((e) => {
            this.logger.debug('notify all activated to %s', e.meta.name)
            e.onAllActivated?.(this)
        })
        return extensions
    }

    async start() {
        if (this.db.isInitialized) {
            this.logger.warn('db is initialized')
        }
        this.logger.debug('initialize db')
        await this.db.initialize()
        this.logger.debug('initialize db done')
        const port = this.config.get('port', '9000')!
        this.logger.debug('try to listen on port %s', port)
        const addr = await this.app.listen({
            host: '::',
            port: parseInt(port),
        })
        this.logger.info('server started at %s', addr)
    }

    async stop() {
        this.logger.debug('stop server')
        await this.app.close()
        await this.db.destroy()
    }
}
