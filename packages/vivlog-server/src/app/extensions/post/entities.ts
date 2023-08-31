/* eslint-disable @typescript-eslint/no-explicit-any */
import { Static, Type } from '@sinclair/typebox'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { IUserDto } from '../user/entities'

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    site: string

    @Column()
    uuid: string

    @Column({ nullable: true, })
    title?: string

    @Column({ default: 'thread' })
    // thread, reply, comment, etc.
    type: string

    @Column({ nullable: true, })
    // url slug
    slug?: string

    @Column('simple-json')
    content?: any

    @Column()
    author_uuid: string

    @Column()
    author_site: string

    @Column('simple-json')
    attachment_vids?: any[] // like featuredMedias

    @Column('simple-json')
    custom?: any

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
    author?: IUserDto

    @Column('simple-json', { nullable: true })
    remote_author?: IUserDto
}

export type PostDto = Pick<Post, keyof Post>

const createPostSchemaObj = {
    site: Type.Optional(Type.String()),
    title: Type.Optional(Type.String()),
    type: Type.Optional(Type.Union([
        Type.Literal('thread'),
        Type.Literal('reply'),
        Type.Literal('comment'),
    ])),
    slug: Type.Optional(Type.String()),
    content: Type.Optional(Type.Any()),
    author_uuid: Type.Optional(Type.String()),
    author_site: Type.Optional(Type.String()),
    attachment_vids: Type.Optional(Type.Any()),
    custom: Type.Optional(Type.Any()),
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
    format: Type.Optional(Type.Union([
        Type.Literal('standard'),
        Type.Literal('link'),
    ], { default: 'standard' })),
    sticky: Type.Optional(Type.Boolean({ default: false })),
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
    uuid: Type.String(),
})

export type DeletePostDto = Static<typeof deletePostSchema>

export const getPostSchema = Type.Object({
    uuid: Type.String(),
})

export type GetPostDto = Static<typeof getPostSchema>

const commonFilters = {
    title: Type.Optional(Type.String()),
    type: Type.Optional(Type.String()),
    status: Type.Optional(Type.String()),
    visibility: Type.Optional(Type.String()),
    format: Type.Optional(Type.String()),
    sticky: Type.Optional(Type.Boolean()),
    after_time: Type.Optional(Type.String()),
}

const browseFilters = Type.Object({
    ...commonFilters,
    site: Type.Optional(Type.String())
})

const getFilters = Type.Object(commonFilters)

export const browsePostsSchema = Type.Object({
    filters: Type.Optional(browseFilters),
    limit: Type.Optional(Type.Number({ default: 10, maximum: 100, minimum: 1 })),
    offset: Type.Optional(Type.Number({ default: 0, minimum: 0 })),
    with_total: Type.Optional(Type.Boolean({ default: false })),
    with_author: Type.Optional(Type.Boolean({ default: true })),
})

export type BrowsePostsDto = Static<typeof browsePostsSchema>

export const getPostsSchema = Type.Object({
    filters: Type.Optional(getFilters),
    limit: Type.Optional(Type.Number({ default: 10, maximum: 100, minimum: 1 })),
    offset: Type.Optional(Type.Number({ default: 0, minimum: 0 })),
    with_total: Type.Optional(Type.Boolean({ default: false })),
    with_author: Type.Optional(Type.Boolean({ default: true })),
})

export type GetPostsDto = Static<typeof getPostsSchema>

export const syncPostsSchema = Type.Object({
    site: Type.Optional(Type.String()),
    limit: Type.Optional(Type.Number({ default: 10, maximum: 100, minimum: 1 })),
    after_time: Type.Optional(Type.String()),
})

export type SyncPostsDto = Static<typeof syncPostsSchema>
