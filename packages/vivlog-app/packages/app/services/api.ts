export let baseUrl = 'http://localhost:9000/api/v1'
export let token = ''

export function setBaseUrl(url: string) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1)
    }
    baseUrl = url
}

export function getBaseUrl() {
    return baseUrl
}

export async function setToken(t: string) {
    console.log('setToken', t)
    token = t
}

export function getToken() {
    console.log('getToken', token)
    return token
}

export class RequestError extends Error {
    details?: ErrRes
    constructor(message: string, details?: ErrRes) {
        super(message)
        this.name = 'RequestError'
        this.details = details
    }
}

export async function fetchApi(url, options) {
    if (!options) {
        options = {}
    }

    if (!options.headers) {
        options.headers = {}
    }

    if (token) {
        options.headers['Authorization'] = token
    }

    const resp = await fetch(`${baseUrl}${url}`, {
        ...options,
        headers: {
            ...options.headers,
        },
    })

    if (resp.status !== 200) {
        const eres = (await resp.json()) as unknown as ErrRes
        throw new RequestError(eres.message, eres)
    }

    return (await resp.json()).data
}


export function rpcRequest(module_: string, action: string, payload, options) {
    if (!options) {
        options = {}
    }
    console.log('rpcRequest', module_, action, payload, options)

    return fetchApi(`/${module_}/${action}`, {
        method: 'POST',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: JSON.stringify({
            ...payload,
            ...options.body,
        }),
    })
}

export type RegisterDto = {
    username: string
    password: string
};

export type LoginDto = {
    username: string
    password: string
};

export type LoginRes = {
    token: string
    user: {
        id: number
        username: string
    }
}

export type ErrRes = {
    code:string
    message:string
    error: string
    statusCode: number
}

export type RegisterRes = LoginRes

export type RespWrapper<T> = {
    data: T
};

export const auth = {
    registerUser: (dto: RegisterDto, options?) => rpcRequest('user', 'registerUser', dto, options),
    loginUser: (dto: LoginDto, options?) => rpcRequest('user', 'loginUser', dto, options),
}

export const post = {
    getPosts: (options?) => rpcRequest('post', 'getPosts', {}, options),
}
