import { constantCase } from 'change-case'
import dotenv from 'dotenv'

export function createDotEnvConfigLoader<ConfigType>(configKeys: string[],
    envPrefix: string): () => Partial<ConfigType> {
    return () => {
        const config = Object.create(null)
        const result = dotenv.config()
        if (result.error) {
            return config
        }

        const env = result.parsed
        if (!env) {
            return config
        }
        // TODO: load config items from env
        for (const key of configKeys) {
            const envKey = `${envPrefix}${constantCase(key)}`.toUpperCase()
            if (!env[envKey]) {
                continue
            }
            config[key] = env[envKey]
        }
        return config
    }
}

