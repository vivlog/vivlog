import { Host } from '../../../host/types'
import { loginSchema, registerSchema } from './entities'
import { UserService } from './service'

export function createUserApi(host: Host) {

    const userService = host.container.resolve(UserService.name) as UserService

    host.addRoute('user', 'registerUser', registerSchema, async (req) => {
        return await userService.registerUser(req.body)
    })

    host.addRoute('user', 'loginUser', loginSchema, async (req) => {
        return await userService.loginUser(req.body)
    })
}
