/* eslint-disable @typescript-eslint/no-explicit-any */
import { assert } from 'chai'
import sinon from 'sinon'
import { ConfigProvider } from '../config'
import { DefaultContainer } from '../container'
import { proxyRequest } from './proxy_request'

describe('proxyRequest', () => {
    let container: DefaultContainer,
        rpcFn: sinon.SinonStub<any[], any>,
        req: any, res: any,
        config: sinon.SinonStubbedInstance<ConfigProvider>

    beforeEach(() => {
        // Mock dependencies
        container = new DefaultContainer()
        rpcFn = sinon.stub()
        config = sinon.createStubInstance(ConfigProvider)
        container.register('config', config)
        container.register('logger', { debug: sinon.stub() })

        // Mock request and response
        req = {
            target: 'target',
            url: 'http://localhost/mysite/api/post/createPost?p1=1&p2=2',
            headers: {
                host: 'localhost',
                'x-forwarded-proto': 'http',
                referer: 'http://localhost',
                'user-agent': 'test',
            },
            body: {},
            socket: { remoteAddress: 'localhost' },
        }
        res = {
            status: sinon.stub(),
            headers: sinon.stub(),
            send: sinon.stub(),
        }

        // Mock rpcRaw function
        rpcFn.returns(() => Promise.resolve({
            status: 200,
            headers: {},
            body: {},
        }))
    })

    it('should process the request and response correctly', async () => {
        config.get.onFirstCall().returns('/mysite')
        config.get.onSecondCall().returns('/myapi')

        await proxyRequest(container, rpcFn)(req as any, res as any, {} as any)

        assert.isTrue(rpcFn.calledOnce)
        assert.isTrue(res.status.calledWith(200))
        assert.isTrue(res.headers.calledOnce)
        assert.isTrue(res.send.calledOnce)
    })
})
