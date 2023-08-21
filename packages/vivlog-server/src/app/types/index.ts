import { Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

export const localRoleSchema = Type.Union([
    Type.Literal('admin'),
    Type.Literal('editor'),
    Type.Literal('author'),
    Type.Literal('reader'),
])

export type LocalRole = Static<typeof localRoleSchema>

export enum Role {
    Admin = 'admin',
    Editor = 'editor',
    Author = 'author',
    Reader = 'reader',
    Agent = 'agent', // not a real role, just a placeholder for non-user visitor
}

export const rolePriorities = {
    [Role.Admin]: 4,
    [Role.Editor]: 3,
    [Role.Author]: 2,
    [Role.Reader]: 1,
}

export const Settings = {
    // Group system
    System: {
        _group: 'system',
        site: 'site',
        title: 'title',
        initialized: 'initialized',
    },
    Comment: {
        _group: 'comment',
        enabled: 'enabled',
        allow_guest: 'allow_guest', // allow guest to comment (without login)
    }
}

export const defaultSettings = [
    // TODO: add default settings here
    { group: Settings.System._group, name: Settings.System.site, value: 'vivlog.net/x/demo' },
    { group: Settings.System._group, name: Settings.System.title, value: 'Vivlog' },
    { group: Settings.System._group, name: Settings.System.initialized, value: true },
    { group: Settings.Comment._group, name: Settings.Comment.enabled, value: true },
    { group: Settings.Comment._group, name: Settings.Comment.allow_guest, value: true },
]

export enum TokenType {
    User = 'user',
    Site = 'site',
}

export const payloadSchema = Type.Object({
    sub: Type.String(),
    type: Type.Enum(TokenType),
})

export type Payload = Static<typeof payloadSchema>

export const payloadValidator = TypeCompiler.Compile(payloadSchema)

export class PayloadBuilder {
    private payload: Partial<Payload>
    private constructor() {
    }

    static ofUser(uid: string | number) {
        const builder = new PayloadBuilder()
        builder.payload = {
            type: TokenType.User,
            sub: uid.toString()
        }
        return this
    }

    static ofSite(site: string) {
        const builder = new PayloadBuilder()
        builder.payload = {
            type: TokenType.Site,
            sub: site
        }
        return this
    }

    build() {
        return this.payload as Payload
    }
}
