import { Extension, Host, Logger } from '../../../host/types'
import { createAgentApi } from './api'
import { Agent } from './entities'
import { AgentService } from './service'

function onActivate(host: Host) {
    host.container.register(AgentService.name, new AgentService(host.container))
}

function onAllActivated(host: Host) {
    const logger = host.container.resolve('logger') as Logger
    createAgentApi(host)
    logger.info('Agent module activated')
}

const meta = {
    name: 'agent-module',
    version: '0.0.1-alpha',
    depends: {
        'core': '^0.0.1',
        'user-module': '0.0.1-alpha',
        'setting-module': '0.0.1-alpha'
    }
}

const entities = [Agent]

export default {
    onActivate,
    onAllActivated,
    entities,
    meta
} as Extension

