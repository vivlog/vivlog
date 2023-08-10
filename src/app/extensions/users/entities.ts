import { Static, Type } from '@sinclair/typebox'
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    username: string

    @Column()
    password: string

    @Column()
    role: string
}

export type UserDto = Omit<User, 'password'>;

export type UserLoginResponse = {
    token: string
    user: UserDto
}

export type AppJwtPayload = {
    sub: string // user id
}

export const registerSchema = Type.Object({
    username: Type.String(),
    password: Type.String()
})

export type RegisterDto = Static<typeof registerSchema>

export const loginSchema = Type.Object({
    username: Type.String(),
    password: Type.String()
})

export type LoginDto = Static<typeof loginSchema>
