import { createDotEnvConfigLoader } from './dotenv'

export interface LoadOptions<RawConfigType extends Record<string, string>> {
    appName: string
    emptyConfig: RawConfigType
    configKeys: string[]
    validator: (config: RawConfigType) => void
}

export function loadRawConfig<RawConfigType extends Record<string, string>>(options: LoadOptions<RawConfigType>): RawConfigType {
    const loaders = [
        createDotEnvConfigLoader<RawConfigType>(options.configKeys, `${options.appName}_`)
    ]
    const config: RawConfigType = options.emptyConfig
    for (const loader of loaders) {
        const loaded = loader()
        Object.assign(config, loaded)
    }
    options.validator(config)
    return config
}
