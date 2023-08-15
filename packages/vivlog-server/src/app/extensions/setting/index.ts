import { Extension, Host } from '../../../host/types'
import { createSettingApi } from './api'
import { Setting } from './entities'
import { SettingService } from './service'

function onActivate(host: Host) {
    host.container.register(SettingService.name, new SettingService(host.container))
}

function onAllActivated(host: Host) {
    createSettingApi(host)
}

const meta = {
    name: 'setting-module',
    version: '0.0.1-alpha',
    depends: {
        'core': '^0.0.1',
        'user-module': '^0.0.1'
    }
}

const entities = [Setting]

export default {
    onActivate,
    onAllActivated,
    entities,
    meta
} as Extension

