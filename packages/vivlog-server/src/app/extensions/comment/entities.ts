import { Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    resource_site: string

    @Column()
    uuid: string

    @Column()
    resource_uuid: string

    @Column()
    resource_type: string

    @Column()
    content: string

    @Column()
    guest: boolean // guest or user

    // -- for guest
    @Column()
    guest_info?: GuestInfo

    // -- for user
    @Column()
    user_uuid?: string

    @Column()
    user_site?: string
}

export const guestInfoSchema = Type.Object({
    name: Type.String(),
    email: Type.String({ format: 'email' }),
    site: Type.Optional(Type.String()),
})

export const guestInfoValidator = TypeCompiler.Compile(guestInfoSchema)

export type GuestInfo = Static<typeof guestInfoSchema>

export type CommentDto = Comment;

const createCommentSchemaObj = {
    site: Type.Optional(Type.String()),
    title: Type.Optional(Type.String()),
    content: Type.Optional(Type.Unknown()),
    author_uuid: Type.Optional(Type.String()),
    author_site: Type.Optional(Type.String()),
}

export const createCommentSchema = Type.Object(createCommentSchemaObj)

export type CreateCommentDto = Static<typeof createCommentSchema>

export const updateCommentSchema = Type.Object({
    uuid: Type.String(),
    ...createCommentSchemaObj,
})

export type UpdateCommentDto = Static<typeof updateCommentSchema>

export const deleteCommentSchema = Type.Object({
    site: Type.Optional(Type.String()),
    uuid: Type.String(),
})

export type DeleteCommentDto = Static<typeof deleteCommentSchema>

export const getCommentSchema = Type.Object({
    site: Type.Optional(Type.String()),
    uuid: Type.String(),
})

export type GetCommentDto = Static<typeof getCommentSchema>

export const getCommentsSchema = Type.Object({
    filters: Type.Optional(Type.Object({
        title: Type.Optional(Type.String()),
        site: Type.Optional(Type.String()),
    })),
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    with_total: Type.Optional(Type.Boolean()),
})

export type GetCommentsDto = Static<typeof getCommentsSchema>

export type Resource = {
    uuid: string
    site: string
}
