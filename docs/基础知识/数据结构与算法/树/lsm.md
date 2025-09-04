---
aliases: 
tags: 
date: 2025-02-28
date_modified: 2025-02-28
draft: true
---

# lsm

LSM-Tree全称是Log Structured Merge Tree，是一种分层，有序，面向磁盘的数据结构，其核心思想是充分了利用了，磁盘批量的顺序写要远比随机写性能高出很多。使用这一原理优化的程序，大大提高了数据的写入能力，但是对随机读不太友好，一般用于：

1. 数据是被整体访问的，大多数数据库的WAL（write ahead log）也称预写log。
2. 数据是通过文件的偏移量offset访问的，比如Kafka。

## LSM Tree

LSM Tree不是严格意义上的树，而是由两个或更多类似树的数据结构组成。

## 参考链接

- [https://www.cs.umb.edu/~poneil/lsmtree.pdf](https://cloud.tencent.com/developer/tools/blog-entry?target=https%3A%2F%2Flinks.jianshu.com%2Fgo%3Fto%3Dhttps%253A%252F%252Fwww.cs.umb.edu%252F%257Eponeil%252Flsmtree.pdf&objectId=2180532&objectType=1&isNewArticle=undefined)
