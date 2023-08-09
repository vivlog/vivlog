import { describe } from 'mocha'
import server from '../../../server'
import { ServerHost } from '../../../host/host'
import assert from 'assert'

describe('Users API', () => {
    let s: ServerHost
    before(async () => {
        s = await server
    })

    it('should register user', async () => {
        assert(s.db.isInitialized, 'db is not initialized')
        const ret = await s.app.inject({
            method: 'POST',
            url: '/auth/registerUser',
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

    after(async () => {
        await s.stop()
    })
})
