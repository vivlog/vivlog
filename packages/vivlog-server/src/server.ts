import cors from '@fastify/cors'
import fastify from 'fastify'
import 'reflect-metadata'

import pino from 'pino'

import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { DataSource } from 'typeorm'
import { builtinExtensions } from './app/extensions'
import { ConfigProvider, validateConfig } from './config'
import { loadRawConfig } from './config/loader'
import { configKeys, defaultRawConfig } from './config/types'
import { Container } from './container'
import { loadExtensions } from './host/extension'
import { ServerHost } from './host/host'
import { Extension, Logger } from './host/types'
import { parseBool } from './utils/data'

// set backtrace size
Error.stackTraceLimit = 100


export function createLogger(config: ConfigProvider): Logger {
    const loggerConfig = config.get('logger', 'pino')!
    if (loggerConfig == 'pino') {
        return pino({
            transport: {
                target: 'pino-pretty'
            },
            level: config.get('logLevel'),
            sync: true
        })
    }
    return console
}


export async function bootstrap() {

    const config = new ConfigProvider(loadRawConfig({
        appName: 'vivlog',
        emptyConfig: defaultRawConfig,
        configKeys,
        validator: validateConfig
    }))
    const logger = createLogger(config)
    logger.debug('logLevel %s', config.get('logLevel'))

    try {
        const externalExtensions = await loadExtensions(config.get('extensionDir'))
        const exts: Extension[] = [...externalExtensions, ...builtinExtensions]
        const app = fastify().withTypeProvider<TypeBoxTypeProvider>().register(cors, {
            origin: '*',
        })
        const entities = exts.map(i => i.entities || []).flat()
        console.info('entities', entities)
        const db = new DataSource({
            type: 'sqlite',
            database: config.get('dbPath', 'db.sqlite')!,
            entities,
            logging: parseBool(config.get('logQuery', 'false')) ? ['query', 'error'] : [],
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
