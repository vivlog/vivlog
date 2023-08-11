import assert from 'assert'
import { describe } from 'mocha'
import { step } from 'mocha-steps'
import { defaultRawConfig } from '../../../config/types'
import { ServerHost } from '../../../host/host'
import { bootstrap } from '../../../server'
import { inject } from '../../../utils/testing'
import { Setting } from './entities'

describe('Settings API', () => {

    describe('init and re-init', () => {
        let s: ServerHost
        before(async () => {
            defaultRawConfig.dbPath = ':memory:'
            s = await bootstrap()
        })

        after(async () => {
            await s.stop()
        })

        step('init settings', async () => {
            const ret = await inject(s, 'setting', 'initSettings', [
                { group: 'default', name: 'test', value: 'value_test' }
            ])
            assert.strictEqual(ret.statusCode, 200)
            const data = JSON.parse(ret.body)
            assert.strictEqual(data.data, null)
        })

        step('re-init settings', async () => {
            const ret = await inject(s, 'setting', 'initSettings', [])
            assert.strictEqual(ret.statusCode, 400)
        })

        step('get initialized item', async () => {
            const ret = await inject(s, 'setting', 'getItem', {
                group: 'default',
                name: 'test'
            })
            assert.strictEqual(ret.statusCode, 200)
            const data = JSON.parse(ret.body)
            const item: Setting = data.data
            assert.strictEqual(item.value, 'value_test')
        })
    })

    describe('Read and write', () => {
        let s: ServerHost
        before(async () => {
            defaultRawConfig.dbPath = ':memory:'
            s = await bootstrap()
        })

        after(async () => {
            await s.stop()
        })

        step('get items from empty settings', async () => {
            const ret = await inject(s, 'setting', 'getItems', {})
            assert.strictEqual(ret.statusCode, 200)
            const data = JSON.parse(ret.body)
            const items: Setting[] = data.data
            assert.strictEqual(items.length, 0)
        })

        step('set default.test = "value_test"', async () => {
            const ret = await inject(s, 'setting', 'setItem', {
                group: 'default',
                name: 'test',
                value: 'value_test'
            })
            assert.strictEqual(ret.statusCode, 200)
            const data = JSON.parse(ret.body)
            assert.strictEqual(data.data.id, 1)
            assert.strictEqual(data.data.group, 'default')
            assert.strictEqual(data.data.name, 'test')
            assert.strictEqual(data.data.value, 'value_test')
        })

        step('bulk set group2.test_i = i', async () => {
            const ret = await inject(s, 'setting', 'setItems',
                Array.from(Array(10).keys()).map(i => ({
                    group: 'group2',
                    name: 'test_' + i,
                    value: i
                }))
            )
            assert.strictEqual(ret.statusCode, 200)
            const data = JSON.parse(ret.body)
            assert.strictEqual(data.data.length, 10)
            data.data.forEach((item: Setting, i: number) => {
                assert.strictEqual(item.group, 'group2')
                assert.strictEqual(item.name, 'test_' + i)
                assert.strictEqual(item.value, i)
            })
        })

        step('get items in default group', async () => {
            const ret = await inject(s, 'setting', 'getItems', {
                group: 'default'
            })
            assert.strictEqual(ret.statusCode, 200)
            const data = JSON.parse(ret.body)
            const items: Setting[] = data.data
            assert.strictEqual(items.length, 1)
            assert.strictEqual(items[0].group, 'default')
            assert.strictEqual(items[0].name, 'test')
            assert.strictEqual(items[0].value, 'value_test')
        })

        step('delete default.test', async () => {
            const ret = await inject(s, 'setting', 'deleteItem', {
                group: 'default',
                name: 'test'
            })

            assert.strictEqual(ret.statusCode, 200)
            const data = JSON.parse(ret.body)
            assert.strictEqual(data.data, null)
        })

        step('get items in default group', async () => {
            const ret = await inject(s, 'setting', 'getItems', {
                group: 'default'
            })
            assert.strictEqual(ret.statusCode, 200)
            const data = JSON.parse(ret.body)
            const items: Setting[] = data.data
            assert.strictEqual(items.length, 0)
        })

        step('delete items in group2', async () => {
            const ret = await inject(s, 'setting', 'deleteItems', {
                group: 'group2'
            })
            assert.strictEqual(ret.statusCode, 200)
            const data = JSON.parse(ret.body)
            assert.strictEqual(data.data, null)
        })

        step('get all items', async () => {
            const ret = await inject(s, 'setting', 'getItems', {})
            assert.strictEqual(ret.statusCode, 200)
            const data = JSON.parse(ret.body)
            const items: Setting[] = data.data
            assert.strictEqual(items.length, 0)
        })

    })
})
