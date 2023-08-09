import { ServerHost } from '../../../host/host'
import { createUserApi } from './api'
import { User } from './entities'
import { UserService } from './service'

function setup(host: ServerHost) {
    host.container.register(UserService.name, new UserService(host.container))
    createUserApi(host)
}

const meta = {
    name: 'user-module',
    version: '1.0.0-alpha',
    depends: {}
}

const entities = [User]

export default {
    setup,
    entities,
    meta
}

