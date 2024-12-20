---
aliases: 
tags: 
date_modified: 2024-12-18
date: 2024-11-30
---

# 内存数据库 - Redis

简单的说，Redis 认为是一个跨进程的HashMap。常用于将磁盘上的数据缓存在内存中。

Redis全称为：**Remote Dictionary Server**（远程数据服务），使用C语言编写，Redis是一个key-value存储系统（键值存储系统），支持丰富的数据类型，如：String、list、set、zset、hash。随着程序的不断更新，Redis提供的功能也越来越多。

## 环境搭建

Docker是最方便的

```bash
docker run \
    --publish=6379:6379 \
    --volume=$HOME/data/tokeninfo:/data \
    -d --name tokeninfo redis \
    redis-server --save 60 1 --loglevel warning
```

## 数据结构

对Redis来说，所有的key都是字符串。value有5种数据类型，分别是：String、List、Set、Zset、Hash。
