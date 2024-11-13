---
aliases: 
tags: [TODO]
date_created: Monday, September 30th 2024, 11:40:49 pm
date_modified: Wednesday, November 13th 2024, 2:15:37 pm
---

# HTTP

HTTP 是超文本传输协议，也就是**H**yperText **T**ransfer **P**rotocol。

HTTP可以说是使用的最多的应用层协议了。它自身也在不断发展，从最开始的HTTP/1.0 -> HTTP/1.1 -> HTTP/2 -> HTTP/3。但是不管怎么发展，它做的事情是一样的：两点之间的通信协议，发送 Request 包，返回 Response 包，包的内容是超文本（也就是啥都可以发，不仅限纯文本）。

## HTTP Packet

HTTP Packet 由 Header 和 Body 组成。分为Request Packet和Response Packet。

Request 包的基本格式如下， `POST` 是方法，`/form/entry` 是 URI，`HTTP/1.1` 是版本，后面是首部字段，最后是请求体。

```
POST /form/entry HTTP/1.1
Host: hackr.jp
Connection: keep-alive
Content-Type: application/x-www-form-urlencoded
Content-Length: 16

name=ueno&age=37
```

收到 Request 之后，服务器会返回 Response。`HTTP/1.1` 是版本，`200` 是状态码，`OK` 是状态说明，后面是首部字段，最后是响应体。

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

个人觉得只需要知道分类就可以了。

![](../../static/Pasted%20image%2020240323153822.png)

#TODO 
