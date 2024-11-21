---
aliases: 
tags: [TODO]
date_created: Monday, September 30th 2024, 11:40:49 pm
date_modified: Wednesday, November 20th 2024, 11:53:36 pm
---

# HTTP

HTTP 是超文本传输协议，也就是**H**yperText **T**ransfer **P**rotocol。

HTTP可以说是使用的最多的应用层协议了。它自身也在不断发展，从最开始的HTTP/1.0 -> HTTP/1.1 -> HTTP/2 -> HTTP/3。但是不管怎么发展，它做的事情是一样的：两点之间的通信协议，发送 Request 包，返回 Response 包，包的内容是超文本（也就是啥都可以发，不仅限纯文本）。

## HTTP Packet

HTTP Packet 由 Header 和 Body 组成。分为Request Packet和Response Packet。

Request 包的基本格式如下， `POST` 是**方法**，`/form/entry` 是 **URI**，`HTTP/1.1` 是**版本**，后面是**首部**字段，最后是**请求体**。例如：

```
POST /form/entry HTTP/1.1
Host: hackr.jp
Connection: keep-alive
Content-Type: application/x-www-form-urlencoded
Content-Length: 16

name=ueno&age=37
```

收到 Request 之后，服务器会返回 Response。`HTTP/1.1` 是**版本**，`200` 是**状态码**，`OK` 是**状态说明**，后面是**首部字段**，最后是**响应体**。例如：

```
HTTP/1.1 200 OK
Date: Tue, 10 Jul 2012 06:50:15 GMT
Content-Length: 362
Content-Type: text/html

<html>
……
```

这些首部字段、状态码的具体含义在面试和实践中都挺有用的，值得介绍一下。

### 状态码

- 1xx: 信息响应。这一类状态码表示临时的响应，服务器已接收请求并继续处理。
- 2xx: 成功。这类状态码表示请求已被成功接收、理解并接受。
- 3xx: 重定向。这类状态码表示为了完成请求，必须进一步执行操作。通常，这些状态码用来重定向。
- 4xx: 客户端错误。这类状态码表示请求可能出错，妨碍了服务器的处理。
- 5xx: 服务器错误。这类状态码表示服务器在尝试处理请求时发生了错误。

## 编程

HTTP可能是最流行的应用层协议了。很多库和二进制程序对发送、处理HTTP请求做了封装。

发送HTTP请求：

- [`curl`](../../工具/Linux.md)： 通过命令行构造HTTP请求。
- [`request`](../../编程语言/Python/库/HTTP.md)：通过Python脚本构造HTTP请求。

处理HTTP请求：

- [`net/http`](../../编程语言/Golang/库/net.md)：编写Golang应用，处理HTTP请求。只需要简单的三步。
