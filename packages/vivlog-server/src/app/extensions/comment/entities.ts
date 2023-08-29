import { Static, Type } from '@sinclair/typebox'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { AgentInfo } from '../../../host/types'

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    uuid: string

    @Column()
    site: string

    @Column()
    resource_site: string

    @Column()
    resource_uuid: string

    @Column()
    resource_type: string

    @Column()
    content: string

    @Column({ type: 'simple-json', nullable: true })
    agent?: AgentInfo

    @Column({ nullable: true})
    user_uuid?: string

    @Column({ nullable: true})
    user_site?: string
}

export type CommentDto = Pick<Comment, keyof Comment>

const createCommentSchemaObj = {
    resource: Type.Object({
        site: Type.String(),
        uuid: Type.String(),
        type: Type.String(),
    }),
    content: Type.String(),
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
