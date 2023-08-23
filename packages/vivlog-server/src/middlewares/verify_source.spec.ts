/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai'
import { FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { PayloadBuilder } from '../app/types'
import { extractAppToken, extractBearerToken, verifySource } from './verify_source'

describe('verifySource', () => {
    const secret = 'testSecret'
    const validToken = jwt.sign(PayloadBuilder.ofUser(1), secret)
    const invalidToken = jwt.sign({ foo: 'bar' }, 'wrongSecret')

    it('should set source to decoded token if token is valid', async () => {
        const req = {
            headers: {
                authorization: `Bearer ${validToken}`
            },
            source: null
        } as any

        await verifySource(secret)(req, null as any, null as any)

        expect(req.source.sub).to.deep.equal('1')
    })

    it('should throw error if token is invalid', async () => {
        const req = {
            headers: {
                authorization: `Bearer ${invalidToken}`
            },
            source: null
        } as any

        try {
            await verifySource(secret)(req, null as any, null as any)
        } catch (error) {
            expect((error as Error).message).to.equal('invalid signature')
        }
    })
})

describe('extractBearerToken', () => {
    it('should return null if no authorization header', () => {
        const req = {
            headers: {}
        } as FastifyRequest

        const token = extractBearerToken(req)

        expect(token).to.be.null
    })

})

describe('extractAppToken', () => {
    it('should return null if no token header', () => {
        const req = {
            headers: {}
        } as FastifyRequest

        const token = extractAppToken(req)

        expect(token).to.be.null
    })

})
