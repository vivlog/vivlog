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
    },
    Storage: {
        _group: 'storage',
        // 存储后端
        backend: 'backend', // 'local' | 's3' | 'oss' | 'qiniu' | 'upyun' | 'cos' | 'minio' | 'custom'
        // 存储后端配置, key 命名格式为 backend_config.{backend}.{key}
        // [key: string]: any,
        // 默认存储后端名称
        default_backend: 'default_backend',
        // 本地存储后端配置
        // [backend_config.local.path_prefix]: string, // 本地存储路径前缀，例如 /var/www/example.com/objects
        // 以下二者取并集
        allowed_mime_types: 'allowed_mime_types', // string[], // 允许上传的 MIME 类型
        allowed_exts: 'allowed_exts', // string[], // 允许上传的扩展名
        resolve_cache_ttl: 'resolve_cache_ttl', // number, // 解析缓存时间，单位为秒，表示解析结果的最大缓存时间
        max_upload_size: 'max_upload_size', // number, // 最大上传文件大小，单位为字节
    },
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
