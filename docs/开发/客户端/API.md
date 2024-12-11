---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# API

API是Application Programming Interface(应用程序编程接口)的缩写。它是一套定义了不同软件组件之间如何交互的规则和协议。这是一个很宽泛的概念，程序（几乎）总是需要和其他程序进行交互。

- Web API: 通过HTTP协议在网络上访问的API,最常见的是RESTful API。在国内论坛上，API很可能专指这个。
- 标准库API: 编程语言提供的内置函数和类。
- 操作系统API: 允许应用程序与操作系统交互的接口。
- SDK API：厂商会通过提供SDK，来提供一个功能实现的标准接口。

## Web API

如果客户端程序需要和服务端程序进行交互，一般使用Web API。有很多解决方案。但是本质上，无非是两点，数据传输方式和数据编码方式。

| 方案      | 传输方式      | 编码方式        | 其他      |
| ------- | --------- | ----------- | ------- |
| REST    | HTTP      | 一般是JSON/XML | 无状态     |
|         | WebSocket | 支持二进制       | 全双工     |
| gRPC    | HTTP/2    | Protobuf    |         |
| GraphQL | HTTP      |             | Query语言 |

### RESTful API (HTTP) 

感觉就是把API当作一个资源，通过URL路径访问。非常的简单直接。客户端调用HTTP库就可以向服务器调用API，适合进行 **无状态CRUD** 操作：

- GET：读取（Read）。幂等
- POST：创建（Create）。不幂等
- PUT/PATCH：更新（Update）。幂等
- DELETE：删除（Delete）。幂等

无状态是 REST 架构的一个关键特点，它指的是在请求和响应之间不保留任何上下文信息。这意味着每个请求都是独立的，服务器不会在多个请求之间保存任何状态信息。这可以方便服务端的扩展，简化逻辑，方便缓存。

### WebSocket

需要客户端和服务器之间的**实时、双向、低延时通信**时，WebSocket是正确的选择。每个REST请求都需要一个新的HTTP连接，由于HTTP握手的开销，这会增加延时。WebSocket打开一次连接，然后在需要时保持打开状态，减少发送消息所需的时间。

其实WebSocket 应该算是一个网络应用层的协议。

### gRPC (HTTP/2)

### GraphQL

GraphQL特别适合需要**灵活数据获取**的**复杂**前端应用，如单页应用（SPA）或移动应用。它也非常适合需要整合多个数据源的场景。

例如，服务器存了Account和Tx，里面有Account和Tx各种各样的属性。服务器可能暴露一个接口，例如`http://example.com/get_account(tx)/<id>` 来让用户获取 Account/Tx 信息，但是如果我只需要Account 中的某个属性，叠加上Tx的某个属性，就需要用户获取Account和Tx全部信息之后进一步处理，而GraphQL 则可以指定我需要什么信息。

具体的实现上，GraphQL 规定了自己的查询语言。我不甚了解。
