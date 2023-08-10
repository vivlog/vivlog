import { ServerHost } from '../../../host/host'
import { Extension } from '../../../host/types'
import { createSettingApi } from './api'
import { Setting } from './entities'
import { SettingService } from './service'

function onActivate(host: ServerHost) {
    host.container.register(SettingService.name, new SettingService(host.container))
}

function onAllActivated(host: ServerHost) {
    createSettingApi(host)
}

const meta = {
    name: 'setting-module',
    version: '1.0.0-alpha',
    depends: {}
}

const entities = [Setting]

export default {
    onActivate,
    onAllActivated,
    entities,
    meta
} as Extension
