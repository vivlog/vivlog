import { Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

import Ajv from 'ajv'
import addFormats from 'ajv-formats'

export const ajv = addFormats(new Ajv({
    removeAdditional: false,
    coerceTypes: true,
    allErrors: true
}), [
    'date-time',
    'time',
    'date',
    'email',
    'hostname',
    'ipv4',
    'ipv6',
    'uri',
    'uri-reference',
    'uuid',
    'uri-template',
    'json-pointer',
    'relative-json-pointer',
    'regex'
])

export const localRoleSchema = Type.Union([
    Type.Literal('admin'),
    Type.Literal('editor'),
    Type.Literal('author'),
    Type.Literal('reader'),
])

export enum Role {
    Admin = 'admin',
    Editor = 'editor',
    Author = 'author',
    Reader = 'reader',
    Agent = 'agent', // requests has this role if it comes from a connection
    Guest = 'guest', // requests has this role if it comes from a guest or a guest over a connection
}

export const roleList = Object.values(Role)

export const rolePriorities = {
    [Role.Admin]: 5,
    [Role.Editor]: 4,
    [Role.Author]: 3,
    [Role.Reader]: 2,
    [Role.Agent]: 1,
    [Role.Guest]: 0,
}

export const Settings = {
    // Group system
    System: {
        _group: 'system',
        site: 'site',
        title: 'title',
        description: 'description',
        keywords: 'keywords',
        initialized: 'initialized',
    },
    Comment: {
        _group: 'comment',
        enabled: 'enabled',
        allow_guest: 'allow_guest', // allow guest to comment (without login)
    }
}



export enum SourceType {
    User = 'user',
    Site = 'site',
}

export const payloadSchema = Type.Object({
    sub: Type.String(),
    type: Type.Enum(SourceType),
})

export type Payload = Static<typeof payloadSchema>

export const payloadValidator = TypeCompiler.Compile(payloadSchema)

export const guestInfoSchema = Type.Object({
    name: Type.String(),
    email: Type.String({ format: 'email' }),
    site: Type.Optional(Type.String()),
})


export const guestInfoValidator = ajv.compile(guestInfoSchema)

export type GuestInfo = Static<typeof guestInfoSchema>

export class PayloadBuilder {
    private payload: Partial<Payload>
    private constructor() {
    }

    static ofUser(uid: string | number) {
        const builder = new PayloadBuilder()
        builder.payload = {
            type: SourceType.User,
            sub: uid.toString()
        }
        return builder.build()
    }

    static ofSite(site: string) {
        const builder = new PayloadBuilder()
        builder.payload = {
            type: SourceType.Site,
            sub: site
        }
        return builder.build()
    }

    public build() {
        return this.payload as Payload
    }
}
