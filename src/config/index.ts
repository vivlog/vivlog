import { debug } from 'console'
import { loadRawConfig } from './loader'
import { RawConfig, configKeys, defaultRawConfig } from './types'

export function validateConfig(config: RawConfig) {
    debug('validateConfig', config)
    if (!config.extensionDir) {
        throw new Error('extensionDir is required')
    }
}

export function setupConfig(config: RawConfig) {
    debug('config', config)

    return config
}

export const config = setupConfig(loadRawConfig({
    appName: 'bits',
    emptyConfig: defaultRawConfig,
    configKeys,
    validator: validateConfig
}))
