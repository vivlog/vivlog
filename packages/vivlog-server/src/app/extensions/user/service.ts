import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import * as jwt from 'jsonwebtoken'
import { DataSource } from 'typeorm'
import { ConfigProvider } from '../../../config'
import { Container } from '../../../container'
import { BadRequestError, Logger } from '../../../host/types'
import { lazy } from '../../../utils/lazy'
import { PayloadBuilder, Role } from '../../types'
import { gravatarFromEmail } from '../../util/gravatar'
import { LoginDto, UserLoginResponse as LoginRes, RegisterDto, UpdateUserDto, User, UserDto } from './entities'


export class UserService {
    public db: DataSource
    public logger: Logger
    public config: ConfigProvider
    constructor(container: Container) {
        lazy(this, 'db', () => container.resolve('db') as DataSource)
        lazy(this, 'logger', () => container.resolve('logger') as Logger)
        lazy(this, 'config', () => container.resolve('config') as ConfigProvider)
    }

    signJwt(userId: User['id']) {
        return jwt.sign(PayloadBuilder.ofUser(userId), this.config.get('jwtSecret', 'secret')!, { expiresIn: '1h' })
    }
    async createUser(userData: RegisterDto) {
        // hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10)

        const user = new User()
        user.username = userData.username
        user.email = userData.email
        user.password = hashedPassword
        user.uuid = randomUUID()
        user.avatarUrl = gravatarFromEmail(user.email)

        // if first user, set as admin
        const userCount = await this.db.manager.count(User)
        if (userCount === 0) {
            user.role = Role.Admin
        } else {
            user.role = Role.Reader
        }

        return this.db.manager.save(user)
    }
    async registerUser({ username, email, password }: RegisterDto): Promise<LoginRes> {
        this.logger.debug('register user %s', username)

        // no duplicate username
        const existingUser = await this.db.manager.count(User, {
            where: {
                username
            }
        })
        if (existingUser > 0) {
            throw new BadRequestError('username already exists')
        }

        const user = await this.createUser({
            username,
            email,
            password
        })

        return {
            user,
            token: this.signJwt(user.id)
        }

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
        return {
            user,
            token: this.signJwt(user.id)
        }
    }

    async getUser({ id }: { id: number }): Promise<UserDto | null> {
        return this.db.manager.findOne(User, {
            where: {
                id
            }
        })
    }

    async updateUser(dto: UpdateUserDto) {
        const user = await this.db.getRepository(User).findOneBy({ id: dto.id })
        if (!user) {
            throw new Error('User not found')
        }

        if (dto.role) {
            user.role = dto.role
        }

        if (dto.password) {
            user.password = await bcrypt.hash(dto.password, 10)
        }

        return this.db.getRepository(User).save(user)
    }
}
