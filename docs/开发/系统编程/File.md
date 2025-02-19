---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# File

Linux的哲学是“一切皆文件”。所以学习如何操作File是Linux编程的重要部分。

## Introduction

### Basic IO

所有执行 I/O 操作的系统调用都以**文件描述符**，一个非负整数（通常是小整数），来指代打开的文件。文件描述符用以表示所有类型的已打开文件，包括管道（pipe）、FIFO、socket、终端、设备和普通文件。按照惯例，0是标准输入文件，1是标准输出文件，2是标准错误文件。

对文件的操作可以抽象为三个步骤-打开文件，操作（读写）文件，关闭文件。分别对应4个系统调用：

- `fd = open(pathname, flags, mode)` 函数打开 `pathname` 所标识的文件，并返回文件描述符，用以在后续函数调用中指代打开的文件。如果文件不存在，`open()`函数可以创建之，这取决于对位掩码参数 `flags` 的设置。`flags` 参数还可指定文件的打开方式：只读、只写亦或是读写方式。`mode` 参数则指定了由 `open()` 调用创建文件的访问权限，如果 `open()` 函数并未创建文件，那么可以忽略或省略 mode 参数。
- `numread = read(fd, buffer, count)` 调用从 `fd` 所指代的打开文件中读取至多 `count` 字节的数据，并存储到 `buffer` 中。`read()`调用的返回值为实际读取到的字节数。如果再无字节可读（例如：读到文件结尾符 `EOF` 时），则返回值为 `0`。
- `numwritten = write(fd, buffer, count)` 调用从 `buffer` 中读取多达 `count` 字节的数据写入由 `fd` 所指代的已打开文件中。`write()`调用的返回值为实际写入文件中的字节数，且有可能小于 `count`。
    - 值得注意的是对磁盘文件执行 I/O 操作时，`write()`调用成功并不能保证数据已经写入磁盘。可能还需要额外的同步。
- `status = close(fd)`在所有输入/输出操作完成后，调用 `close()`，释放文件描述符 `fd` 以及与之相关的内核资源。

在[Cache and Buffer](../Optimize/Cache%20and%20Buffer.md) 这篇文章中，我们探讨了系统调用`read`和`write`是不包含Buffer的，而通过在应用层添加Buffer往往可以大大提高读写的效率。

虽然上面的四个系统调用，配合不同的参数可以处理绝大多数的情况。但是上面的“文件”实际上是一种抽象的字节流，实际上的文件可能是一些奇奇怪怪的外设。为此`ioctl()`系统调用又为执行文件和设备操作提供了一种多用途机制。

### File Property

利用系统调用 `stat()`、`lstat()`以及 `fstat()`，可获取与文件有关的信息，其中大部分提取自文件 i-node。包括时间戳、属主信息、权限信息等。

### Directory and Link

目录是一种特殊的文件。虽然一个进程能够打开一个目录，但却不能使用 `read()` 去读取目录的内容，同样也不能使用 `write()`来改变一个目录的内容，而是使用`getdents()` 系统调用读取目录内容，使用`link()`、`mkdir()`、`symlink()`、`unlink()`及 `rmdir()`之类的系统调用来间接（向内核请求）改变其内容。

### 监控文件系统事件

某些应用程序需要对文件或目录进行监控，已侦测其是否发生了特定事件。例如，当把文件加入或移出一目录时，图形化文件管理器应能判定此目录是否在其当前显示之列，而守护进程可能也想要监控自己的配置文件，以了解其是否被修改。  
自内核 2.6.13 起，Linux 开始提供 inotify 机制，以允许应用程序监控文件事件。

### Pipe

## Kernel Details

知道一些内核实现上的细节可以帮我我们更好的编写应用程序。

### 文件描述符和打开文件之间的关系

Linux利用三个数据结构维护打开的文件：

- 进程级的 **文件描述符表 File Descriptor Table**。
- 系统级的 **打开文件表 Open File Table**。
- 文件系统的 **i-node 表**。
- 针对每个进程，内核也为其维护了 **Open File Descriptor Table**。他保存对**Open File Description Table**条目的引用。
- 内核对所有打开的文件维护有一个系统级的 **Open File Table**。一个打开文件句柄存储了与一个打开文件相关的全部信息，如下所示。
    - 当前文件偏移量（调用 read()和 write()时更新，或使用 lseek()直接修改）。
    - 打开文件时所使用的状态标志（即，open()的 flags 参数）。
    - 文件访问模式（如调用 open()时所设置的只读模式、只写模式或读写模式）。
    - 与信号驱动 I/O 相关的设置。
    - 对该文件 i-node 对象的引用。

他们之间的关系如图所示：

![文件描述符表 打开文件表 i-node表](../../static/Pasted%20image%2020241001234625.png)

> ![NOTE]  
> 所以想要让两个进程同时对文件进行读写不冲突，除了使用APPEND模式（日志的写法），还可以让他们指向同一个打开文件表中的项目，除了FORK，还可以通过 UNIX 域套接字将一个打开的文件描述符传递给另一进程。

### 虚拟文件系统

参考[VFS](../../基础知识/操作系统/VFS.md)。这是曾经在木链实习的时候做的一些笔记。

## Practice

- [Python - File](../../编程语言/Python/库/文件.md)
