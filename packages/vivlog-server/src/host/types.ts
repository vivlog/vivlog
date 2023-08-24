/* eslint-disable @typescript-eslint/no-explicit-any */

import { FastifyReply, FastifyRequest } from 'fastify'
import { Payload, Role } from '../app/types'
import { DefaultContainer } from '../container'
declare module 'fastify' {
    interface FastifyRequest {
        source?: Payload
        agent?: AgentInfo
        target?: Target // target site to forward request
        requestId?: string
    }
}

export type Done = (err?: Error) => void
export type Middleware = (req: FastifyRequest, res: FastifyReply, done: Done) => Promise<void>

export interface Host {
    container: DefaultContainer
}

export type Logger = {
    debug: (...args: any[]) => void
    info: (...args: any[]) => void
    warn: (...args: any[]) => void
    error: (...args: any[]) => void
    trace: (...args: any[]) => void
    child: (options: Record<string, unknown>) => Logger
}

export const consoleLogger: Logger = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
    trace: console.trace,
    child: () => consoleLogger,
}

export interface Extension {
    meta: {
        name: string
        version: string
        depends: Record<string, string>
    }
    onActivate?: (host: Host) => void
    onAllActivated?: (host: Host) => void
    onDeactivate?: (host: Host) => void
    onAllDeactivated?: (host: Host) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entities?: any[]
    // allow for query entities from other extensions
    exposedEntities?: string[]
}

export class BadRequestError extends Error {
    statusCode = 400
    code = 'BAD_REQUEST'
    constructor(message: string) {
        super(message)
    }
}

export class UnauthorizedError extends Error {
    statusCode = 401
    code = 'UNAUTHORIZED'
    constructor(message: string) {
        super(message)
    }
}

export class ForbiddenError extends Error {
    statusCode = 403
    code = 'FORBIDDEN'
    constructor(message: string) {
        super(message)
    }
}

export class NotFoundError extends Error {
    statusCode = 404
    code = 'NOT_FOUND'
    constructor(message: string) {
        super(message)
    }
}

export enum AgentType {
    Guest = 'guest',
    User = 'user',
    Site = 'site',
}

export interface AgentInfo {
    email?: string
    id?: string
    local: boolean
    role: `${Role}`
    site?: string
    trusted?: boolean // trusted always means the agent is a logged in user from the same site
    type: `${AgentType}`
    username?: string
    uuid?: string
}

export interface Target {
    schema: string
    site: string
    apiPath: string
    token: string
}

export function createTargetBaseUrl(target: Target) {
    return `${target.schema}://${target.site}${target.apiPath}`
}

export interface Authenticator {
    verify(token: string): Promise<AgentInfo | null>
}

export const exHeaderPrefix = 'x-vivlog'

export enum ExHeaders {
    Token = `${exHeaderPrefix}-token`,
    Version = `${exHeaderPrefix}-version`,
    RequestId = `${exHeaderPrefix}-request-id`,
    ForwardedRequestId = `${exHeaderPrefix}-forwarded-request-id`,
    TargetSite = `${exHeaderPrefix}-target-site`,
    ForwardedTargetSite = `${exHeaderPrefix}-forwarded-target-site`,
    Guest = `${exHeaderPrefix}-guest`,
    ForwardedGuest = `${exHeaderPrefix}-forwarded-guest`,
}

export const exHeadersMap = (() => {
    const map = new Map<string, ExHeaders>()
    for (const key in ExHeaders) {
        const value = ExHeaders[key as keyof typeof ExHeaders]
        map.set(key, value)
    }
    return map
})()
