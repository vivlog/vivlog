import { Host } from '../../../host/types'
import { RouteHelper } from '../../helper/route_helper'
import { loginSchema, registerSchema } from './entities'
import { UserService } from './service'

export function createUserApi(host: Host) {

    const userService = host.container.resolve(UserService.name) as UserService
    const routes = host.container.resolve('routes') as RouteHelper
    const module_ = 'user'
    routes.new().handle(module_, 'registerUser', registerSchema, async (req) => {
        return await userService.registerUser(req.body!)
    })

    routes.new().handle(module_, 'loginUser', loginSchema, async (req) => {
        return await userService.loginUser(req.body!)
    })
}
