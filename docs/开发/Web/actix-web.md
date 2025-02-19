---
aliases: 
tags: 
date: 2025-01-17
date_modified: 2025-01-17
---

# Actix-Web

## 重要概念

- [`App`](https://docs.rs/actix-web/4.9.0/actix_web/struct.App.html)：是一个struct，一个实例对应着一个应用。在应用上可以管理状态、配置路由。
- [`Service`](https://docs.rs/actix-web/4.9.0/actix_web/dev/trait.Service.html)：是一个trait，规定了`Request`是如何异步的转化成`Response`。
- [`Transform`](https://docs.rs/actix-web/4.9.0/actix_web/dev/trait.Transform.html)：是一个trait，可以用来包装一个`Service`，添加额外功能。常用于实现中间件。
