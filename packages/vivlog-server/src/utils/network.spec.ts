import assert from 'assert'
import { isLocalhost, removeHostFromUrl } from './network'

describe('isLocalhost', () => {
    it('should return true for "localhost"', () => {
        const result = isLocalhost('localhost')
        assert.strictEqual(result, true)
    })

    it('should return true for "localhost:3000"', () => {
        const result = isLocalhost('localhost:3000')
        assert.strictEqual(result, true)
    })

    it('should return false for "example.com"', () => {
        const result = isLocalhost('example.com')
        assert.strictEqual(result, false)
    })

    it('should return false for "otherhost:8080"', () => {
        const result = isLocalhost('otherhost:8080')
        assert.strictEqual(result, false)
    })
})

describe('removeHostFromUrl', () => {
    it('should remove host from http URL', () => {
        const result = removeHostFromUrl('http://example.com/path')
        assert.strictEqual(result, '/path')
    })

    it('should remove host from https URL', () => {
        const result = removeHostFromUrl('https://example.com/path')
        assert.strictEqual(result, '/path')
    })

    it('should handle URLs without protocol', () => {
        const result = removeHostFromUrl('example.com/path')
        assert.strictEqual(result, 'example.com/path')
    })

    it('should handle URLs with subpath', () => {
        const result = removeHostFromUrl('http://example.com/path/subpath')
        assert.strictEqual(result, '/path/subpath')
    })
})
