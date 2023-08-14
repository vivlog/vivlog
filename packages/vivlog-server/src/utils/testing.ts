import { FastifyInstance } from 'fastify'
import { InjectPayload } from 'light-my-request'
import { Host } from '../host/types'

export async function inject(s: Host, module: string, action: string, payload: InjectPayload) {
    return await s.container.resolve<FastifyInstance>('app').inject({
        method: 'POST',
        url: `/${module}/${action}`,
        payload
    })
}

export async function injectWithAuth(s: Host, module: string, action: string, payload: InjectPayload, token: string) {
    return await s.container.resolve<FastifyInstance>('app').inject({
        method: 'POST',
        url: `/${module}/${action}`,
        payload,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}
