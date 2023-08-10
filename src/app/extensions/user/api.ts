import { ServerHost } from '../../../host/host'
import { UserService } from './service'
import { registerSchema, loginSchema } from './entities'

export function createUserApi(host: ServerHost) {

    const userService = host.container.resolve(UserService.name) as UserService

    host.addRoute('user', 'registerUser', registerSchema, async (req) => {
        return await userService.registerUser(req.body)
    })

    host.addRoute('user', 'loginUser', loginSchema, async (req) => {
        return await userService.loginUser(req.body)
    })
}
