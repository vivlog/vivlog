import assert from 'assert'
import * as jwt from 'jsonwebtoken'
import { describe } from 'mocha'
import { step } from 'mocha-steps'
import { defaultRawConfig } from '../../../config/types'
import { ServerHost } from '../../../host/host'
import { bootstrap } from '../../../server'
import { inject } from '../../../utils/testing'
import { Roles } from '../../types'
import { AppJwtPayload, UserDto } from './entities'

describe('Users API', () => {
    let s: ServerHost
    before(async () => {
        defaultRawConfig.dbPath = ':memory:'
        s = await bootstrap()
    })

    step('register first user, should be admin', async () => {
        const ret = await inject(s, 'user', 'registerUser', {
            username: 'test',
            email: 'test@example.com',
            password: 'test'
        })
        assert.strictEqual(ret.statusCode, 200, ret.body)
        const data = ret.json()
        const token = data.data.token
        assert(token.length > 0, 'token should not be empty')
        const user = data.data.user as UserDto
        assert(user.id > 0)
        assert.strictEqual(user.username, 'test')
        assert.strictEqual(user.role, Roles.Admin)
    })

    step('register another user, should be non-admin', async () => {
        const ret = await inject(s, 'user', 'registerUser', {
            username: 'test2',
            email: 'test2@example.com',
            password: 'test2'
        })
        assert.strictEqual(ret.statusCode, 200, ret.body)
        const data = ret.json()
        const token = data.data.token
        assert(token.length > 0, 'token should not be empty')
        const user = data.data.user as UserDto
        assert(user.id > 0)
        assert.strictEqual(user.username, 'test2')
        assert.notEqual(user.role, Roles.Admin)

        const decoded = jwt.verify(token, defaultRawConfig.jwtSecret) as AppJwtPayload
        assert.strictEqual(decoded.sub, user.id.toString())
    })

    step('login user', async () => {
        const ret = await inject(s, 'user', 'loginUser', {
            username: 'test',
            password: 'test'
        })
        assert.strictEqual(ret.statusCode, 200, ret.body)
        const data = ret.json()
        assert.strictEqual(data.data.user.username, 'test')
        assert(data.data.user.id > 0)
        assert(data.data.token.length > 0)
        const decoded = jwt.verify(data.data.token, defaultRawConfig.jwtSecret) as AppJwtPayload
        assert.strictEqual(decoded.sub, data.data.user.id.toString())
        console.log('decoded', decoded)

    })

    after(async () => {
        await s.stop()
    })
})
