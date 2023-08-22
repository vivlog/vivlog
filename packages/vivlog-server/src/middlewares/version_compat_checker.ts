import { BadRequestError, Middleware } from '../host/types'

export const checkEndpointVersionCompat: Middleware = (req, res, done) => {
    const clientVersion = req.headers['x-vivlog-version']

    if (!clientVersion || typeof clientVersion !== 'string') {
        done()
        return
    }

    const clientMajorVersion = clientVersion.split('.')[0]
    const serverMajorVersion = process.env.npm_package_version!.split('.')[0]

    if (clientMajorVersion !== serverMajorVersion) {
        throw new BadRequestError(`Version mismatch, client version is v${clientMajorVersion} but server version is v${serverMajorVersion}`)
    }

    done()
}
