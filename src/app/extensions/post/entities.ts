import { Static, Type } from '@sinclair/typebox'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
/*
Context:

u1: user 1, on local site
s1: site 1, a local site
u2: user 2, on site 2
s2: site 2, a remote site

use case 1: u1@s1 create a post@s1
use case 2: u1@s1 update a post@s1
use case 3: u1@s1 delete a post@s1
use case 4: u1@s1 create a post@s2 (reply to a post) *
use case 5: u1@s1 update a post@s2 (reply to a post)
use case 6: u1@s1 delete a post@s2 (reply to a post)
use case 7: u1@s2 create a post@s1 (reply to a post) * forbidden or need authorization
use case 8: u1@s2 update a post@s1 (reply to a post)
use case 9: u1@s2 delete a post@s1 (reply to a post)
use case 10: u1@s2 create a post@s2 (reply to a post) * forbidden or need authorization
use case 11: u1@s2 update a post@s2 (reply to a post)
use case 12: u1@s2 delete a post@s2 (reply to a post)
use case 13: u1@s2 create a reply@s2 to u3@s2's post

Email!

*/
@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    viv_id: string // domain.com+uuid

    @Column()
    title?: string

    @Column('simple-json')
    content?: unknown

    @Column()
    author?: string

    @Column('simple-json')
    attachments?: unknown

    @Column()
    name: string

    @Column('simple-json')
    custom: unknown

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

export type PostDto = typeof Post;

export const setItemSchema = Type.Object({
    group: Type.String(),
    name: Type.String(),
    value: Type.Unknown(),
})

export type SetItemDto = Static<typeof setItemSchema>

export const setItemsSchema = Type.Array(setItemSchema)

export type SetItemsDto = Static<typeof setItemsSchema>

export const getItemSchema = Type.Object({
    group: Type.String(),
    name: Type.String()
})

export type GetItemDto = Static<typeof getItemSchema>

export const getItemsSchema = Type.Object({
    group: Type.Optional(Type.String()),
})

export type GetItemsDto = Static<typeof getItemsSchema>

export const deleteItemSchema = Type.Object({
    group: Type.String(),
    name: Type.String()
})

export type DeleteItemDto = Static<typeof deleteItemSchema>

export const deleteItemsSchema = Type.Object({
    group: Type.String(),
})

export type DeleteItemsDto = Static<typeof deleteItemsSchema>
