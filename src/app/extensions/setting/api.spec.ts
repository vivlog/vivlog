import assert from 'assert'
import { describe } from 'mocha'
import { step } from 'mocha-steps'
import { defaultRawConfig } from '../../../config/types'
import { ServerHost } from '../../../host/host'
import { bootstrap } from '../../../server'
import { inject } from '../../../utils/testing'
import { AdminSession, createNewAdminSession } from '../../util/testing'
import { Setting } from './entities'

describe('Settings API', () => {

    describe('init and re-init', () => {
        let host: ServerHost
        let sess: AdminSession
        before(async () => {
            defaultRawConfig.dbPath = ':memory:'
            host = await bootstrap()
        })

        after(async () => {
            await host.stop()
        })

        step('init settings', async () => {
            const ret = await inject(host, 'setting', 'initSettings', [
                { group: 'default', name: 'test', value: 'value_test' }
            ])
            assert.strictEqual(ret.statusCode, 200, ret.body)
            const data = ret.json()
            assert.strictEqual(data.data, null)
        })

        step('re-init settings', async () => {
            const ret = await inject(host, 'setting', 'initSettings', [])
            assert.strictEqual(ret.statusCode, 400, ret.body)
        })

        step('create a new admin session', async () => {
            sess = await createNewAdminSession(host, false)
        })

        step('get initialized item', async () => {
            const ret = await sess.inject('setting', 'getItem', {
                group: 'default',
                name: 'test'
            })
            assert.strictEqual(ret.statusCode, 200, ret.body)
            const data = ret.json()
            const item: Setting = data.data
            assert.strictEqual(item.value, 'value_test')
        })
    })

    describe('Read and write', () => {
        let host: ServerHost
        let sess: AdminSession
        let initialItemCount: number

        before(async () => {
            defaultRawConfig.dbPath = ':memory:'
            host = await bootstrap()
        })

        after(async () => {
            await host.stop()
        })

        step('create a new admin session', async () => {
            sess = await createNewAdminSession(host)
        })

        step('get items from settings', async () => {
            const ret = await sess.inject('setting', 'getItems', {})
            assert.strictEqual(ret.statusCode, 200, ret.body)
            // NOTE: default settings can exists
            initialItemCount = ret.json().data.length
        })

        step('set default.test = "value_test"', async () => {
            const ret = await sess.inject('setting', 'setItem', {
                group: 'default',
                name: 'test',
                value: 'value_test'
            })
            assert.strictEqual(ret.statusCode, 200, ret.body)
            const data = ret.json()
            assert.strictEqual(data.data.id, 1 + initialItemCount)
            assert.strictEqual(data.data.group, 'default')
            assert.strictEqual(data.data.name, 'test')
            assert.strictEqual(data.data.value, 'value_test')
        })

        step('bulk set group2.test_i = i', async () => {
            const ret = await sess.inject('setting', 'setItems',
                Array.from(Array(10).keys()).map(i => ({
                    group: 'group2',
                    name: 'test_' + i,
                    value: i
                }))
            )
            assert.strictEqual(ret.statusCode, 200)
            const data = ret.json()
            assert.strictEqual(data.data.length, 10)
            data.data.forEach((item: Setting, i: number) => {
                assert.strictEqual(item.group, 'group2')
                assert.strictEqual(item.name, 'test_' + i)
                assert.strictEqual(item.value, i)
            })
        })

        step('get items in default group', async () => {
            const ret = await sess.inject('setting', 'getItems', {
                group: 'default'
            })
            assert.strictEqual(ret.statusCode, 200)
            const data = ret.json()
            const items: Setting[] = data.data
            assert.strictEqual(items.length, 1, items.map(x => JSON.stringify(x)).join(','))
            assert.strictEqual(items[0].group, 'default')
            assert.strictEqual(items[0].name, 'test')
            assert.strictEqual(items[0].value, 'value_test')
        })

        step('delete default.test', async () => {
            const ret = await sess.inject('setting', 'deleteItem', {
                group: 'default',
                name: 'test'
            })

            assert.strictEqual(ret.statusCode, 200)
            const data = ret.json()
            assert.strictEqual(data.data, null)
        })

        step('get items in default group', async () => {
            const ret = await sess.inject('setting', 'getItems', {
                group: 'default'
            })
            assert.strictEqual(ret.statusCode, 200)
            const data = ret.json()
            const items: Setting[] = data.data
            assert.strictEqual(items.length, 0)
        })

        step('delete items in group2', async () => {
            const ret = await sess.inject('setting', 'deleteItems', {
                group: 'group2'
            })
            assert.strictEqual(ret.statusCode, 200)
            const data = ret.json()
            assert.strictEqual(data.data, null)
        })

        step('get all items', async () => {
            const ret = await sess.inject('setting', 'getItems', {})
            assert.strictEqual(ret.statusCode, 200)
            const data = ret.json()
            const items: Setting[] = data.data
            assert.strictEqual(items.length, initialItemCount)
        })

    })
})
