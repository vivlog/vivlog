import { Static, Type } from '@sinclair/typebox'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Example {
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

export type ExampleDto = Example;

const createExampleSchemaObj = {
    site: Type.Optional(Type.String()),
    title: Type.Optional(Type.String()),
    content: Type.Optional(Type.Unknown()),
    author_uuid: Type.Optional(Type.String()),
    author_site: Type.Optional(Type.String()),
}

export const createExampleSchema = Type.Object(createExampleSchemaObj)

export type CreateExampleDto = Static<typeof createExampleSchema>

export const updateExampleSchema = Type.Object({
    uuid: Type.String(),
    ...createExampleSchemaObj,
})

export type UpdateExampleDto = Static<typeof updateExampleSchema>

export const deleteExampleSchema = Type.Object({
    site: Type.Optional(Type.String()),
    uuid: Type.String(),
})

export type DeleteExampleDto = Static<typeof deleteExampleSchema>

export const getExampleSchema = Type.Object({
    site: Type.Optional(Type.String()),
    uuid: Type.String(),
})

export type GetExampleDto = Static<typeof getExampleSchema>

export const getExamplesSchema = Type.Object({
    filters: Type.Optional(Type.Object({
        title: Type.Optional(Type.String()),
        site: Type.Optional(Type.String()),
    })),
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    with_total: Type.Optional(Type.Boolean()),
})

export type GetExamplesDto = Static<typeof getExamplesSchema>
