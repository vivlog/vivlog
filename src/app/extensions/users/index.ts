import { ServerHost } from '../../../host/host'
import { createUserApi } from './api'
import { User } from './entities'
import { UserService } from './service'

function onActivate(host: ServerHost) {
    host.container.register(UserService.name, new UserService(host.container))
}

function onAllActivated(host: ServerHost) {
    createUserApi(host)
}

const meta = {
    name: 'user-module',
    version: '1.0.0-alpha',
    depends: {}
}

const entities = [User]

export default {
    onActivate,
    onAllActivated,
    entities,
    meta
}

