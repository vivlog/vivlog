import { ConfigProvider } from '../config'
import { Container } from '../container'
import { Logger, Middleware, targetBaseUrl as createTargetBaseUrl } from '../host/types'

export const proxyRequest: (container: Container) => Middleware = (container: Container) => {
    const logger = container.resolve('logger') as Logger
    const config = container.resolve('config') as ConfigProvider

    return async (req, res) => {
        if (!req.target) {
            return
        }

        const baseUrl = createTargetBaseUrl(req.target)
        const sitePath = config.get('sitePath', '') as string
        const url = `${baseUrl}/${apiUrl}/`

        logger.debug('proxy request %s', url)

        const response = await container.resolve('app').inject({
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
