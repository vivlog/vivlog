import { FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { payloadValidator } from '../app/types'
import { BadRequestError, ExHeaders, Middleware, UnauthorizedError } from '../host/types'

export const verifySource: (secret: string) => Middleware
    = (jwtSecret: string) => async (req) => {
        const tokenGetters = [extractAppToken, extractBearerToken]

        let token: string | null = null
        for (const getter of tokenGetters) {
            token = getter(req)
            if (token) {
                break
            }
        }

        if (!token) {
            return
        }

        let decoded

        try {
            decoded = jwt.verify(token, jwtSecret)
        } catch (error ) {
            throw new UnauthorizedError('invalid token: ' + (error as Error).message)
        }

        if (!payloadValidator.Check(decoded)) {
            throw new BadRequestError('invalid token, payload is bad format')
        }

        req.source = decoded
    }

export function extractBearerToken(req: FastifyRequest): string | null {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return null
    }

    if (authHeader.indexOf(' ') === -1) {
        return authHeader
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2) {
        return null
    }

    const [scheme, token] = parts
    if (scheme !== 'Bearer') {
        return null
    }

    return token
}

export function extractAppToken(req: FastifyRequest) {
    const token = req.headers[ExHeaders.Token]
    if (!token) {
        return null
    }

    if (typeof token !== 'string') {
        return null
    }

    return token
}
