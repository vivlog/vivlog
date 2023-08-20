# 连接

连接是一个抽象概念，表示站点之间的边。一条连接将两个站点连接起来。连接可以是单向的，也可以是双向的。

连接服务（ConnectionService）负责在远程站点之间创建、管理和验证连接。

建立连接之后，站点之间可以通过连接附带的 JWT 令牌在有效期内进行受控且可信的通信。一旦过期，连接将自动断开。

## 连接的类型

- 出站连接（Outgoing）：从当前站点指向另一个站点的连接。
- 入站连接（Incoming）：从另一个站点指向当前站点的连接。
- 双向链接（Both）：连接既是出站连接，也是入站连接。

## 连接的建立

### 单向连接

下面的代码将创建一个出站连接，从当前站点指向另一个站点。

```ts
const request = rpc(siteUrl2)
const crRet = await request('connection', 'createConnection', {
    remote_site: siteName2
} as CreateConnectionDto)

assert.strictEqual(crRet.statusCode, 200, crRet.body)
```

一旦在当前站点创建了出站连接，远程站点的数据库会相应地创建一个入站连接。

### 双向连接

在本地站点执行上述代码后，再在远程站点执行如下代码：

```ts
const request = rpc(siteUrl1)
const crRet = await request('connection', 'createConnection', {
    remote_site: siteName1
} as CreateConnectionDto)

assert.strictEqual(crRet.statusCode, 200, crRet.body)
```

则从远程站点创建了一个到本地站点的出站连接，而由于已经存在从本地站点到远程站点的出站连接，因此此连接将在两个站点都被升级为双向连接。

### 原理

连接的创建可以分为三个步骤：

1. `createConnection` (Client->Local Site)
    - 客户端向本地站点发出创建连接的请求。参数为远程站点的名称。
2. `requestConnection` (Local Site->Remote Site)
    - 本地站点调用 `requestConnection` 向远程站点发出创建连接的请求。参数为本地站点的名称以及为远程站点创建的 JWT 令牌。
3. `validateConnectionRequest` (Remote Site->Local Site)
    - 远程站点表示收到令牌并同意创建连接，而为了验证此请求来自合法的本地站点，远程站点会调用 `validateConnectionRequest` 验证。参数为远程站点的名称以及为本地站点创建的 JWT 令牌。

### 详细过程

**1. 连接创建：`createConnection`**

`createConnection` 方法用于启动创建与远程站点的连接的过程。此方法遵循一系列步骤来建立连接：

1. 记录意图创建连接，并从提供的数据传输对象（DTO）中检索远程站点信息。
2. 使用预定义的密钥生成一个称为 `local_token` 的 JSON Web Token (JWT)，表示本地站点建立连接的意图。
3. 将 `local_token` 存储在名为 `pendingConnections` 的映射中，与远程站点相关联。
4. 创建一个远程过程调用（RPC）请求，用于向远程站点请求连接（`requestConnection`）。
5. 如果RPC请求成功（表示远程站点确认连接请求），更新挂起的连接状态并返回连接详细信息。
6. 如果RPC请求失败，适当地处理错误，并提供错误消息以指示失败原因。

**2. 连接验证：`validateConnectionRequest`**

`validateConnectionRequest` 方法负责验证来自远程站点的连接请求。它确保连接请求是合法的并来自预期的来源：

1. 通过将提供的 `local_token` 和 `remote_token` 与存储在 `pendingConnections` 映射中的预期值进行比较来验证连接请求。
2. 如果验证成功，使用接收到的 `remote_token` 更新 `pendingConnections` 映射，并指示连接请求已被验证。

**3. 连接请求：`requestConnection`**

当远程站点向本地站点发送连接请求时，将调用 `requestConnection` 方法。该方法处理请求并在继续建立连接之前对其进行验证：

1. 记录意图处理连接请求，并从 DTO 中检索相关信息。
2. 验证发起连接的远程站点是否为当前站点。
3. 使用预定义的密钥生成一个称为 `remote_token` 的 JWT，表示远程站点建立连接的意图。
4. 启动对远程站点的远程过程调用，以验证连接请求（`validateConnectionRequest`）。
5. 如果远程过程调用的验证成功，则检查是否已存在与远程站点的现有出站连接。
6. 如果存在出站连接，则将其方向升级为“Both”，表示双向连接。
7. 如果未找到现有连接，则与远程站点创建新连接，并将方向设置为“Incoming”。
8. 返回 null，因为该方法的主要目的是验证和处理连接请求。
