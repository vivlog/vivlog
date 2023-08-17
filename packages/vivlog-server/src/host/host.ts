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
import { Container } from '../container'
import { Extension, Host, Logger } from './types'

export type RpcRequest<T extends TSchema> = FastifyRequest<{
    Body?: Static<T>
}>

export class ServerHost implements Host {

    public extensions: Extension[]
    public sitePath: string
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
        this.container.register('routes', new RouteHelper(this, rolePriorities))
        this.container.register('logger', this.logger)
        this.container.register('config', this.config)
        this.container.register('authenticator', new JwtAuthenticator(this))

        this.extensions = this.setupExtensions(extensions)
        this.sitePath = this.config.get('sitePath', '')!
        this.logger.info('sitePath: %s', this.sitePath)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.app.post(`${this.sitePath}/api/v1/status/ready`, (_req, _res) => {
            return { data: true }
        })

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
