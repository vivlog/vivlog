import assert from 'assert'
import Sinon from 'sinon'
import { parseBool, toRepeat, toRepeatAsync } from './data'

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
