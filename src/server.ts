import 'reflect-metadata'
import fastify from 'fastify'
import pino from 'pino'

import { builtinExtensions } from './app/extensions'
import { ConfigProvider, validateConfig } from './config'
import { Container } from './container'
import { DataSource } from 'typeorm'
import { defaultRawConfig, configKeys } from './config/types'
import { Extension } from './host/types'
import { loadExtensions } from './host/extension'
import { loadRawConfig } from './config/loader'
import { ServerHost } from './host/host'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'


export async function bootstrap() {
    const logger = pino({
        transport: {
            target: 'pino-pretty'
        },
        level: 'debug',
    })

    const config = new ConfigProvider(loadRawConfig({
        appName: 'vivlog',
        emptyConfig: defaultRawConfig,
        configKeys,
        validator: validateConfig
    }))

    try {
        const externalExtensions = await loadExtensions(config.get('extensionDir'))
        const exts: Extension[] = [...externalExtensions, ...builtinExtensions]
        const app = fastify().withTypeProvider<TypeBoxTypeProvider>()
        const entities = exts.map(i => i.entities || []).flat()
        console.info('entities', entities)
        const db = new DataSource({
            type: 'sqlite',
            database: config.get('dbPath', 'db.sqlite')!,
            entities,
            synchronize: true
        })
        const container = new Container()
        const server = new ServerHost(
            exts,
            db,
            app,
            logger,
            config,
            container
        )
        await server.start()
        return server
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

if (require.main === module) {
    bootstrap()
}
