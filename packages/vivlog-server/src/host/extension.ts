import { debug } from 'console'
import * as fs from 'fs'
/**
 * load all plugins from a directory, without any dependency resolution or validation
 */
export function loadExtensions(pluginDir: string | undefined) {
    if (!pluginDir || !fs.existsSync(pluginDir)) {
        return []
    }
    const promises = fs.readdirSync(pluginDir).filter((file: string) => {
        return fs.statSync(`${pluginDir}/${file}`).isDirectory()
    }).map(async (file: string) => {
        const p = await import(`${pluginDir}/${file}/index.js`)
        debug('load plugin', p.default.meta)
        return p.default
    })
    return Promise.all(promises)
}
