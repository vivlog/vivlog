import assert from 'assert'
import { Masker, mask, maskAll, maskAllProp, maskProp } from './mask'

describe('mask', () => {

    it('should return undefined if input is undefined', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = mask(undefined, ['foo'] as any)
        assert.strictEqual(result, undefined)
    })

    it('should remove specified fields from object', () => {
        const input = { foo: 'foo', bar: 'bar' }
        const result = mask(input, ['foo'])
        assert.deepStrictEqual(result, { bar: 'bar' })
    })

})

describe('maskAll', () => {

    it('should mask specified fields from all objects in array', () => {
        const input = [{ foo: 'foo', bar: 'bar' }, { foo: 'foo2', bar: 'bar2' }]
        const result = maskAll(input, ['foo'])
        assert.deepStrictEqual(result, [{ bar: 'bar' }, { bar: 'bar2' }])
    })

    it('should return original array if no objects', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const input: any[] = []
        const result = maskAll(input, ['foo'])
        assert.strictEqual(result, input)
    })

})

describe('maskObjProp', () => {

    it('should return original object if input is undefined', () => {
        const result = maskProp(undefined, 'prop' as never, ['foo'])
        assert.strictEqual(result, undefined)
    })

    it('should mask specified fields from nested object property', () => {
        const input = { prop: { foo: 'foo', bar: 'bar' } }
        const result = maskProp(input, 'prop', ['foo'])
        assert.deepStrictEqual(result, { prop: { bar: 'bar' } })
    })

    it('should return original object if property missing', () => {
        const input = { prop2: { foo: 'foo' } }
        const result = maskProp(input, 'prop' as never, ['foo'])
        assert.strictEqual(result, input)
    })

})

describe('maskAllProp', () => {

    it('should return original array if input is undefined', () => {
        const objs = undefined
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = maskAllProp(objs as any, 'prop', ['foo'])
        assert.strictEqual(result, objs)
    })

    it('should return original empty array if input is empty', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const objs: any[] = []
        const result = maskAllProp(objs, 'prop', ['foo'])
        assert.strictEqual(result, objs)
    })

    it('should mask fields from nested props in all objects', () => {
        const objs = [{ prop: { foo: 'foo', bar: 'bar' } }, { prop: { foo: 'foo2', bar: 'bar2' } }]
        const expected = [{ prop: { bar: 'bar' } }, { prop: { bar: 'bar2' } }]
        const result = maskAllProp(objs, 'prop', ['foo'])
        assert.deepStrictEqual(result, expected)
    })

})

describe('Masker', () => {

    it('should mask specified fields', () => {
        const objs = [{
            user: { name: 'John', password: 'secret' },
            account: { id: 123, apiKey: 'abc' }
        }]

        const masked = Masker.of(objs)
            .mask('user', ['password'])
            .mask('account', ['apiKey'])
            .get()

        assert.deepStrictEqual(masked, [{
            user: { name: 'John' },
            account: { id: 123 }
        }])
    })

    it('should handle empty fields', () => {
        const objs = [{ user: null }, { user: undefined }]

        const masked = Masker.of(objs).mask('user', ['password']).get()

        assert.deepStrictEqual(masked, [{ user: null }, { user: undefined }])
    })

    it('should be chainable', () => {
        const objs = [{ prop: { foo: 'foo', bar: 'bar' } }]

        const masked = Masker.of(objs)
            .mask('prop', ['foo'])
            .mask('prop', ['bar'])
            .get()

        assert.deepStrictEqual(masked, [{ prop: {} }])
    })

})
