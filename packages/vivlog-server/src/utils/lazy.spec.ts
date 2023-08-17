import assert from 'assert'
import { lazy } from './lazy'

describe('lazy', () => {

    it('should initialize lazily', () => {
        const obj = { prop: undefined }
        let called = false
        lazy(obj, 'prop', () => {
            called = true
            return 'value'
        })
        assert.strictEqual(called, false)
        assert.strictEqual(obj.prop, 'value')
        assert.strictEqual(called, true)
    })

    it('should cache value after first access', () => {
        const obj = { prop: undefined }
        let initCount = 0
        lazy(obj, 'prop', () => {
            initCount++
            return 'value'
        })
        assert.strictEqual(obj.prop, 'value')
        assert.strictEqual(initCount, 1)
        assert.strictEqual(obj.prop, 'value')
        assert.strictEqual(initCount, 1) // still 1
    })

    it('should allow overriding value', () => {
        const obj = {} as { prop: string }
        lazy(obj, 'prop', () => 'value')
        assert.strictEqual(obj.prop, 'value')
        obj.prop = 'new'
        assert.strictEqual(obj.prop, 'new')
    })

    it('should be enumerable', () => {
        const obj = { prop: undefined }
        lazy(obj, 'prop', () => 'value')
        assert.deepStrictEqual(Object.keys(obj), ['prop'])
    })

})
