import { Type } from '@sinclair/typebox'
import { Extension, Host } from '../../../host/types'
import { titleCase } from '../../../utils/syntax'
import { Settings } from '../../types'
import { createSettingApi } from './api'
import { Setting, SettingItem } from './entities'
import { SettingService } from './service'

function onActivate(host: Host) {
    host.container.register(SettingService.name, new SettingService(host.container))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    host.container.mutate('SettingService::settingItems', (settingItems: SettingItem<any>[]) => {
        return [
            ...settingItems,
            {
                group: Settings.System._group,
                name: Settings.System.title,
                label: titleCase(Settings.System.title),
                defaultValue: 'Vivlog',
                formItemOptions: {
                    type: 'inline-text',
                },
                schema: Type.String({ minLength: 1, maxLength: 100 }),
                description: '',
            },
            {
                group: Settings.System._group,
                name: Settings.System.description,
                label: titleCase(Settings.System.description),
                defaultValue: 'Another site powered by Vivlog',
                formItemOptions: {
                    type: 'text',
                },
                schema: Type.String({ minLength: 0, maxLength: 300 }),
                description: '',
            },
            {
                group: Settings.System._group,
                name: Settings.System.keywords,
                label: titleCase(Settings.System.keywords),
                defaultValue: ['Vivlog'],
                formItemOptions: {
                    type: 'array-text',
                },
                schema: Type.Array(Type.String({ minLength: 1, maxLength: 20 })),
                description: '',
            }
        ]
    }, [])
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

