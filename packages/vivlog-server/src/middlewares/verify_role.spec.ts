/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert'
import { UnauthorizedError } from '../host/types'
import { verifyRole } from './verify_role'

describe('verifyRole', () => {
    let req = {} as any

    beforeEach(() => {
        // Mock request
        req = {
            agent: {
                role: 'admin',
            },
        }
    })

    it('should allow access if user has the correct role', async () => {
        const middleware = verifyRole(['admin', 'user'])
        await assert.doesNotReject(middleware(req as any, {} as any, {} as any))
    })

    it('should throw UnauthorizedError if user is not logged in', async () => {
        delete req.agent
        const middleware = verifyRole(['admin', 'user'])
        await assert.rejects(middleware(req as any, {} as any, {} as any), UnauthorizedError)
    })

    it('should throw Error if user does not have the correct role', async () => {
        req.agent.role = 'guest'
        const middleware = verifyRole(['admin', 'user'])
        await assert.rejects(middleware(req as any, {} as any, {} as any), Error)
    })

    it('should allow access if no roles are specified', async () => {
        const middleware = verifyRole([])
        await assert.doesNotReject(middleware(req as any, {} as any, {} as any))
    })
})
