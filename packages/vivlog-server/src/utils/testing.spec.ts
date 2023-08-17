import Sinon from 'sinon'
import { defer, finalize } from './testing'

describe('testing', () => {

    it('should finalize', () => {
        const s1 = Sinon.spy()
        defer('test', s1)
        Sinon.assert.notCalled(s1)
        const s2 = Sinon.spy()
        defer('test', s2)
        Sinon.assert.notCalled(s2)
        Sinon.assert.notCalled(s1)

        finalize()
        Sinon.assert.calledOnce(s1)
        Sinon.assert.calledOnce(s2)
        Sinon.assert.callOrder(s2, s1)
    })

    it('should finalize even if error', () => {
        const s1 = Sinon.spy()
        defer('test', s1)
        Sinon.assert.notCalled(s1)
        const s2 = Sinon.spy()
        defer('test', s2)
        Sinon.assert.notCalled(s2)
        Sinon.assert.notCalled(s1)

        const s3 = Sinon.spy()
        defer('test', () => {
            s3()
            throw new Error('deliberate error')
        })
        Sinon.assert.notCalled(s3)

        finalize()
        Sinon.assert.calledOnce(s1)
        Sinon.assert.calledOnce(s2)
        Sinon.assert.calledOnce(s3)
        Sinon.assert.callOrder(s3, s2, s1)
    })
    it('should finalize for async finalizer', () => {
        const s1 = Sinon.spy()
        defer('test', s1)
        Sinon.assert.notCalled(s1)
        const s2 = Sinon.spy()
        defer('test', s2)
        Sinon.assert.notCalled(s2)
        Sinon.assert.notCalled(s1)

        const s3 = Sinon.spy()
        defer('test', async () => {
            s3()
        })
        Sinon.assert.notCalled(s3)

        finalize()
        Sinon.assert.calledOnce(s1)
        Sinon.assert.calledOnce(s2)
        Sinon.assert.calledOnce(s3)
        Sinon.assert.callOrder(s3, s2, s1)
    })

})
