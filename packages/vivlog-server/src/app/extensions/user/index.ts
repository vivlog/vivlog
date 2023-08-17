import { Extension, Host } from '../../../host/types'
import { createUserApi } from './api'
import { User } from './entities'
import { UserService } from './service'

function onActivate(host: Host) {
    host.container.register(UserService.name, new UserService(host.container))
}

function onAllActivated(host: Host) {
    createUserApi(host)
}

const meta = {
    name: 'user-module',
    version: '0.0.1-alpha',
    depends: {
        'core': '^0.0.1',
        'setting': '^0.0.1'
    }
}

const entities = [User]

export default {
    onActivate,
    onAllActivated,
    entities,
    meta
} as Extension

