import { Static, Type } from '@sinclair/typebox'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Attachment {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    site: string

    @Column()
    uuid: string

    @Column()
    title?: string

    @Column('simple-json')
    content?: unknown

    @Column()
    author_uuid?: string

    @Column()
    author_site?: string
}

export type StorageDto = Storage;

const createStorageSchemaObj = {
    site: Type.Optional(Type.String()),
    title: Type.Optional(Type.String()),
    content: Type.Optional(Type.Unknown()),
    author_uuid: Type.Optional(Type.String()),
    author_site: Type.Optional(Type.String()),
}

export const createStorageSchema = Type.Object(createStorageSchemaObj)

export type CreateStorageDto = Static<typeof createStorageSchema>

export const updateStorageSchema = Type.Object({
    uuid: Type.String(),
    ...createStorageSchemaObj,
})

export type UpdateStorageDto = Static<typeof updateStorageSchema>

export const deleteStorageSchema = Type.Object({
    site: Type.Optional(Type.String()),
    uuid: Type.String(),
})

export type DeleteStorageDto = Static<typeof deleteStorageSchema>

export const getStorageSchema = Type.Object({
    site: Type.Optional(Type.String()),
    uuid: Type.String(),
})

export type GetStorageDto = Static<typeof getStorageSchema>

export const getStoragesSchema = Type.Object({
    filters: Type.Optional(Type.Object({
        title: Type.Optional(Type.String()),
        site: Type.Optional(Type.String()),
    })),
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    with_total: Type.Optional(Type.Boolean()),
})

export type GetStoragesDto = Static<typeof getStoragesSchema>
