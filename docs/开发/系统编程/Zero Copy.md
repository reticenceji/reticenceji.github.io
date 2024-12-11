---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# Zero Copy

## 减少内核和用户之间的拷贝

出于安全的考虑，内核不应该直接使用用户指针指向的内存，用户更不可能直接使用内核指针指向的内存。他们之间的信息交换，基本都要涉及拷贝，比如 Linux 上的 `copy_to_user` 和 `copy_from_user`。

[`mmap`](https://man7.org/linux/man-pages/man2/mmap.2.html) 也是一个非常好用的东西。什么是 mmap？mmap 是一种内存映射文件的方法，即将一个文件或者其它对象映射到进程的地址空间，实现文件磁盘地址和进程虚拟地址空间中一段虚拟地址的一一对映关系。实现这样的映射关系后，进程就可以使用操作内存的方式操作文件，而系统会自动回写脏页面到对应的文件磁盘上，即完成了对文件的操作而不必再调用 read,write 等系统调用函数。相反，内核空间对这段区域的修改也直接反映用户空间，从而可以实现不同进程间的文件共享。

所以，当你有若干个进程以只读的方式访问一个文件，或者是访问较大文件的大块，用 `mmap` 都是很好的选择。`mmap` 还可以用来做进程通信。不过并不是所有的文件都可以用 `mmap` 来访问，例如 socket 就只能用他专有的接口读写，还有 pipe 类型的文件就只能用 `read`/`write` 等。也不是所有能用 `mmap` 的文件都适合用 `mmap`，一个和 page 差不多大的文件，或者你就想从文件中读那么几个字节，用 `mmap` 适得其反。

使用 mmap

```c
#include <fcntl.h>
#include <stdio.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>

int main() {
    long checksum = 0;
    struct stat sb;

    int fd = open("disk.dd", O_RDONLY);
    fstat(fd, &sb);
    void *file = mmap(0, sb.st_size, PROT_READ, MAP_PRIVATE, fd, 0);

    for (long i = 0; i < (sb.st_size >> 3); i++) {
        checksum ^= *((long *)file + i);
    }
    printf("checksum = 0x%lx\n", checksum);
    close(fd);
}

// checksum = 0xdcce4fdc7fd2151d
// real    0m5.762s
// user    0m2.910s
// sys     0m2.358s
```

mmap 为什么会比带 buffer 的 read/write 快呢，Page Size 是 4K，每次缺页加载 4K，和我之前手动 Buffer 不是很相似吗？因为 **少了一次 CPU 的拷贝**。试想 read 的过程，DMA 将数据从硬盘拷贝到 kernel space，CPU 再将数据从 kernel space 拷贝到 user space；而 mmap 就少了一次从 kernel space 拷贝到 user space 的过程。

不过在使用 mmap 的时候需要小心，如果有其他的进程截断了文件，那么你可能会访问到一个非法的地址，从而进程被杀死。

除了 `mmap`，[`sendfile`](https://man7.org/linux/man-pages/man2/sendfile.2.html)/[`splice`](https://man7.org/linux/man-pages/man2/splice.2.html) 也可以实现类似的减少从 kernel space 到 user space 拷贝的作用，我们在后面介绍。他们提供的这种特性叫做 **零拷贝 Zero Copy**，[知乎上的这篇文章](https://zhuanlan.zhihu.com/p/308054212) 提供了一个很好的介绍。

> 如果追求极致，你可以绕过内核做 I/O 操作，不过一般情况下这样做会牺牲相当的灵活性、可移植性，而且非常困难。

## 针对网络的零拷贝技术

下面我们要面对的场景，是我们从硬盘中读取数据到内存，进行处理，然后写到网卡中。这是一个很典型的网络应用的操作。

那么，最原始的使用 `read/write` 进行操作的话，我们将至少会有 4 次拷贝。中间两次是内存中的拷贝，虽然需要内核态到用户态的切换，但是相对 I/O 来说还是快的。但是我们还是要优化中间 2 次。

- 硬盘拷贝到内存（内核态），DMA，慢
- 内核态拷贝到用户态，CPU，快
- 用户态拷贝到内核态，CPU，快
- 内存（内核态）拷贝到网卡，DMA，慢

如果我们使用之前介绍的 `mmap`，我们可以优化到 3 次。

使用 `sendfile`，可以优化到 2 次，硬盘 ->内核态内存 ->网卡。但是你也发现了，没有经过用户态我们怎么处理数据，答案就是 **没法处理数据**，所以他可能只适合用于静态服务器。那么既然都无法处理了，还拷到内存干啥？能不能直接从硬盘 DMA 到网卡呢？答案是可以，新的 Linux 已经让 `sendfile` 可以做到这一点了，也就是可以优化到 1 次了。`splice` 也是类似的。

## Copy On Write

其实这是一种思想，对于读多写少的场景的优化。在追求极致优化的内核中得到了广泛使用。你看到 `rcu` 字样的时候，多半就是 copy on write。
