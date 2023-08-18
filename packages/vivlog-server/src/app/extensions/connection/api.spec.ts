import assert from 'assert'
import { describe } from 'mocha'
import { step } from 'mocha-steps'
import { ServerHost } from '../../../host/host'
import { defer, finalize, removeFile } from '../../../utils/testing'
import { Roles } from '../../types'
import { CombinedSession, createNewSession, createSite } from '../../util/testing'
import { ConnectionDirections, ConnectionDto, CreateConnectionDto } from './entities'


describe('Connection API', () => {
    let siteName1: string, siteName2: string
    let host1: ServerHost, host2: ServerHost
    let sess1: CombinedSession, sess2: CombinedSession

    before(async () => {
        const host1ret = await createSite({
            name: 'site1',
            dbPath: defer('host_site1.db', removeFile),
            sitePath: '/site1'
        })
        host1 = defer(host1ret.host, h => h.stop())
        siteName1 = host1ret.siteName
        const host2ret = await createSite({
            name: 'site2',
            dbPath: defer('host_site2.db', removeFile),
            sitePath: '/site2'
        })
        host2 = defer(host2ret.host, h => h.stop())
        siteName2 = host2ret.siteName

        assert.notEqual(host1, host2)
        assert.notEqual(host1.app, host2.app)
        assert.notEqual(host1.config.get('port'), host2.config.get('port'))
        assert.notEqual(host1.config.get('dbPath'), host2.config.get('dbPath'))
        assert.notEqual(host1.config.get('sitePath'), host2.config.get('sitePath'))
    })

    step('create admin sessions', async () => {
        sess1 = await createNewSession(host1, false, [Roles.Admin, Roles.Reader])
        sess2 = await createNewSession(host2, false, [Roles.Admin, Roles.Reader])
    })

    step('create a connection from site1 to site 2', async () => {
        const crRet = await sess1.inject('connection', 'createConnection', {
            remote_site: siteName2
        } as CreateConnectionDto)

        assert.strictEqual(crRet.statusCode, 200, crRet.body)

    })

    step('on site1, should get the created connection from site1 to site 2', async () => {
        const getRet = await sess1.inject('connection', 'getConnection', {
            remote_site: siteName2
        } as CreateConnectionDto)
        assert.strictEqual(getRet.statusCode, 200, getRet.body)
        const data = getRet.json().data as ConnectionDto
        assert.strictEqual(data.remote_site, siteName2)
        assert.strictEqual(data.direction, ConnectionDirections.Outgoing)
        assert(data.remote_token.length > 0)
    })

    step('on site2, should get the created connection from site1 to site 2', async () => {
        const getRet = await sess2.inject('connection', 'getConnection', {
            remote_site: siteName1
        } as CreateConnectionDto)
        assert.strictEqual(getRet.statusCode, 200, getRet.body)
        const data = getRet.json().data as ConnectionDto
        assert.strictEqual(data.remote_site, siteName1)
        assert.strictEqual(data.direction, ConnectionDirections.Incoming)
        assert(data.remote_token.length > 0)
    })

    step('create a connection from site2 to site 1', async () => {
        const crRet = await sess2.inject('connection', 'createConnection', {
            remote_site: siteName1
        } as CreateConnectionDto)

        assert.strictEqual(crRet.statusCode, 200, crRet.body)
    })

    step('on site1, should get the bi-directional connection from site1 to site 2', async () => {
        const getRet = await sess1.inject('connection', 'getConnection', {
            remote_site: siteName2
        } as CreateConnectionDto)
        assert.strictEqual(getRet.statusCode, 200, getRet.body)
        const data = getRet.json().data as ConnectionDto
        assert.strictEqual(data.remote_site, siteName2)
        assert.strictEqual(data.direction, ConnectionDirections.Both)
        assert(data.remote_token.length > 0)
    })

    step('on site2, should get the bi-directional connection from site1 to site 2', async () => {
        const getRet = await sess2.inject('connection', 'getConnection', {
            remote_site: siteName1
        } as CreateConnectionDto)
        assert.strictEqual(getRet.statusCode, 200, getRet.body)
        const data = getRet.json().data as ConnectionDto
        assert.strictEqual(data.remote_site, siteName1)
        assert.strictEqual(data.direction, ConnectionDirections.Both)
        assert(data.remote_token.length > 0)
    })

    after(async () => {
        await host1.stop()
        await host2.stop()
        finalize()
    })
})
