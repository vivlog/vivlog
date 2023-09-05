import { Static, Type } from '@sinclair/typebox'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class Attachment {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    short_id: string

    @Column()
    vid: string

    @Column()
    site: string

    @Column()
    filename: string

    @Column()
    mime_type: string

    @Column()
    size: number

    @Column({ nullable: true })
    comment?: string

    @Column()
    uuid: string

    @Column()
    is_local: boolean

    @Column({ nullable: true })
    url?: string

    @Column({ nullable: true })
    thumbnail_url?: string

    @Column({ nullable: true })
    path: string

    @Column({ nullable: true })
    base64?: string

    @Column('simple-json')
    custom?: unknown

    @Column({ nullable: true })
    uploader_uuid?: string

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @Column({ nullable: true })
    resolved_at?: Date
}

export type AttachmentDto = typeof Attachment;

const createAttachmentSchemaObj = {
    site: Type.Optional(Type.String()),
    title: Type.Optional(Type.String()),
    content: Type.Optional(Type.Unknown()),
    author_uuid: Type.Optional(Type.String()),
    author_site: Type.Optional(Type.String()),
}

export const createAttachmentSchema = Type.Object(createAttachmentSchemaObj)

export type CreateAttachmentDto = Static<typeof createAttachmentSchema>

export const updateAttachmentSchema = Type.Object({
    uuid: Type.String(),
    ...createAttachmentSchemaObj,
})

export type UpdateAttachmentDto = Static<typeof updateAttachmentSchema>

export const deleteAttachmentSchema = Type.Object({
    site: Type.Optional(Type.String()),
    uuid: Type.String(),
})

export type DeleteAttachmentDto = Static<typeof deleteAttachmentSchema>

export const getAttachmentSchema = Type.Object({
    site: Type.Optional(Type.String()),
    uuid: Type.String(),
})

export type GetAttachmentDto = Static<typeof getAttachmentSchema>

export const getAttachmentsSchema = Type.Object({
    filters: Type.Optional(Type.Object({
        title: Type.Optional(Type.String()),
        site: Type.Optional(Type.String()),
    })),
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    with_total: Type.Optional(Type.Boolean()),
})

export type GetAttachmentsDto = Static<typeof getAttachmentsSchema>
