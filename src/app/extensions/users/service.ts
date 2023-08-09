import { DataSource } from 'typeorm'
import { Container } from '../../../container'
import { User } from './entities'
import { BadRequestError, Logger } from '../../../host/types'

export class UserService {
    private db: DataSource
    private logger: Logger
    constructor(container: Container) {
        this.db = container.resolve('db') as DataSource
        this.logger = container.resolve('logger') as Logger
        console.log('UserService constructor')
    }

    async registerUser(username: string, password: string): Promise<Omit<User, 'password'>> {
        this.logger.debug('register user %s', username)
        this.logger.debug('is_initialized %s', this.db.isInitialized)

        // no duplicate username
        const userCount = await this.db.manager.count(User, {
            where: {
                username
            }
        })
        if (userCount > 0) {
            throw new BadRequestError('username already exists')
        }

        const user = new User()
        user.username = username
        user.password = password
        const ret = await this.db.manager.save(user)
        ret.password = ''
        return ret
    }
}
