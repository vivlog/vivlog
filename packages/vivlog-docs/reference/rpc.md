## XS-RPC

XS-RPC（跨站 RPC）是一种基于 HTTP 的 RPC 协议，支持 JSON 格式的请求体（保留使用其它格式的可能）

### 特性

- 支持版本化
- 支持请求转发
- 采用 JWT 进行身份验证

### 请求格式

请求路径：`${protocol}://${site}${apiPath}/${module}/${action}?${query}`

- **protocol**: 协议，只允许使用 `https`，除非 site 为 `localhost`
- **site**: 站点路径，例如 `example.com/x/site1`
- **apiPath**: API 路径，例如 `/api`，默认为 `/api`
- **module**: 模块名称，例如 `post`
- **action**: 动作名称，例如 `createPost`
- **query**: 查询字符串，例如 `a=1&b=2`

请求体：JSON 对象。

请求头：

- `Content-Type: application/json`

- `Authorization: Bearer ${token}` 或 `X-Vivlog-Token: ${token}`
  - 一般而言支持 JWT，但也可以使用其它格式，只要该站点支持即可
  - 用于身份验证，必须，除非为公开 API
- `X-Vivlog-Version: ${version}`
  - 用于指定请求的版本，可选。如果没有提供，则默认为 `latest`
  - 可选值：`latest` 或 `v${major}.${minor}.${patch}`
- `X-Vivlog-Request-Id: ${requestId}`
  - 用于跟踪请求，可选。如果没有提供，服务器会自动生成一个 UUID（v4）。
  - 如果请求转发，会在转发请求的请求头中添加 `X-Vivlog-Forwarded-Request-Id: ${requestId}`
- `X-Vivlog-Target-Site: ${site}`
  - 用于指定请求的目标站点，可选。如果没有提供，则默认为当前站点。
  - 如果请求转发，会在转发请求的请求头中添加 `X-Vivlog-Forwarded-Target-Site: ${site}`
- `X-Vivlog-Guest: ${guest}`
  - 用于访客请求，例如访客发表评论，可选。如果没有提供，则默认为当前访客。
  - 采用 Base64 编码，编码内容为 JSON 对象，包含以下字段：
    - `name`：访客的名称
    - `email`：访客的电子邮件
    - `site`：访客的网站，不含协议
  - 如果请求转发，会在转发请求的请求头中添加 `X-Vivlog-Forwarded-Guest: ${guest}`

响应体：

成功响应：

```json
{
  "data": response
}
```

失败响应：

```json
{
  "error": "Not Found",
  "code": "UNREACHABLE",
  "message": "You are not supposed to reach this.",
  "statusCode": 404,
}
```
