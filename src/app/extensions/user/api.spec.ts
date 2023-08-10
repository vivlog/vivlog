import assert from 'assert'
import * as jwt from 'jsonwebtoken'
import { describe } from 'mocha'
import { step } from 'mocha-steps'
import { defaultRawConfig } from '../../../config/types'
import { ServerHost } from '../../../host/host'
import { bootstrap } from '../../../server'
import { inject } from '../../../utils/testing'
import { AppJwtPayload } from './entities'

describe('Users API', () => {
    let s: ServerHost
    before(async () => {
        defaultRawConfig.dbPath = ':memory:'
        s = await bootstrap()
    })

    step('register user', async () => {
        const ret = await inject(s, 'user', 'registerUser', {
            username: 'test',
            password: 'test'
        })
        assert.strictEqual(ret.statusCode, 200)
        const data = JSON.parse(ret.body)
        assert.strictEqual(data.data.username, 'test')
        assert(data.data.id > 0)
    })

    step('login user', async () => {
        const ret = await inject(s, 'user', 'loginUser', {
            username: 'test',
            password: 'test'
        })
        assert.strictEqual(ret.statusCode, 200)
        const data = JSON.parse(ret.body)
        assert.strictEqual(data.data.user.username, 'test')
        assert(data.data.user.id > 0)
        assert(data.data.token.length > 0)
        const decoded = jwt.verify(data.data.token, 'secret') as AppJwtPayload
        assert.strictEqual(decoded.sub, data.data.user.id.toString())
        console.log('decoded', decoded)

    })

    after(async () => {
        await s.stop()
    })
})
