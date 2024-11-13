---
aliases: 
tags: 
date_created: Monday, September 30th 2024, 11:40:49 pm
date_modified: Wednesday, November 13th 2024, 2:15:37 pm
---

# UDP

UDP 的一些特征：**无连接，不可靠，面向报文**。

| Property                        | Behavior                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| Connectionless Datagram Service | NO connection established. Packets may show up in any order                                         |
| Self contained datagrams        | UDP 对应用层的报文，添加首部之后直接交付给 IP 层。需要应用层决定合适的长度。                                                          |
| Unreliable delivery             | 1. No ack<br />2. No mechanism to detect missing or mis-sequenced datagrams<br />3. No flow control |

UDP 是一个不可靠的协议。所以通常用于并不需要 reliable delivery 的应用，或者我们可以基于 UDP 建立一个 reliable delivery，比如 Google 的 QUIC 协议。

UDP header 封装的额外信息非常的少，只有必要的信息。`src port|dst port|length|checksum`，可以看下面的图。和 UDP 打交道，就像和 IP 直接打交道一样。

![](../../static/Pasted%20image%2020240323151757.png)

- Checksum: 计算有些特殊。**计算伪首部、UDP 首部、UDP Data 的检验和。**如下图所示。伪首部和填充的 0（在 UDP 的长度不是偶数个字节的时候，我们会填入 0）是不传输的，仅仅作为计算 checksum 使用。
- length: UDP header + UDP data 的长度。单位是字节。

---
