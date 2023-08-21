import assert from 'assert'
import Sinon from 'sinon'
import { base64Decode, base64Encode, parseBool, toRepeat, toRepeatAsync } from './data'

describe('base64Encode', () => {
    it('should encode a string correctly', () => {
        const input = 'Hello, World!'
        const encoded = base64Encode(input)
        assert.strictEqual(encoded, 'SGVsbG8sIFdvcmxkIQ==')
    })

    it('should encode an object correctly', () => {
        const input = { key: 'value', num: 42 }
        const encoded = base64Encode(input)
        assert.strictEqual(encoded, 'eyJrZXkiOiAidmFsdWUiLCAibnVtIjogNDJ9')
    })
})

describe('base64Decode', () => {
    it('should decode a base64 string correctly', () => {
        const encoded = 'SGVsbG8sIFdvcmxkIQ=='
        const decoded = base64Decode(encoded, false)
        assert.deepStrictEqual(decoded, 'Hello, World!')
    })

    it('should decode a base64 object correctly', () => {
        const encoded = 'eyJrZXkiOiAidmFsdWUiLCAibnVtIjogNDJ9'
        const decoded = base64Decode(encoded)
        assert.deepStrictEqual(decoded, { key: 'value', num: 42 })
    })

    it('should return null for invalid base64 input', () => {
        const decoded = base64Decode('invalidBase64Input')
        assert.strictEqual(decoded, null)
    })
})

describe('parseBool', () => {

    it('returns false for undefined', () => {
        assert.equal(parseBool(undefined), false)
    })

    it('returns true for "true"', () => {
        assert.equal(parseBool('true'), true)
    })

    it('returns true for "True"', () => {
        assert.equal(parseBool('True'), true)
    })

    it('returns true for "1"', () => {
        assert.equal(parseBool('1'), true)
    })

    it('returns false for "false"', () => {
        assert.equal(parseBool('false'), false)
    })

})

describe('repeat', () => {

    it('repeats the function n times', () => {
        const fn = Sinon.spy()
        const fns = toRepeat(3, fn)
        fns.forEach(fn => fn())
        assert.equal(fn.callCount, 3)
    })

    it('returns an array of length n', () => {
        const ret = toRepeat(5, 'test')
        assert.equal(ret.length, 5)
    })

    it('repeats the promise n times', async () => {
        const fn = Sinon.spy()
        const tasks = toRepeatAsync(3, () => fn())
        await Promise.all(tasks)
        assert.equal(fn.callCount, 3)
    })
})
