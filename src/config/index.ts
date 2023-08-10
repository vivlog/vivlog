import { debug } from 'console'
import { ConfigType } from './types'

export function validateConfig(config: ConfigType) {
    // if (!config.extensionDir) {
    //     throw new Error('extensionDir is required')
    // }
}

export class ConfigProvider {

    constructor(private config: ConfigType) {
    }

    get(key: keyof ConfigType, defaultValue: ConfigType[keyof ConfigType] | undefined = undefined) {
        return this.config[key] || defaultValue
    }

}
