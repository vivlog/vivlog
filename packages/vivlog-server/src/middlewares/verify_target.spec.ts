/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert'
import sinon from 'sinon'
import { ConnectionDirections } from '../app/extensions/connection/entities'
import { ConnectionService } from '../app/extensions/connection/service'
import { DefaultContainer } from '../container'
import { BadRequestError, ExHeaders } from '../host/types'
import { verifyTarget } from './verify_target'

describe('verifyTarget', () => {
    let container: DefaultContainer,
        connectionService: sinon.SinonStubbedInstance<ConnectionService>,
        req: any,
        res: any,
        done: any

    beforeEach(() => {
        // Mock dependencies
        container = new DefaultContainer()
        connectionService = sinon.createStubInstance(ConnectionService)
        container.register(ConnectionService.name, connectionService)

        // Mock request
        req = {
            headers: {
                [ExHeaders.TargetSite]: 'targetSite',
            },
        }
    })

    it('should verify the target site correctly', async () => {
        connectionService.getConnection.resolves({
            direction: ConnectionDirections.Outgoing,
            options: { api_path: '/api' },
            remote_token: 'token',
            remote_site: 'targetSite',
            id: 1,
            created_at: new Date(),
            updated_at: new Date(),
            active_at: new Date()
        })

        await verifyTarget(container)(req, res, done)

        assert.deepStrictEqual(req.target, {
            schema: 'https',
            site: 'targetSite',
            apiPath: '/api',
            token: 'token',
        })
    })

    it('should throw BadRequestError if connection is not found', async () => {
        connectionService.getConnection.resolves(null)

        await assert.rejects(verifyTarget(container)(req, res, done), BadRequestError)
    })

    it('should throw BadRequestError if connection is incoming', async () => {
        connectionService.getConnection.resolves({
            direction: ConnectionDirections.Incoming,
            options: { api_path: '/api' },
            remote_token: 'token',
            remote_site: 'targetSite',
            id: 1,
            created_at: new Date(),
            updated_at: new Date(),
            active_at: new Date()
        })

        await assert.rejects(verifyTarget(container)(req, res, done), BadRequestError)
    })

    it('should not throw an error if target site is not specified', async () => {
        req.headers[ExHeaders.TargetSite] = ''

        await assert.doesNotReject(verifyTarget(container)(req, res, done))
    })
})
