import { Static, Type } from '@sinclair/typebox'

export const roleSchema = Type.Union([
    Type.Literal('admin'),
    Type.Literal('editor'),
    Type.Literal('author'),
    Type.Literal('reader'),
])

export type Role = Static<typeof roleSchema>

export enum Roles {
    Admin = 'admin',
    Editor = 'editor',
    Author = 'author',
    Reader = 'reader',
}

export const rolePriorities = {
    [Roles.Admin]: 4,
    [Roles.Editor]: 3,
    [Roles.Author]: 2,
    [Roles.Reader]: 1,
}

export const Settings = {
    // Group system
    System: {
        _group: 'system',
        site: 'site',
        title: 'title'
    }
}

export const defaultSettings = [
    // TODO: add default settings here
    { group: Settings.System._group, name: Settings.System.site, value: 'vivlog.com/x/demo' },
    { group: 'system', name: 'initialized', value: true }
]
