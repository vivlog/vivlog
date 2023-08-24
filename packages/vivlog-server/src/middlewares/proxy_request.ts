import { ConfigProvider } from '../config'
import { Container } from '../container'
import { Logger, Middleware, createTargetBaseUrl } from '../host/types'
import { removePrefix } from '../utils/data'
import { removeHostFromUrl, rpcRaw } from '../utils/network'

export type ProxyRequestType = (container: Container, rpcFn?: typeof rpcRaw) => Middleware

export const proxyRequest: ProxyRequestType = (container, rpcFn) => {
    const logger = container.resolve('logger') as Logger
    const config = container.resolve('config') as ConfigProvider
    const rpc = rpcFn ?? rpcRaw
    return async (req, res) => {
        if (!req.target) {
            return
        }

        const baseUrl = createTargetBaseUrl(req.target) // like: http://localhost:3000/subsite/api
        const sitePath = config.get('sitePath', '') as string // like: /mysite
        const apiPath = config.get('apiPath', '') as string // like: /myapi
        // input: http://localhost/mysite/api/post/createPost?p1=1&p2=2
        // output: /post/createPost?p1=1&p2=2
        const apiUrl = removePrefix(removeHostFromUrl(req.url), sitePath + apiPath)
        // post
        const module_ = apiUrl.split('/', 2)[1]
        // createPost?p1=1&p2=2
        const action = apiUrl.substring(module_.length + 1)
        const request = rpc(baseUrl)
        logger.debug('proxyRequest %s %s %s', req.target, module_, action)
        const response = await request(module_, action, req.body, {
            headers: {
                'authorization': `Bearer ${req.target.token}`,
                'x-forwarded-host': req.headers['host'],
                'x-forwarded-proto': req.headers['x-forwarded-proto'],
                'x-forwarded-for': req.socket.remoteAddress,
                'x-forwarded-path': req.url,
                'referer': req.headers['referer'],
                'user-agent': req.headers['user-agent'],
            },
        })

        res.status(response.status)
        res.headers(response.headers)
        res.send(response.body)
    }
}
