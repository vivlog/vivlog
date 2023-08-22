/* eslint-disable @typescript-eslint/no-explicit-any */
export function rpc(baseUrl: string, https?: boolean) {
    const protocol = https ? 'https' : 'http'
    if (!baseUrl.startsWith('http')) {
        baseUrl = `${protocol}://${baseUrl}`
    }
    return async function <TRes, TReq>(method: string, action: string, payload: TReq, options?: any) {
        if (!options) {
            options = {}
        }
        const { token } = options
        const url = `${baseUrl}/${method}/${action}`
        const headers = {
            'Content-Type': 'application/json',
        } as Record<string, string>

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        })
        if (response && response.status != 200) {
            const body = await response.json()
            throw new Error(body.message)
        }
        const body = await response.json()
        return body.data as TRes
    }
}

export function isLocalhost(site: string) {
    return site === 'localhost' || site.startsWith('localhost:')
}

export function removeHostFromUrl(url: string) {
    return url.replace(/^https?:\/\/[^/]+/, '')
}
