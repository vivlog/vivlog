import { Extension, Host, Logger } from '../../../host/types'
import { createStorageApi } from './api'
import { Storage } from './entities'
import { StorageService } from './service'

function onActivate(host: Host) {
    host.container.register(StorageService.name, new StorageService(host.container))
}

function onAllActivated(host: Host) {
    const logger = host.container.resolve('logger') as Logger
    createStorageApi(host)
    logger.info('Storage module activated')
}

const meta = {
    name: 'storage-module',
    version: '0.0.1-alpha',
    depends: {
        'core': '^0.0.1',
        'user-module': '0.0.1-alpha',
        'setting-module': '0.0.1-alpha'
    }
}

const entities = [Storage]

export default {
    onActivate,
    onAllActivated,
    entities,
    meta
} as Extension

