/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from 'chai'
import { FastifyReply, FastifyRequest } from 'fastify'
import sinon from 'sinon'
import { ExHeaders } from '../host/types'
import { transformBodyOptions } from './handle_body_options'

describe('handleBodyOptions', () => {
    it('should handle body options correctly', async () => {
        const req = {
            body: {
                __vivlog_options: {
                    token: 'testToken',
                    version: 'testVersion',
                    requestId: 'testRequestId',
                    forwardedRequestId: 'testForwardedRequestId',
                    targetSite: 'testTargetSite',
                    forwardedTargetSite: 'testForwardedTargetSite',
                    guest: { test: 'test1' },
                    forwardedGuest: { test: 'test2' },
                    exceptionalObject: { test: 'test3' },
                },
            },
            headers: {},
        } as unknown as FastifyRequest

        const res = {} as FastifyReply
        const done = sinon.spy()

        await transformBodyOptions(req, res, done)

        expect(req.headers[ExHeaders.Token]).to.equal('testToken')
        expect(req.headers[ExHeaders.Version]).to.equal('testVersion')
        expect(req.headers[ExHeaders.RequestId]).to.equal('testRequestId')
        expect(req.headers[ExHeaders.ForwardedRequestId]).to.equal('testForwardedRequestId')
        expect(req.headers[ExHeaders.TargetSite]).to.equal('testTargetSite')
        expect(req.headers[ExHeaders.ForwardedTargetSite]).to.equal('testForwardedTargetSite')
        expect(req.headers[ExHeaders.Guest]).to.equal(Buffer.from(JSON.stringify({ test: 'test1' })).toString('base64'))
        expect(req.headers[ExHeaders.ForwardedGuest]).to.equal(Buffer.from(JSON.stringify({ test: 'test2' })).toString('base64'))
        expect(req.headers['x-vivlog-exceptional-object']).to.be.undefined
        expect((req.body as any)).to.not.have.property('__vivlog_options')
        sinon.assert.notCalled(done)
    })
})
