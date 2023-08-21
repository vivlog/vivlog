/* eslint-disable @typescript-eslint/no-explicit-any */

import { FastifyReply, FastifyRequest } from 'fastify'
import { Role } from '../app/types'
import { Container } from '../container'
declare module 'fastify' {
    interface FastifyRequest {
        visitor?: Visitor
    }
}

export type Done = (err?: Error) => void
export type Middleware = (req: FastifyRequest, res: FastifyReply, done: Done) => void

export interface Host {
    container: Container
}

export type Logger = {
    debug: (...args: any[]) => void
    info: (...args: any[]) => void
    warn: (...args: any[]) => void
    error: (...args: any[]) => void
    trace: (...args: any[]) => void
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

export enum VisitorType {
    Guest = 'guest',
    User = 'user',
    Site = 'site',
}

export interface Visitor {
    type: `${VisitorType}`
    role: `${Role}`
    id?: string
    site?: string
    uuid?: string
    local: boolean
    email?: string
    username?: string
}

export interface Authenticator {
    verify(token: string): Promise<Visitor | null>
}
