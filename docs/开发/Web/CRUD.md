---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# Database CRUD

这篇属于Web开发的Database介绍文章，并不是想介绍Database的底层实现，也不是介绍SQL语句。而是介绍在Web开发中，我们如何连接、使用数据库。

## Connection

程序与PostgreSQL数据库通过 TCP/IP 或 Unix-domain sockets 建立连接，使用PostgreSQL自己指定的应用层传输协议，一般在5432端口运行。

可以简单的认为程序发送的请求是使用文本编码的SQL语句，返回的类型有PostgreSQL自己的编码规范。客户端程序需要根据规范解码。

常用的客户端程序有Python的`psycopg2`，C语言的`libpq`。

## ORM 框架

ORM框架大都挺难用的，有时候你会觉得还不如直接用Raw SQL。。。

### Python - SQLAlchemy

### Rust - SeaORM

<https://www.sea-ql.org/SeaORM/>
