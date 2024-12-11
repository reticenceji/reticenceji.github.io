---
aliases: 
tags:
  - 工具
date_modified: 2024-12-11
date: 2024-11-30
---

# SSH

### 本地端口转发

有三个机器：本地机器A，跳板机（可以访问服务的机器）B，服务器C。A可以访问B，B可以访问C，但是A不能直接访问C。

那么我们可以借助 ssh 的本地转发`-L` 功能。

```bash
ssh -L 8896:C:8895 user@B
```

将C的8895端口，映射到本地的8896端口，借助B。只要B能正常访问C的8895端口就可以。

### Broken Pipe

如果长久不和远程机器互动，可能会遇到 `Client_loop: send disconnect: Broken pipe` 的报错，连接断开。

在客户端上，可以通过添加 `-o ServerAliveInterval=30 -o TCPKeepAlive=no` 参数，这意味着每 30 秒，SSH 客户端会发送一个空的数据包到服务器。这个功能主要用来保持 SSH 会话的活跃状态，防止由于长时间无活动而导致的会话超时或被网络设备（如防火墙）断开连接。

在服务端，也可以编辑`/etc/ssh/sshd_config`的`ClientAliveInterval=30`，让SSH 服务器会每隔 30 秒向连接的客户端发送一个空的数据包或消息请求（ `ClientAliveCountMax` 了尝试的最大次数），用以检测客户端是否仍然连接并响应。如果客户端没有响应，服务器可以选择关闭连接，避免悬挂的会话占用资源。

---

参考链接：

[ssh的三种端口转发](https://jeremyxu2010.github.io/2018/12/ssh%E7%9A%84%E4%B8%89%E7%A7%8D%E7%AB%AF%E5%8F%A3%E8%BD%AC%E5%8F%91/)  
<https://unix.stackexchange.com/questions/602518/ssh-connection-client-loop-send-disconnect-broken-pipe-or-connection-reset>
