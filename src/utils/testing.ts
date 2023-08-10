import { InjectPayload } from 'light-my-request'
import { ServerHost } from '../host/host'

export async function inject(s: ServerHost, module: string, action: string, payload: InjectPayload) {
    return await s.app.inject({
        method: 'POST',
        url: `/${module}/${action}`,
        payload
    })
}
