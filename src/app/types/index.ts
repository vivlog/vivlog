import { Static, Type } from '@sinclair/typebox'

export const roleSchema = Type.Union([
    Type.Literal('admin'),
    Type.Literal('author'),
    Type.Literal('editor'),
    Type.Literal('reader'),
])

export type Role = Static<typeof roleSchema>

export enum Roles {
    Admin = 'admin',
    Author = 'author',
    Editor = 'editor',
    Reader = 'reader',
}

export const rolePriorities = {
    [Roles.Admin]: 4,
    [Roles.Author]: 3,
    [Roles.Editor]: 2,
    [Roles.Reader]: 1,
}
