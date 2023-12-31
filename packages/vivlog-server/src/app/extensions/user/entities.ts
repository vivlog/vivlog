import { Static, Type } from '@sinclair/typebox'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    email: string

    @Column()
    avatarUrl: string

    @Column({ nullable: true })
    description?: string

    @Column({ unique: true })
    uuid: string

    @Column()
    username: string

    @Column()
    password: string

    /**
     * User roles = admin | author | editor | reader
     * Administrator: has the highest level of privileges and can manage the entire blog system. 
     * Author: has the ability to create and manage their own articles.
     * Editor: has higher-level privileges and can edit and manage articles created by all authors.
     * Reader: is the default role for registered users.  They can leave comments, rate articles, and subscribe to specific authors or topics.
     */
    @Column()
    role: string
}

export const UserMaskFields: (keyof User)[] = ['password', 'email', 'role']

export type UserDto = Omit<User, 'password'>;

export type UserLoginResponse = {
    token: string
    user: UserDto
}

export const registerSchema = Type.Object({
    username: Type.String(),
    email: Type.String({ format: 'email' }),
    password: Type.String()
})

export type RegisterDto = Static<typeof registerSchema>

export const loginSchema = Type.Object({
    username: Type.String(),
    password: Type.String()
})

export type LoginDto = Static<typeof loginSchema>

export const updateUserSchema = Type.Object({
    id: Type.Number(),
    role: Type.Optional(Type.String()),
    email: Type.Optional(Type.String({ format: 'email' })),
    avatarUrl: Type.Optional(Type.String()),
    password: Type.Optional(Type.String())
})

export type UpdateUserDto = Static<typeof updateUserSchema>

export type IUserDto = {
    username: string
    avatarUrl: string
    site: string
    is_local: boolean
    description?: string
}
