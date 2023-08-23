// NOTE: this is a preValidation hook

import { camelCase } from 'change-case'
import { Middleware, exHeadersMap } from '../host/types'

export const transformBodyOptions: Middleware = async (req) => {

    if (!req.body) {
        return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(req.body as any)['__vivlog_options']) {
        return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options = (req.body as any)['__vivlog_options']
    for (const [propName, header] of exHeadersMap) {
        const prop = camelCase(propName)
        if (options[prop] !== undefined) {
            if (typeof options[prop] !== 'string') {
                options[prop] = Buffer.from(JSON.stringify(options[prop])).toString('base64')
            }
            req.headers[header] = options[prop]
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (req.body as any)['__vivlog_options']
}
