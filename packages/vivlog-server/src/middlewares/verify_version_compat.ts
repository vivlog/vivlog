import { BadRequestError, ExHeaders, Middleware } from '../host/types'

export const verifyVersionCompat: Middleware = async (req) => {
    const clientVersion = req.headers[ExHeaders.Version]

    if (!clientVersion || typeof clientVersion !== 'string') {
        return
    }

    const clientMajorVersion = clientVersion.split('.')[0]
    const serverMajorVersion = process.env.npm_package_version!.split('.')[0]

    if (clientMajorVersion !== serverMajorVersion) {
        throw new BadRequestError(`Version mismatch, client version is v${clientMajorVersion} but server version is v${serverMajorVersion}`)
    }
}
