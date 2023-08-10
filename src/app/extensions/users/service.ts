import bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { DataSource } from 'typeorm'
import { Container } from '../../../container'
import { BadRequestError, Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { AppJwtPayload, LoginDto, UserLoginResponse as LoginRes, RegisterDto, User, UserDto } from './entities'


export class UserService {
    private db: DataSource
    private logger: Logger
    constructor(container: Container) {
        lazy(this, 'db', () => container.resolve('db') as DataSource)
        lazy(this, 'logger', () => container.resolve('logger') as Logger)
    }

    async registerUser({ username, password }: RegisterDto): Promise<UserDto> {
        this.logger.debug('register user %s', username)

        // no duplicate username
        const userCount = await this.db.manager.count(User, {
            where: {
                username
            }
        })
        if (userCount > 0) {
            throw new BadRequestError('username already exists')
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new User()
        user.username = username
        user.password = hashedPassword
        user.role = 'admin'
        const ret = await this.db.manager.save(user)
        ret.password = ''
        return ret
    }

    async loginUser({ username, password }: LoginDto): Promise<LoginRes> {
        this.logger.debug('login user %s', username)
        const user = await this.db.manager.findOne(User, {
            where: {
                username,
            }
        })
        if (!user) {
            throw new BadRequestError('username or password is incorrect')
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            throw new BadRequestError('username or password is incorrect')
        }
        user.password = ''
        const token = jwt.sign({ sub: user.id.toString() } as AppJwtPayload, 'secret', { expiresIn: '1h' })
        return {
            user,
            token: token
        }
    }
}
