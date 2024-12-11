---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# Server

Web Server的功能一言以蔽之，接受HTTP Request，根据请求进行处理，然后返回相应的Response。但是在实际的编程过程中，要考虑的问题很多。比如网络、数据存储、流量控制、会话管理、安全等等问题。还好，我们有许多现成的Web Server框架在不同程度上帮我们解决了问题。

## Introduction

### Request 参数

虽然HTTP协议规定了6中请求方法。但是实际上最常用的只有GET和POST。

根据[RFC2612](https://www.rfc-editor.org/rfc/rfc2616#section-9.3)的规定，GET方法的请求内容应该完全由 Request URI 决定（也就是说虽然用户可以在使用GET方法时带上Request Body，但是服务器忽略它是完全合理的，利用它的值反而是不符合规范的）。

根据[RFC3986] 的规定，Request URI 只能包含 ASCII 字母、数字、特殊字符以及一些保留字符。如果想要传递特殊字符，需要进行**百分比编码（Percent-encoding）**。当然也可以选择base64等方法，将二进制编码成ASCII。在实践中，我们常用`?param1=a&param2=b`的方式对GET参数进行编码，不过这并不是规范规定的，你可以自定义参数的编码方式（可以，但没必要）。

POST的参数主要通过Request Body进行传递，其中可以包含二进制内容。作为Server的编写者，我们需要根据Request Header的`Content-Type` 和 `Content-Length`来正确解析数据。例如：

```http
POST /upload HTTP/1.1
Host: example.com
Content-Type: image/jpeg
Content-Length: 12345

[...JPEG数据的二进制内容...]
```

这是最基础的。如果数据量大，还会涉及分块传输、数据压缩。例如处理`Transfer-Encoding: chunked`和`Content-Encoding: gzip`。不过更多时候可能用户提交的就是一个表单，或者是一个JSON。

### Cookie

由于 HTTP is stateless，所以如果用户需要维护与HTTP的状态，需要在 HTTP 协议的基础上添加额外的东西。这个东西就是 Cookie。

常见的安全问题：

1. Attack against authentication
2. Injection & Inclusion attack
3. Unauthorized read of client information
4. Unexpected overwrite of client information
5. Overuse of web application resources

## Frameworks

### Rocket

Rocket是使用Rust编写的Web框架，主打安全和高效（估计在国内是没有公司使用了）。它的设计还是挺直接的，对于每一个来自用户的Request，分4步进行处理，形成一个完整的生命周期：

1. **Routing（路由）**：Rocket将发来的HTTP请求解析为原生的数据结构，然后根据代码中声明的 **路由属性** 进行匹配，将请求路由到 **handler（处理器）**。
2. **Validation（校验）**：Rocket校验请求是否满足代码中的 **类型声明** 和 **guard** 。如果校验失败，Rocket会将请求 **转发** 到下一个满足匹配的路由，或者调用 **错误处理器**。
3. **Processing（处理）**：接着 处理器就会被调用，传入校验过的参数。这是程序的主要业务逻辑。处理完成之后，必须要返回 `Response` （这是一个trait，看起来常见的类型都实现了，比如String, Json, Result...）。
4. **Response（响应）**：Rocket会对 `Response` 进行处理，生成对应的HTTP响应，发送给客户端。

一个简单的Hello World程序如下所示。btw，虽然你看到这里定义的好像都是普通函数，但是实际上rocket背后使用了tokio，下面的函数是异步执行的。我觉得设计的还是很不错的，适合开发API。

```rust
#[macro_use] extern crate rocket;

#[get("/world")]
fn world() -> &'static str {
    "Hello, world!"
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/hello", routes![world])
}
```

- [Rocket Guide](https://rocket.rs/guide/v0.5/)
- [Rocket Documents](https://api.rocket.rs/v0.5/rocket/)

### Node.js

### Ngnix

reverse proxy

### Apache

## API 

提供 [API](../客户端/API.md) 是常见的后端服务。其中RESTful API又是最为简单常见的。

编写RESTful API服务本身是非常简单的，不过编写API文档倒是挺麻烦的工作，尤其是万一API经常变动，如何保证文档和代码的一致性？这种自动化的工作自然有自动化的方法，例如[OpenAPI](https://www.openapis.org/)。

Rust与OpenAPI集成方案有[utoipa](https://docs.rs/utoipa/4.2.3/utoipa/)，他可以通过宏来对外部接口进行注释，进而自动生成 API Doc，可以直接在代码中暴露API Doc给用户。这个库目前还不是很成熟，文档也比较混乱。
