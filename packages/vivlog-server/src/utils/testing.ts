import { FastifyInstance } from 'fastify'
import * as fs from 'fs'
import { InjectPayload } from 'light-my-request'
import * as net from 'net'
import { ConfigProvider } from '../config'
import { Host, Logger } from '../host/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function inject(s: Host, module_: string, action: string, payload: InjectPayload, options?: any) {
    const configProvider = s.container.resolve<ConfigProvider>('config')
    const sitePath = configProvider.get('sitePath', '') as string
    const url = `${sitePath}/api/v1/${module_}/${action}`
    const logger = s.container.resolve('logger') as Logger
    logger.debug('inject %s', url)
    return await s.container.resolve<FastifyInstance>('app').inject({
        method: 'POST',
        url: url,
        payload,
        ...options
    })
}

export async function injectWithAuth(s: Host, module_: string, action: string, payload: InjectPayload, token: string) {
    return inject(s, module_, action, payload, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}

export function removeAllFiles(paths: string[]) {
    for (const path of paths) {
        try {
            fs.unlinkSync(path)
        } catch (error) {
            console.warn(`Failed to delete ${path}`)
        }
    }
}

export function removeFile(path: string) {
    try {
        fs.unlinkSync(path)
    } catch (error) {
        console.warn(`Failed to delete ${path}`)
    }
}

const finalizeStack: (() => void)[] = []

export function defer<T>(resource: T, finalizer: (v: T) => void) {
    finalizeStack.push(() => finalizer(resource))
    return resource
}

export async function finalize() {
    console.log('finalize')

    while (finalizeStack.length > 0) {
        const finalizer = finalizeStack.pop()
        if (!finalizer) {
            continue
        }

        try {
            // await for async finalizer
            if (finalizer.constructor.name === 'AsyncFunction') {
                await finalizer()
            } else {
                finalizer()
            }
        } catch (error) {
            console.error('Failed to finalize', error)
        }
    }
}

export async function isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const s = net.createServer()
        s.once('error', () => {
            s.close()
            resolve(false)
        })
        s.once('listening', () => {
            s.close()
            resolve(true)
        })
        s.listen(port)
    })
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getNextAvailablePort(startFrom: number = 20011) {
    for (let port = startFrom; port < 65535; port++) {
        try {
            if (await isPortAvailable(port)) {
                return port
            }
        } catch (error) {
            console.log('skip port', port, error)
        }
    }
    throw new Error('No available port')
}
