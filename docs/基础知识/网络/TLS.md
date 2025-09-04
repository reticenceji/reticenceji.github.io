---
aliases: 
tags: 
date_modified: 2025-03-12
date: 2024-11-30
---

# TLS

TLS（传输层安全协议，Transport Layer Security）是一种广泛使用的安全协议，设计用来为网络通信提供隐私和数据完整性。TLS 是 SSL（安全套接层，Secure Sockets Layer）的后继者。HTTPS即HTTP+TLS。

## TLS的关键特性

- **加密**：TLS 提供加密服务，确保数据在互联网上的传输过程中不能被窃听。
- **身份验证**：TLS 支持使用证书来验证通信双方的身份，这些证书通常由可信的第三方证书颁发机构（CA）签发。
- **数据完整性**：TLS 提供消息完整性检查，确保数据在传输过程中没有被篡改。

> 如果证书没有CA认证，可能遭受中间人攻击。

## 步骤

TL;DR 通信的双方通过Diffie-Hellman (TLS1.3使用基于椭圆曲线的ECDH) 密钥交换，各自独立计算得到相同的密钥，加密之后的通信。
