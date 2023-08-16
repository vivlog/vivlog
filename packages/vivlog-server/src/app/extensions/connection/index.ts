import { Extension, Host, Logger } from '../../../host/types'
import { createConnectionApi } from './api'
import { Connection } from './entities'
import { ConnectionService } from './service'

function onActivate(host: Host) {
    host.container.register(ConnectionService.name, new ConnectionService(host.container))
}

function onAllActivated(host: Host) {
    const logger = host.container.resolve('logger') as Logger
    createConnectionApi(host)
    logger.info('Connection module activated')
}

const meta = {
    name: 'connection-module',
    version: '0.0.1-alpha',
    depends: {
        'core': '^0.0.1',
        'user-module': '0.0.1-alpha',
        'setting-module': '0.0.1-alpha'
    }
}

const entities = [Connection]

export default {
    onActivate,
    onAllActivated,
    entities,
    meta
} as Extension

