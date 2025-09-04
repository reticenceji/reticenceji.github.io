---
aliases: 
tags: [TODO]
date_modified: 2025-02-28
date: 2024-11-30
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

## HTTP的各个版本

HTTP1.0：浏览器的每次请求都需要与服务器建立一个TCP连接，服务器完成请求处理后立即断开TCP连接，服务器不跟踪每个客户也不记录过去的请求。

HTTP1.1：HTTP1.0的缺点很明显。如果用户访问的网页内有大量的图片、JS脚本等资源，每请求一个资源都要建立一个TCP连接，太不消耗资源。HTTP1.1允许多个HTTP请求复用一个TCP连接，然而这存在[头阻塞](QUIC.md)问题：**在HTTP/1.1的同一个TCP连接中，如果前一个请求没有处理完，后面的请求就得等待**。比如客户端发送了请求A和请求B，服务器必须按顺序处理A然后B，即使B的资源更早准备好，也得等A完成后才能发送B的响应。这就是**应用层的头阻塞**。为此浏览器会创建多个TCP连接（哈哈，又回来了，不过还是改进了一点）。

![](../../static/Pasted%20image%2020250228101230.png)

HTTP2.0：**解决了**应用层头阻塞问题，HTTP/2引入了多路复用（Multiplexing），允许在同一个TCP连接上并行发送多个请求和响应，这是因为HTTP/2将数据分解成多个帧（Frame），每个帧都有一个流标识符（Stream ID），这样不同的请求和响应可以交错传输，接收方根据流ID重新组装。这样，应用层的队头阻塞就被解决了，因为不需要按顺序处理请求，每个流是独立的，可以并行处理。但是TCP[头阻塞](QUIC.md)问题不能解决。为此浏览器会可能创建多个TCP连接（哈哈，又回来了，不过还是改进了一点）。

> 根据[Web Performance Calendar » Head-of-Line Blocking in QUIC and HTTP/3: The Details](https://calendar.perfplanet.com/2020/head-of-line-blocking-in-quic-and-http-3-the-details/)的描述，在大多数情况下信道丢包的概率已经足够小，TCP头阻塞不会是很严重的问题。

HTTP3.0通过QUIC技术彻底解决[头阻塞](QUIC.md)问题。

## 编程

HTTP可能是最流行的应用层协议了。很多库和二进制程序对发送、处理HTTP请求做了封装。

发送HTTP请求：

- [`curl`](../../工具/Linux.md)： 通过命令行构造HTTP请求。
- [`request`](../../编程语言/Python/库/HTTP.md)：通过Python脚本构造HTTP请求。

处理HTTP请求：

- [`net/http`](../../编程语言/Golang/库/net.md)：编写Golang应用，处理HTTP请求。只需要简单的三步。

## 参考链接

- [知乎 关于队头阻塞，看这一篇就足够了](https://zhuanlan.zhihu.com/p/330300133)
