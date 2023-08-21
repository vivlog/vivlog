import { Extension, Host, Logger } from '../../../host/types'
import { createExampleApi } from './api'
import { Example } from './entities'
import { ExampleService } from './service'

function onActivate(host: Host) {
    host.container.register(ExampleService.name, new ExampleService(host.container))
}

function onAllActivated(host: Host) {
    const logger = host.container.resolve('logger') as Logger
    createExampleApi(host)
    logger.info('Example module activated')
}

const meta = {
    name: 'example-module',
    version: '0.0.1-alpha',
    depends: {
        'core': '^0.0.1',
        'user-module': '0.0.1-alpha',
        'setting-module': '0.0.1-alpha'
    }
}

const entities = [Example]

export default {
    onActivate,
    onAllActivated,
    entities,
    meta
} as Extension

