import assert from 'assert'
import { describe } from 'mocha'
import { step } from 'mocha-steps'
import { defaultRawConfig } from '../../../config/types'
import { ServerHost } from '../../../host/host'
import { bootstrap } from '../../../server'
import { inject } from '../../../utils/testing'
import { AdminSession, createNewAdminSession } from '../../util/testing'

describe('Posts API', () => {
    let host: ServerHost
    let sess: AdminSession
    before(async () => {
        defaultRawConfig.dbPath = ':memory:'
        host = await bootstrap()
    })
    step('create a post while not logged in', async () => {
        const ret = await inject(host, 'post', 'createPost', {
            title: 'test',
            content: 'test'
        })
        assert.strictEqual(ret.statusCode, 403)
    })
    step('create a new admin session', async () => {
        sess = await createNewAdminSession(host)
    })

    step('create a post', async () => {
        const ret = await sess.inject('post', 'createPost', {
            title: 'test',
            content: 'test'
        })
        assert.strictEqual(ret.statusCode, 200)
        const data = JSON.parse(ret.body)
        assert.strictEqual(data.data.id, 1)
        assert.strictEqual(data.data.title, 'test')
        assert.strictEqual(data.data.content, 'test')
    })

    after(async () => {
        await host.stop()
    })
})
