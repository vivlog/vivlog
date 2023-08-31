import { CommentDto, CreateCommentDto, Post, Resource } from 'app/typing/entities'

/* eslint-disable @typescript-eslint/no-explicit-any */
export let baseUrl = 'http://192.168.1.2:9000/api'
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
        options.headers['authorization'] = token
    }

    let resp
    try {
        resp = await fetch(`${baseUrl}${url}`, {
            ...options,
            headers: {
                ...options.headers,
            },
        })
    } catch (error) {
        console.log('fetchApi error', error)
        throw new Error('Network error')
    }

    if (resp.status !== 200) {
        const eres = (await resp.json()) as unknown as ErrRes
        throw new RequestError(eres.message, eres)
    }

    return (await resp.json()).data
}


export async function rpcRequest(module_: string, action: string, payload, options?: any) {
    if (!options) {
        options = {}
    }
    console.log('rpcRequest', module_, action, payload, options)

    const res = await fetchApi(`/${module_}/${action}`, {
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
    console.log('rpcRequest res', res)
    return res
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
    code: string
    message: string
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

export type PostsResp = {
    posts: Post[]
    total?: number
}

export const post = {
    getPosts: (options?) => rpcRequest('post', 'getPosts', {}, options) as Promise<PostsResp>,
    getPost: (uuid: string, options?) => rpcRequest('post', 'getPost', { uuid }, options) as Promise<Post>,
    browsePosts: (options?) => rpcRequest('post', 'browsePosts', {}, options) as Promise<PostsResp>,
    syncPosts: (options?) => rpcRequest('post', 'syncPosts', {}, options),
}

export const comment = {
    getComment: ({ type, uuid }: { type: string; uuid: string }, options?) => rpcRequest('comment', 'getComment', { type, uuid }, options),
    getComments: ({ resource }: { resource: Resource }, options?) => rpcRequest('comment', 'getComments', { resource }, options) as Promise<{ comments: CommentDto[] }>,
    createComment: (dto: CreateCommentDto, options?) => rpcRequest('comment', 'createComment', dto, options),
}
