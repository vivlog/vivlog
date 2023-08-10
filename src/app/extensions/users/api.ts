import { Static, Type } from '@sinclair/typebox'
import { ServerHost } from '../../../host/host'
import { UserService } from './service'


export function createUserApi(host: ServerHost) {

    const userService = host.container.resolve(UserService.name) as UserService

    const registerUser = () => {
        const registerSchema = Type.Object({
            username: Type.String(),
            password: Type.String()
        })
        host.app.route({
            method: 'POST',
            url: '/auth/registerUser',
            schema: {
                body: registerSchema
            },
            handler: async (req) => {
                const { username, password } = req.body as Static<typeof registerSchema>
                const user = await userService.registerUser(username, password)
                return {
                    data: user
                }
            }
        })
    }
    registerUser()

    const loginUser = () => {
        const loginSchema = Type.Object({
            username: Type.String(),
            password: Type.String()
        })
        host.app.route({
            method: 'POST',
            url: '/auth/loginUser',
            schema: {
                body: loginSchema
            },
            handler: async (req) => {
                const { username, password } = req.body as Static<typeof loginSchema>
                const user = await userService.loginUser(username, password)
                return {
                    data: user
                }
            }
        })
    }
    loginUser()

}
