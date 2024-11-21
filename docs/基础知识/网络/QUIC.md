---
aliases: 
tags: 
date_created: Monday, September 30th 2024, 11:40:49 pm
date_modified: Thursday, November 21st 2024, 3:07:02 pm
---

# Quick UDP Internet Connections

_**QUIC**_ (**Q**uick **U**DP **I**nternet **C**onnections, pronounced _quick_) is an experimental transport layer network protocol designed by Google.  Think of QUIC as being similar to TCP+TLS+HTTP/2 implemented on UDP.

## 流多路复用

TCP为了保证数据按序到达，如果一个字节流中间丢失了部分数据，后续的数据都会因此阻塞。这种情况叫做**头阻塞**（Head-of-Line Blocking, HOL blocking）。如果应用层发送的若干个数据包之间，没有相互之间的顺序关系，这种按序到达的行为反而会成为缺点。

为此有2个解决办法：

1. 如果若干个数据包之间没有先后顺序，可以建立多个TCP连接分别传输数据。这也是HTTP/1.1采用的解决方案。
2. 重新搞一个传输层协议，允许传递多个字节流。这就是流多路复用，QUIC就是一个典型的例子。
