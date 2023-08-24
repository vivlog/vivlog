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

    it('should no error if no client version is provided', async () => {
        delete req.headers['x-vivlog-version']
        await verifyVersionCompat(req, res, done)
    })

    it('should throw BadRequestError if client version does not match server version', () => {
        process.env.npm_package_version = '2.0.0'
        assert.rejects(async () => await verifyVersionCompat(req, res, done), BadRequestError)
    })

    it('should no execption if client version matches server version', async () => {
        process.env.npm_package_version = '1.0.0'
        await verifyVersionCompat(req, res, done)
    })
})
