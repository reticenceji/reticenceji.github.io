---
aliases: 
tags: 
date_created: Monday, September 30th 2024, 11:40:49 pm
date_modified: Wednesday, November 20th 2024, 4:03:13 pm
---

# UDP

UDP 的一些特征：

- 无连接：通信双方不需要建立连接。。
- 不**可靠**：不保证数据包按序到达，也不保证数据包一定能到达。
- 面向报文：应用层交给UDP多长的报文，UDP就照样发送，不会拆分或合并数据。

UDP 是一个不可靠的协议。所以通常用于并不需要可靠传输的应用，如直播、在线游戏、语音通话等。或者我们可以基于 UDP 建立一个可靠传输，比如 Google 的 QUIC 协议。

## UDP 报文格式

UDP header 封装的额外信息非常的少，只有必要的信息。`src port|dst port|length|checksum`，可以看下面的图。和 UDP 打交道，就像和 IP 直接打交道一样。

![](../../static/Pasted%20image%2020240323151757.png)

- Checksum: 计算有些特殊。**计算伪首部、UDP 首部、UDP Data 的检验和。**如下图所示。伪首部和填充的 0（在 UDP 的长度不是偶数个字节的时候，我们会填入 0）是不传输的，仅仅作为计算 checksum 使用。
- length: UDP header + UDP data 的长度。单位是字节。
