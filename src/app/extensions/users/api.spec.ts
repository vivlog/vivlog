import { describe } from 'mocha'
import { bootstrap } from '../../../server'
import { ServerHost } from '../../../host/host'
import assert from 'assert'
import { defaultRawConfig } from '../../../config/types'
import { step } from 'mocha-steps'
import * as jwt from 'jsonwebtoken'
import { AppJwtPayload } from './entities'

describe('Users API', () => {
    let s: ServerHost
    before(async () => {
        defaultRawConfig.dbPath = ':memory:'
        s = await bootstrap()
    })

    step('register user', async () => {
        const ret = await s.app.inject({
            method: 'POST',
            url: '/user/registerUser',
            payload: {
                username: 'test',
                password: 'test'
            }
        })
        assert.strictEqual(ret.statusCode, 200)
        const data = JSON.parse(ret.body)
        assert.strictEqual(data.data.username, 'test')
        assert(data.data.id > 0)
    })

    step('login user', async () => {
        const ret = await s.app.inject({
            method: 'POST',
            url: '/user/loginUser',
            payload: {
                username: 'test',
                password: 'test'
            }
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
