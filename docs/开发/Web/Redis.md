---
aliases: 
tags: 
date_created: Wednesday, November 13th 2024, 1:30:01 pm
date_modified: Wednesday, November 13th 2024, 2:15:37 pm
---

# Redis

简单的说，Redis 认为是一个跨进程的HashMap。常用于将磁盘上的数据缓存在内存中。

Redis全称为：**Remote Dictionary Server**（远程数据服务），使用C语言编写，Redis是一个key-value存储系统（键值存储系统），支持丰富的数据类型，如：String、list、set、zset、hash。随着程序的不断更新，Redis提供的功能也越来越多。

## 数据结构

对Redis来说，所有的key都是字符串。value有5种数据类型，分别是：String、List、Set、Zset、Hash。
