export class RequestError extends Error {
    response?: Response
    constructor(message: string, response?: Response) {
        super(message)
        this.name = 'RequestError'
        this.response = response
    }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export function rpc(baseUrl: string, https?: boolean) {
    const protocol = https ? 'https' : 'http'
    if (!baseUrl.startsWith('http')) {
        baseUrl = `${protocol}://${baseUrl}`
    }
    return async function <TRes, TReq>(module_: string, action: string, payload: TReq, options?: any) {
        const response = await rpcRaw(baseUrl, https)(module_, action, payload, options)
        if (response && response.status != 200) {
            const body = await response.json()
            throw new RequestError(body.message, response)
        }
        const body = await response.json()
        return body.data as TRes
    }
}

export function rpcRaw(baseUrl: string, https?: boolean) {
    const protocol = https ? 'https' : 'http'
    if (!baseUrl.startsWith('http')) {
        baseUrl = `${protocol}://${baseUrl}`
    }
    return async function <TReq>(module_: string, action: string, payload: TReq, options?: any) {
        if (!options) {
            options = {}
        }
        if (!options.headers) {
            options.headers = {} as Record<string, string>
        }
        const { token, headers } = options
        const url = `${baseUrl}/${module_}/${action}`
        headers['Content-Type'] = 'application/json'
        if (token) {
            headers['authorization'] = `Bearer ${token}`
        }
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        })
        return response // 返回原始的 response
    }
}

export function isLocalhost(site: string) {
    return site === 'localhost' || site.startsWith('localhost:')
}

export function removeHostFromUrl(url: string) {
    return url.replace(/^https?:\/\/[^/]+/, '')
}
