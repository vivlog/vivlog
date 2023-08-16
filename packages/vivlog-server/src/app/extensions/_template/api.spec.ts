import assert from 'assert'
import { describe } from 'mocha'
import { step } from 'mocha-steps'
import { defaultRawConfig } from '../../../config/types'
import { ServerHost } from '../../../host/host'
import { bootstrap } from '../../../server'
import { inject } from '../../../utils/testing'
import { Roles } from '../../types'
import { CombinedSession, createNewSession } from '../../util/testing'

describe.skip('Example API', () => {
    let host: ServerHost
    let sess: CombinedSession
    before(async () => {
        defaultRawConfig.dbPath = ':memory:'
        host = await bootstrap()
    })
    step('create a example while not logged in, expect permission denied', async () => {
        const ret = await inject(host, 'example', 'createExample', {
            title: 'test',
            content: 'test',
        })
        assert.strictEqual(ret.statusCode, 401, ret.body)
    })
    step('create a new admin session', async () => {
        sess = await createNewSession(host, true, [Roles.Admin, Roles.Reader])
    })

    step('create a example', async () => {
        await sess.inject('example', 'createExample', {
            title: 'test',
            content: 'test',
        })

    })

    after(async () => {
        await host.stop()
    })
})
