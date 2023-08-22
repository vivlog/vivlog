import { ConfigProvider } from '../config'
import { Container } from '../container'
import { Logger, Middleware, createTargetBaseUrl } from '../host/types'
import { removePrefix } from '../utils/data'
import { removeHostFromUrl, rpc } from '../utils/network'

export const proxyRequest: (container: Container) => Middleware = (container: Container) => {
    const logger = container.resolve('logger') as Logger
    const config = container.resolve('config') as ConfigProvider

    return async (req, res) => {
        if (!req.target) {
            return
        }

        const baseUrl = createTargetBaseUrl(req.target)
        const sitePath = config.get('sitePath', '') as string
        const apiPath = config.get('apiPath', '') as string
        const apiUrl = removePrefix(removeHostFromUrl(req.url), sitePath + apiPath)
        const url = `${baseUrl}/${apiUrl}/`

        const request = rpc(baseUrl)
        const response = await request({
            method: req.method,
            url: url,
            payload: req.body,
            headers: req.headers
        })

        res.status(response.statusCode)
        res.headers(response.headers)
        res.send(response.body)
    }
}
