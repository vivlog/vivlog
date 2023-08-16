import assert from 'assert'
import { describe } from 'mocha'
import { step } from 'mocha-steps'
import { defaultRawConfig } from '../../../config/types'
import { ServerHost } from '../../../host/host'
import { bootstrap } from '../../../server'
import { clearUp, getNextAvailablePort } from '../../../utils/testing'
import { Roles, Settings } from '../../types'
import { CombinedSession, createNewSession } from '../../util/testing'
import { SettingService } from '../setting/service'
import { ConnectionDirections, ConnectionDto, CreateConnectionDto } from './entities'

describe('Connection API', () => {
    let site1: ServerHost
    let site2: ServerHost
    let sess1: CombinedSession
    let sess2: CombinedSession
    let site1SettingService: SettingService
    let site2SettingService: SettingService
    let site1Name: string
    let site2Name: string

    const trash: string[] = []
    before(async () => {
        let port = (await getNextAvailablePort()).toString()

        site1Name = `localhost:${port}/site1`
        defaultRawConfig.dbPath = 'host_site1.db'
        defaultRawConfig.port = port
        defaultRawConfig.sitePath = '/site1'
        site1 = await bootstrap()
        site1SettingService = site1.container.resolve(SettingService.name) as SettingService
        site1SettingService.setItem(
            { group: Settings.System._group, name: Settings.System.site, value: site1Name },
        )

        trash.push(defaultRawConfig.dbPath)

        port = (await getNextAvailablePort()).toString()
        site2Name = `localhost:${port}/site2`
        defaultRawConfig.dbPath = 'host_site2.db'
        defaultRawConfig.port = port
        defaultRawConfig.sitePath = '/site2'
        site2 = await bootstrap()
        site2SettingService = site2.container.resolve(SettingService.name) as SettingService
        site2SettingService.setItem(
            { group: Settings.System._group, name: Settings.System.site, value: site2Name },
        )
        trash.push(defaultRawConfig.dbPath)
        assert.notEqual(site1, site2)
        assert.notEqual(site1.app, site2.app)
        assert.notEqual(site1.config.get('port'), site2.config.get('port'))
        assert.notEqual(site1.config.get('dbPath'), site2.config.get('dbPath'))
        assert.notEqual(site1.config.get('sitePath'), site2.config.get('sitePath'))


    })

    step('create admin sessions', async () => {
        sess1 = await createNewSession(site1, true, [Roles.Admin, Roles.Reader])
        sess2 = await createNewSession(site2, true, [Roles.Admin, Roles.Reader])
    })

    step('create a connection from site1 to site 2', async () => {
        const crRet = await sess1.inject('connection', 'createConnection', {
            remote_site: site2Name
        } as CreateConnectionDto)

        assert.strictEqual(crRet.statusCode, 200, crRet.body)

    })

    step('on site1, should get the created connection from site1 to site 2', async () => {
        const getRet = await sess1.inject('connection', 'getConnection', {
            remote_site: site2Name
        } as CreateConnectionDto)
        assert.strictEqual(getRet.statusCode, 200, getRet.body)
        const data = getRet.json().data as ConnectionDto
        assert.strictEqual(data.remote_site, site2Name)
        assert.strictEqual(data.direction, ConnectionDirections.Outgoing)
        assert(data.remote_token.length > 0)
    })

    step('on site2, should get the created connection from site1 to site 2', async () => {
        const getRet = await sess2.inject('connection', 'getConnection', {
            remote_site: site1Name
        } as CreateConnectionDto)
        assert.strictEqual(getRet.statusCode, 200, getRet.body)
        const data = getRet.json().data as ConnectionDto
        assert.strictEqual(data.remote_site, site1Name)
        assert.strictEqual(data.direction, ConnectionDirections.Incoming)
        assert(data.remote_token.length > 0)
    })

    step('create a connection from site2 to site 1', async () => {
        const crRet = await sess2.inject('connection', 'createConnection', {
            remote_site: site1Name
        } as CreateConnectionDto)

        assert.strictEqual(crRet.statusCode, 200, crRet.body)
    })

    step('on site1, should get the bi-directional connection from site1 to site 2', async () => {
        const getRet = await sess1.inject('connection', 'getConnection', {
            remote_site: site2Name
        } as CreateConnectionDto)
        assert.strictEqual(getRet.statusCode, 200, getRet.body)
        const data = getRet.json().data as ConnectionDto
        assert.strictEqual(data.remote_site, site2Name)
        assert.strictEqual(data.direction, ConnectionDirections.Both)
        assert(data.remote_token.length > 0)
    })

    step('on site2, should get the bi-directional connection from site1 to site 2', async () => {
        const getRet = await sess2.inject('connection', 'getConnection', {
            remote_site: site1Name
        } as CreateConnectionDto)
        assert.strictEqual(getRet.statusCode, 200, getRet.body)
        const data = getRet.json().data as ConnectionDto
        assert.strictEqual(data.remote_site, site1Name)
        assert.strictEqual(data.direction, ConnectionDirections.Both)
        assert(data.remote_token.length > 0)
    })

    after(async () => {
        await site1.stop()
        await site2.stop()
        clearUp(trash)
    })
})
