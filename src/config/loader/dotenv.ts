import dotenv from 'dotenv'
import { constantCase } from 'change-case'

export function createDotEnvConfigLoader<ConfigType>(configKeys: string[],
    envPrefix: string) {
    return () => {
        const result = dotenv.config()
        if (result.error) {
            throw result.error
        }

        const env = result.parsed
        if (!env) {
            throw new Error('No env file found')
        }
        // TODO: load config items from env
        const config = Object.create(null)
        for (const key of configKeys) {
            const envKey = `${envPrefix}${constantCase(key)}`.toUpperCase()
            if (!env[envKey]) {
                continue
            }
            config[key] = env[envKey]
        }
        return config as Partial<ConfigType>
    }
}

