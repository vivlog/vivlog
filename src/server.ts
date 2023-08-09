import 'reflect-metadata'
import { loadExtensions } from './host/extension'
import { ServerHost } from './host/host'
import { config } from './config'
import { builtinExtensions } from './app/extensions'
import { Container } from './container'
import fastify from 'fastify'
import { DataSource } from 'typeorm'
import { Extension } from './host/types'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import pino from 'pino'

const logger = pino({
    transport: {
        target: 'pino-pretty'
    },
    level: 'debug',
})

export default (async () => {
    try {
        const externalExtensions = await loadExtensions(config.extensionDir)
        const exts: Extension[] = [...externalExtensions, ...builtinExtensions]
        const app = fastify().withTypeProvider<TypeBoxTypeProvider>()
        const entities = exts.map(i => i.entities || []).flat()
        console.info('entities', entities)
        const db = new DataSource({
            type: 'sqlite',
            database: 'db.sqlite',
            entities,
            synchronize: true
        })
        const container = new Container()
        const server = new ServerHost(
            exts,
            db,
            app,
            logger,
            container
        )
        await server.start()
        return server
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
})()
