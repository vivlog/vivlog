# 存储

Vivlog 的存储系统具备如下特性：

1. 支持多种存储后端，例如本地文件系统、Amazon S3、阿里云 OSS 等。
    - 不同的存储后端可以同时使用，即更换存储后端不会影响已有的文件。
2. 文件上传者可溯源。
3. 可缓存来自其他站点的文件。

## 附件实体

附件实体（Attachment Entity）是指存储在站点上的文件，例如图片、视频、音频、文档等。

字段：

- id: number - 自动生成的 ID，无特别作用。
- short_id: string, required - 附件的短 ID，用于在文章中引用附件。大小写敏感。是长度为 8 的随机字符串。
- vid: string, required - 附件的 VIVLOG ID，格式为 `vivlog://example.com/siteB?r=attachment&id=short_id`。
  - 此字段为索引字段。
- site: string, required - 附件所属的站点名称。
- mime_type: string, required - 附件的 MIME 类型。
  - See: <https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types>
- size: number, required - 附件的大小，单位为字节。
- name: string, required - 附件的文件名（全名）。
- comment: string, optional - 附件的注释。
- uploader: string, optional - 附件的上传者 UUID。
- storage: string, required - 附件的存储后端名称。
- is_local: boolean, required - 附件是否为本地附件。
- url: string, optional - 附件的 URL 地址。如果是本地附件，则为 `null`。如果是远程附件，则为远程附件解析后的真实地址。
- path: string, optional - 附件在服务器的存储路径。
- base64: string, optional - 附件的内容，Base64 编码。对于小文件，可以直接将文件内容存储在数据库中，而不是存储在文件系统中。
- created_at: number, required - 附件的创建时间，Unix 时间戳，单位为毫秒。
- updated_at: number, required - 附件的更新时间，Unix 时间戳，单位为毫秒。
- resolved_at: number, optional - 附件的解析时间，Unix 时间戳，单位为毫秒。

## 配置项

```ts
interface Settings {
    Storage: {
        // 存储后端
        backend: 'local' | 's3' | 'oss' | 'qiniu' | 'upyun' | 'cos' | 'minio' | 'custom'
        // 存储后端配置, key 命名格式为 backend_config.{backend}.{key}
        [key: string]: any,
        // 默认存储后端名称
        default_backend: string,
        // 本地存储后端配置
        [backend_config.local.path_prefix]: string, // 本地存储路径前缀，例如 /var/www/example.com/objects
        // 以下二者取并集
        allowed_mime_types: string[], // 允许上传的 MIME 类型
        allowed_exts: string[], // 允许上传的扩展名
        resolve_cache_ttl: number, // 解析缓存时间，单位为秒，表示解析结果的最大缓存时间
    },
}
```

## 安全性

当你的站点连接到站点 B 时，站点 B 的文章可能含有来自站点 B 乃至其它站点的附件。附件均以 `viviog://example.com/siteB?r=attachment&id=short_id` 的形式出现在文章中。

于是，你访问你的站点上同步自 B 的文章时，服务器将检查附件的链接是否可信，如果可信，则解析为真实的附件地址。这样可以防止其他站点上传恶意附件，获取你的用户的信息。

```
Client -> Server A: storage.resolve('viviog://example.com/siteB?r=attachment&id=short_id')
Server A -> Server B: storage.resolve('attachment', 'short_id')
Server B -> Server A: https://real.url.example.com/objects/a/b/c.png
Server A -> Client: https://real.url.example.com/objects/a/b/c.png
```

## 接口

### `storage.resolve`

```ts
storage.resolve(
  vid: string, // vivlog://example.com/siteB?r=attachment&id=short_id
): Promise<Attachment>
```

解析附件的链接，返回附件实体。

### `storage.upload`

```ts
storage.upload(
  file: File,
  options: {
    mime_type: string, // 附件的 MIME 类型
    name: string, // 附件的文件名
    comment?: string, // 附件的注释
  },
): Promise<Attachment>
```
