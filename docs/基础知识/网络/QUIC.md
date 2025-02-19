---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# Quick UDP Internet Connections

## 数据包 Packet

数据包由数据包头和荷载（若干帧）组成。

### 数据包头

QUIC协议中的数据包分为两种头部格式：长包头（Long Header）和短包头（Short Header）。这两种包头格式用于不同的场景和协议阶段。

- 长包头：主要用于QUIC连接的建立阶段，包括初始握手、版本协商以及其他不需要最小化开销的控制消息。长包头包含足够的信息来识别和构建新的QUIC连接。长包头又分为初始、0-RTT、握手、重试4类。
- 短包头：用于连接建立后的数据传输阶段。设计更为简洁，以减少传输开销，适用于常规应用数据的传输。

### 帧

QUIC 帧是 QUIC 包的有效载荷。根据 RFC 9000第19章，QUIC 帧分为以下几类

- 填充帧（Padding Frame）：顾名思义，用来提高数据包大小，内容没有意义。
- Ping帧：顾名思义，验证对端是否活跃，无内容。
- ACK帧：
- 流重制帧（Reset Stream Frame）：关闭流的发送端。
- 停止发送帧（Stop Sending Frame）
- 加密帧（Crypto Frame）
- 新令牌帧（New Token Frame）
- 流帧（Stream Frame）
- 最大数据量帧（Max Data Frame）
- 最大流数据量帧（Max Stream Data Frame）
- 最大流帧
- 数据阻塞帧
- 流数据阻塞帧
- 流阻塞帧
- 新连接ID帧（New Connection ID Frame）
- 停用连接ID帧
- 通道挑战帧
- 回复通道帧
- 连接关闭帧
- 握手完成帧
- 扩展帧

## 状态机

QUIC有两种握手方式，如图

![](../../static/Pasted%20image%2020241128193719.png)

**Initial 1-RTT 握手**：适用于客户端与服务器之间首次建立连接的情况。这种方式通常包括以下步骤：

- **客户端发送初始包**：客户端使用基于固定salt的派生初始密钥发送加密的握手数据，包括加密套件建议、TLS版本和其他初始信息。
- **服务器响应**：服务器接收到客户端的初始包，用同样的方式解密并处理请求。然后，服务器返回一个包含服务器配置、TLS证书和其它加密参数的加密响应。
- **握手完成**：双方交换完毕必要的加密信息后，生成应用数据加密密钥，并完成握手，开始安全的数据传输。

**0-RTT握手**：适用于客户端与服务器之前已经建立过连接，并且客户端有缓存的服务器信息。这种方式的步骤包括：

- **0-RTT数据发送**：客户端不仅发送初始握手消息，还可以在同一个往返中发送加密的应用数据。这是因为客户端使用从之前会话中保存的密钥材料来加密这些数据。
- **服务器处理和响应**：服务器接收到客户端的数据后，首先处理0-RTT数据。如果会话信息有效，服务器可以直接使用接收到的数据，并快速发送响应。否则，服务器会发送新的参数和密钥更新信息，就和Initial 1-RTT握手差不多。

## 流多路复用

TCP为了保证数据按序到达，如果一个字节流中间丢失了部分数据，后续的数据都会因此阻塞。这种情况叫做**头阻塞**（Head-of-Line Blocking, HOL blocking）。如果应用层发送的若干个数据包之间，没有相互之间的顺序关系，这种按序到达的行为反而会成为缺点。

为此有2个解决办法：

1. 如果若干个数据包之间没有先后顺序，可以建立多个TCP连接分别传输数据。这也是HTTP/1.1采用的解决方案。
2. 重新搞一个传输层协议，允许传递多个字节流。这就是流多路复用，QUIC就是一个典型的例子。

## 参考链接

- [RFC 9000 - QUIC: A UDP-Based Multiplexed and Secure Transport](https://datatracker.ietf.org/doc/html/rfc9000)
- [RFC9000中文：QUIC传输协议](https://autumnquiche.github.io/RFC9000_Chinese_Simplified/)
- [State machine inference of QUIC](https://arxiv.org/pdf/1903.04384)
- [The QUIC Transport Protocol: Design and Internet-Scale Deployment](https://dl.acm.org/doi/pdf/10.1145/3098822.3098842)
