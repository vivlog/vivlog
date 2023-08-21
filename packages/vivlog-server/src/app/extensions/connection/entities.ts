import { Static, Type } from '@sinclair/typebox'
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity()
export class Connection {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    remote_site: string

    @Column({ type: 'simple-json' })
    options: ConnectionOptions

    @Column()
    remote_token: string

    @Column()
    direction: string // outgoing | incoming | both

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @Column()
    active_at: Date
}

export type ConnectionOptions = {
    api_path?: string
}

export type ConnectionDto = Connection;

const createConnectionSchemaObj = {
    remote_site: Type.String(),
    options: Type.Optional(Type.Object({
        api_path: Type.Optional(Type.String()),
    })),
}

export type ConnectionDirection = 'outgoing' | 'incoming' | 'both'

export enum ConnectionDirections {
    Outgoing = 'outgoing',
    Incoming = 'incoming',
    Both = 'both',
}

export const createConnectionSchema = Type.Object(createConnectionSchemaObj)

export type CreateConnectionDto = Static<typeof createConnectionSchema>

export const updateConnectionSchema = Type.Object({
})

export type UpdateConnectionDto = Static<typeof updateConnectionSchema>

export const deleteConnectionSchema = Type.Object({
    id: Type.Number(),
})

export type DeleteConnectionDto = Static<typeof deleteConnectionSchema>

export const getConnectionSchema = Type.Object({
    remote_site: Type.String(),
})

export type GetConnectionDto = Static<typeof getConnectionSchema>

export const getConnectionsSchema = Type.Object({
    filters: Type.Optional(Type.Object({
        remote_site: Type.Optional(Type.String()),
        direction: Type.Optional(Type.Enum(ConnectionDirections)),
    })),
    limit: Type.Optional(Type.Number()),
    offset: Type.Optional(Type.Number()),
    with_total: Type.Optional(Type.Boolean()),
})

export type GetConnectionsDto = Static<typeof getConnectionsSchema>

export const requestConnectionSchema = Type.Object({
    local_site: Type.String(),
    local_token: Type.String(),
    local_api_path: Type.Optional(Type.String({ default: '/api' })),
    remote_site: Type.String(),
})

export type RequestConnectionDto = Static<typeof requestConnectionSchema>

export const validateConnectionRequestSchema = Type.Object({
    local_token: Type.String(),
    local_site: Type.String(),
    remote_token: Type.String(),
    remote_site: Type.String(),
})

export type ValidateConnectionRequestDto = Static<typeof validateConnectionRequestSchema>

