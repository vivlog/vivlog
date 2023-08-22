import assert from 'assert'
import { FastifyReply, FastifyRequest } from 'fastify'
import sinon from 'sinon'
import { BadRequestError } from '../host/types'
import { verifyVersionCompat } from './verify_version_compat'

describe('versionCompatChecker middleware', () => {
    let req: FastifyRequest
    let res: FastifyReply
    let done: sinon.SinonSpy

    beforeEach(() => {
        req = {
            headers: {
                'x-vivlog-version': '1.0.0',
            },
        } as unknown as FastifyRequest

        res = {} as FastifyReply

        done = sinon.spy()
    })

    it('should call done() if no client version is provided', () => {
        delete req.headers['x-vivlog-version']
        verifyVersionCompat(req, res, done)
        assert(done.calledOnce)
    })

    it('should throw BadRequestError if client version does not match server version', () => {
        process.env.npm_package_version = '2.0.0'
        assert.throws(() => verifyVersionCompat(req, res, done), BadRequestError)
    })

    it('should call done() if client version matches server version', () => {
        process.env.npm_package_version = '1.0.0'
        verifyVersionCompat(req, res, done)
        assert(done.calledOnce)
    })
})
