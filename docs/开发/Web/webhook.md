---
aliases: 
tags: 
date: 2025-02-25
date_modified: 2025-02-27
---

# Webhook

在传统的Server-Client模型中，只能是由Client向Server主动发起请求，获取响应。但是，设想一个这样的场景，Client希望在某个条件得到满足的时候，得到Server的通知，需要怎么办？

- 例如，我希望在数据库的订单表中插入一条新数据时，进行处理。
- 例如，我希望在Gitlab仓库中上传新代码时，自动执行pipeline。

如果只能由“我”发起请求，那就只能轮询了。这种情况，最好让Server（上面的例子中就是数据库/Gitlab）在条件满足时，**向我发起请求来通知我**（事实上倒转了Server和Client）。这就是Webhook。如果使用Webhook，过程应该是：

- 我希望在数据库的订单表中插入一条新数据时，进行处理。我向数据库注册一个Webhook，让他在订单表中插入新数据时访问我的URL。如[Realtime | Supabase Docs](https://supabase.com/docs/guides/realtime)在PostgreSQL的replication功能上添加了Webhook功能。
- 类似。Jnekins支持在Gitlab中添加Webhook。

![webhook](https://raw.githubusercontent.com/sky-L/system-design-101-zh/refs/heads/main/images/webhook.jpeg)

当然，局限性也是有的。作为Client的”我“必须要能够接受HTTP请求，也就是要写一个Server了。

从上面的例子中，不难总结出Webhook的几个要点（后三个就是API的要点）：

1. 触发条件。
2. Webhook URL。
3. 数据传输。
4. 接收方处理。

> [!NOTE]
  并不是“触发某种条件发送通知”的场景就一定要用Webhook。这种场景的通用解法应该是**Hook**，也就是在触发某种条件时执行规定的操作，不一定是要访问一个API。不要有了一个锤子看谁都像钉子。
