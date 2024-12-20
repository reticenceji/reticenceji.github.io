---
aliases: 
tags: []
date_modified: 2024-12-11
date: 2024-11-30
---

# Docker

### Case 1: 代理

国内必须要面对的问题。国内的Docker Hub镜像基本都被封了，而直接拉太慢，有时根本访问不上。必须挂代理。

参考Docker的官方链接：<https://docs.docker.com/engine/cli/proxy/>

### Case 2: Dockerfile

如果要把自己程序的运行环境发布，最简单的办法就是编写Dockerfile文件，随源代码一起发布。
