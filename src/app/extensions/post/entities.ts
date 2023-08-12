import { Static, Type } from '@sinclair/typebox'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    site: string

    @Column()
    uuid: string

    @Column()
    title?: string

    @Column({ default: 'thread' })
    // thread, reply, comment, etc.
    type: string

    @Column()
    // url slug
    slug?: string

    @Column('simple-json')
    content?: unknown

    @Column()
    author_uuid?: string

    @Column()
    author_site?: string

    @Column('simple-json')
    attachment_vids?: unknown // like featuredMedias

    @Column('simple-json')
    custom?: unknown

    @Column({ default: 'published' })
    status: string // draft | future | published | deleted

    @Column({ default: 'public' })
    visibility: string // public | private | internal

    @Column({ default: 'standard' })
    format: string // standard | link

    @Column()
    sticky: boolean

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @Column()
    published_at: Date

    // TODO: 圈子？
}

export type PostDto = Post;

const createPostSchemaObj = {
    site: Type.Optional(Type.String()),
    title: Type.Optional(Type.String()),
    type: Type.Union([
        Type.Literal('thread'),
        Type.Literal('reply'),
        Type.Literal('comment'),
    ]),
    slug: Type.Optional(Type.String()),
    content: Type.Optional(Type.Unknown()),
    author_uuid: Type.Optional(Type.String()),
    author_site: Type.Optional(Type.String()),
    attachment_vids: Type.Optional(Type.Unknown()),
    custom: Type.Optional(Type.Unknown()),
    // draft | future | published | deleted
    status: Type.Optional(Type.Union([
        Type.Literal('draft'),
        Type.Literal('future'),
        Type.Literal('published'),
        Type.Literal('deleted'),
    ], { default: 'published' })),
    // public | private | internal
    visibility: Type.Optional(Type.Union([
        Type.Literal('public'),
        Type.Literal('private'),
        Type.Literal('internal'),
    ], { default: 'public' })),
    // standard | link
    format: Type.Union([
        Type.Literal('standard'),
        Type.Literal('link'),
    ], { default: 'standard' }),
    sticky: Type.Boolean({ default: false }),
    published_at: Type.Optional(Type.String()),
}

export type PostType = Static<typeof createPostSchemaObj.type>

export enum PostTypeEnum {
    Thread = 'thread',
    Reply = 'reply',
    Comment = 'comment',
}

export const createPostSchema = Type.Object(createPostSchemaObj)

export type CreatePostDto = Static<typeof createPostSchema>

export const updatePostSchema = Type.Object({
    uuid: Type.String(),
    ...createPostSchemaObj,
})

export type UpdatePostDto = Static<typeof updatePostSchema>

export const deletePostSchema = Type.Object({
    site: Type.String(),
    uuid: Type.String(),
})

export type DeletePostDto = Static<typeof deletePostSchema>

export const getPostSchema = Type.Object({
    site: Type.String(),
    uuid: Type.String(),
})

export type GetPostDto = Static<typeof getPostSchema>

export const getPostsSchema = Type.Object({
    filters: Type.Optional(Type.Object({
        title: Type.Optional(Type.String()),
        site: Type.Optional(Type.String()),
        type: Type.Optional(Type.String()),
        status: Type.Optional(Type.String()),
        visibility: Type.Optional(Type.String()),
        format: Type.Optional(Type.String()),
        sticky: Type.Optional(Type.Boolean()),
    })),
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    with_total: Type.Optional(Type.Boolean()),
})

export type GetPostsDto = Static<typeof getPostsSchema>
