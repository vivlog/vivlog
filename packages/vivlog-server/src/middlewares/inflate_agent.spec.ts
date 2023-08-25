/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert'
import sinon from 'sinon'
import { Role, SourceType } from '../app/types'
import { AgentType, ExHeaders } from '../host/types'
import * as utils from '../utils/data'
import {
    guestAgentInflator,
    siteAgentInflator,
    userAgentInflator
} from './inflate_agent'


describe('userAgentInflator', () => {
    it('should set req.agent for user source type', async () => {
        const userService = { getUser: sinon.stub() }
        userService.getUser.resolves({
            id: 1,
            role: Role.Reader,
            uuid: 'user-uuid',
            email: 'user@example.com',
            username: 'user123',
        })

        const container = { resolve: sinon.stub().returns(userService), register: sinon.stub() }
        const middleware = await userAgentInflator(container)

        const req = {
            source: { type: SourceType.User, sub: '1' },
            headers: {},
            agent: undefined
        }
        await middleware(req as any, {} as any, {} as any)

        assert.deepEqual(req.agent, {
            type: AgentType.User,
            id: '1',
            trusted: true,
            uuid: 'user-uuid',
            local: true,
            email: 'user@example.com',
            username: 'user123',
            role: Role.Reader,
        })
    })

})

describe('siteAgentInflator', () => {
    it('should set req.agent for site source type', async () => {
        const middleware = siteAgentInflator

        const req = {
            source: { type: 'site', sub: 'site-id' },
            headers: {},
            agent: undefined
        }
        await middleware(req as any, {} as any, {} as any)

        assert.deepEqual(req.agent, {
            type: 'site',
            site: 'site-id',
            role: 'agent',
            local: false,
            trusted: false,
        })
    })

})

describe('guestAgentInflator', () => {
    it('should set req.agent for guest source type', async () => {
        const base64DecodeStub = sinon.stub(utils, 'base64Decode').returns({
            email: 'guest@example.com',
            site: 'guest-site',
            name: 'guest123',
        })

        const middleware = guestAgentInflator

        const req = {
            source: null,
            headers: {
                [ExHeaders.Guest]: utils.base64Encode({
                    email: 'guest@example.com',
                    site: 'guest-site',
                    name: 'guest123',
                })
            },
            agent: undefined,
        }

        await middleware(req as any, {} as any, {} as any)

        assert(base64DecodeStub.calledOnce)
        assert.deepEqual(req.agent, {
            email: 'guest@example.com',
            id: undefined,
            local: false,
            role: 'guest',
            site: 'guest-site',
            trusted: false,
            type: 'guest',
            username: 'guest123',
            uuid: undefined,
        })

        base64DecodeStub.restore() // Restore the stubbed function
    })

})
