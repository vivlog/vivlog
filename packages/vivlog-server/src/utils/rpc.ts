/* eslint-disable @typescript-eslint/no-explicit-any */
export function rpc(site: string, https?: boolean) {
    const protocol = https ? 'https' : 'http'
    if (!site.startsWith('http')) {
        site = `${protocol}://${site}`
    }
    return async function <TRes, TReq>(method: string, action: string, payload: TReq, options?: any) {
        if (!options) {
            options = {}
        }
        const { token } = options
        const url = `${site}/api/v1/${method}/${action}`
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
