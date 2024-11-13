---
aliases: 
tags: 
date_created: Tuesday, November 12th 2024, 10:39:23 am
date_modified: Wednesday, November 13th 2024, 2:15:37 pm
---

# Linux

此处主要记录一些常用的指令。

### 查找进程 pid

```bash
ps aux | grep [name]
```

### 查看进程内存使用大小

可以通过`/proc`文件系统完成，在输出中查找 `VmRSS`（实际内存使用量）和 `VmSize`（虚拟内存大小）。

```bash
cat /proc/[pid]/status
```

### 查看端口占用情况

`lsof`（list open files）是一个查看正在被进程使用的文件描述符的工具，其中也包括网络套接字。`-i` 选项用来显示网络相关的文件描述符。

```bash
lsof -i [:port]
```

`ss`（socket statistics）命令是一个非常有效的工具，用于显示套接字信息。查看所有端口的占用情况命令如下，想查看特定端口可以结合`grep [:port]`。

  ```bash
  ss -tuln
  ```

  - `-t` 显示 TCP 端口
  - `-u` 显示 UDP 端口
  - `-l` 列出正在监听的套接字
  - `-n` 避免进行服务名称解析（显示端口号而不是服务名）
