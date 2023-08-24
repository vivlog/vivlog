import assert from 'assert'
import { describe } from 'mocha'
import { step } from 'mocha-steps'
import { defaultRawConfig } from '../../../config/types'
import { ServerHost } from '../../../host/host'
import { bootstrap } from '../../../server'
import { inject } from '../../../utils/testing'
import { Role } from '../../types'
import { CombinedSession, createNewSession } from '../../util/testing'

describe.skip('Agent API', () => {
    let host: ServerHost
    let sess: CombinedSession
    before(async () => {
        defaultRawConfig.dbPath = ':memory:'
        host = await bootstrap()
    })
    step('create a agent while not logged in, expect permission denied', async () => {
        const ret = await inject(host, 'agent', 'createAgent', {
            title: 'test',
            content: 'test',
        })
        assert.strictEqual(ret.statusCode, 401, ret.body)
    })
    step('create a new admin session', async () => {
        sess = await createNewSession(host, true, [Role.Admin, Role.Reader])
    })

    step('create a agent', async () => {
        await sess.inject('agent', 'createAgent', {
            title: 'test',
            content: 'test',
        })

    })

    after(async () => {
        await host.stop()
    })
})
