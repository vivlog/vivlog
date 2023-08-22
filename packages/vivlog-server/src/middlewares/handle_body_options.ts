// NOTE: this is a preValidation hook

import { camelCase } from 'change-case'
import { Middleware, exHeaderPrefix, exHeadersList } from '../host/types'

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
    for (const headerRaw of exHeadersList) {
        const prop = camelCase(headerRaw)
        if (options[prop]) {
            if (typeof options[prop] !== 'string') {
                options[prop] = Buffer.from(JSON.stringify(options[prop])).toString('base64')
            }
            req.headers[`${exHeaderPrefix}-${headerRaw}`] = options[prop]
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (req.body as any)['__vivlog_options']
}
