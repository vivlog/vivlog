/* eslint-disable @typescript-eslint/no-explicit-any */

import { Container } from '../container'

export interface Host {
    container: Container
}

export type Logger = {
    debug: (...args: any[]) => void
    info: (...args: any[]) => void
    warn: (...args: any[]) => void
    error: (...args: any[]) => void
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

export interface AuthedUser {
    id: string
    username: string
    role: string
}
export interface Authenticator {
    verify(token: string): Promise<AuthedUser | null>
}
