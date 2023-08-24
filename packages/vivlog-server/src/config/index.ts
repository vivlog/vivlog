import { ConfigType } from './types'

export function validateConfig(config: ConfigType) {
    if (!config.jwtSecret) {
        throw new Error('jwtSecret is required')
    }
}

export class ConfigProvider {

    constructor(private config: ConfigType) {
    }

    get(key: keyof ConfigType, defaultValue?: ConfigType[keyof ConfigType] | undefined) {
        const value = this.config[key]
        return value !== undefined ? value : defaultValue
    }

}
