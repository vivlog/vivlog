import { Static, Type } from '@sinclair/typebox'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Agent {
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

export type AgentDto = Agent;

const createAgentSchemaObj = {
    site: Type.Optional(Type.String()),
    title: Type.Optional(Type.String()),
    content: Type.Optional(Type.Unknown()),
    author_uuid: Type.Optional(Type.String()),
    author_site: Type.Optional(Type.String()),
}

export const createAgentSchema = Type.Object(createAgentSchemaObj)

export type CreateAgentDto = Static<typeof createAgentSchema>

export const updateAgentSchema = Type.Object({
    uuid: Type.String(),
    ...createAgentSchemaObj,
})

export const proxyRequestQuerySchema = Type.Object({
    endpoint: Type.String(),
    site: Type.String(),
})

export type ProxyRequestQueryDto = Static<typeof proxyRequestQuerySchema>

export type UpdateAgentDto = Static<typeof updateAgentSchema>

export const deleteAgentSchema = Type.Object({
    site: Type.Optional(Type.String()),
    uuid: Type.String(),
})

export type DeleteAgentDto = Static<typeof deleteAgentSchema>

export const getAgentSchema = Type.Object({
    site: Type.Optional(Type.String()),
    uuid: Type.String(),
})

export type GetAgentDto = Static<typeof getAgentSchema>

export const getAgentsSchema = Type.Object({
    filters: Type.Optional(Type.Object({
        title: Type.Optional(Type.String()),
        site: Type.Optional(Type.String()),
    })),
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    with_total: Type.Optional(Type.Boolean()),
})

export type GetAgentsDto = Static<typeof getAgentsSchema>
