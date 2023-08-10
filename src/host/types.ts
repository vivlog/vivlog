/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Host {

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
