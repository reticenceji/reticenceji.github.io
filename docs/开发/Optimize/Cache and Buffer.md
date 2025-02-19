---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# Cache and Buffer

这里的Cache并不是指计算机中的硬件Cache，指的是缓存。Cache 的思想被用在很多的地方————用一个**更快的东西，将频繁使用的东西缓存**来加速。缓存不得不面对的困难——**缓存失效**。缓存也可以看作是一个**空间换时间**的办法。

1. 寄存器之于栈、堆：编译器优化已经很成熟了。
2. 硬件Cache 之于内存：一般来说只有量化，超算等特定领域关注。
3. 内存之于硬盘/数据库：比如 Redis。
4. 硬盘之于网络：比如很多 APP 都会缓存数据。客户端程序可以使用SQLite。
5. CDN 之于服务器：节点更近，速度更快。
6. DNS 浏览器缓存，OS 缓存，服务器缓存。
7. 如果一些运算过于复杂，也可以将运算的结果保存。

缓存是把读的结果存在更快的地方，预取是猜测之后要读的内容先把它存在更快的地方。

- 我们在使用库函数对文件进行读取的时候，可能真正读的内容要比我们指定的更多。预先读一点放在 Buffer 里。
- 视频的缓冲。

## 替换策略

在缓存有限的情况下，如果有新的数据需要加载进缓存，则需要将**最不可能被继续访问**的缓存剔除掉。  
那么我们怎么指定哪一个数据是最不可能被继续访问的呢？当然只能猜，基于假设 **一个key过去经常被访问，那么该key之后也会被经常访问**，我们有LRU（least recently used）策略，顾名思义是剔除上一次访问时间最久的数据。

LRU的实现很简单，可以使用一个哈希表+一个双向链表完成。

- **哈希表**：用于保证缓存的查找时间为 O(1)O(1)。哈希表存储键和指向链表节点的指针。
- **双向链表**：链表的每个节点包含键值对，链表按照被访问的时间排序，最近访问的节点移到链表头部，最久未访问的节点在链表尾部。
- **访问数据**：
    - 如果数据在缓存中（哈希表能找到），则将数据对应的节点移动到链表头部。
    - 如果数据不在缓存中，继续下面的步骤。
- **插入数据**：
    - 如果缓存未满，直接在链表头部添加节点，并在哈希表中添加键和指针。
    - 如果缓存已满，删除链表尾部的节点，并且在哈希表中删除对应的键，然后在链表头部添加新节点，哈希表中也添加新的键和指针。

LRU具体的实现，可以参考[数据结构-LRU](../../基础知识/数据结构与算法/LRU.md)这篇文章的介绍。

## 编程实践

这里介绍一些库或者代码。

### Example Of Read Buffer

举一个例子，不过在系统内核中 read 系统调用有没有做一定的缓存呢？我不清楚。即使有，系统调用的速度也是稍慢的，因为涉及特权级的转换，我们做的 buffer 肯定也还是有用的。程序是计算一个 4G 文件的 checksum，当然下面计算的时候在不是 8 字节对齐没有补零是不对的。下面的程序为了更贴近底层也是直接用系统调用做了。

无 buffer 版

```c
#include <fcntl.h>
#include <stdio.h>
#include <sys/stat.h>
#include <unistd.h>

int main() {
    char buffer[8];
    long checksum = 0;

    int fd = open("disk.dd", O_RDONLY);
    while (1) {
        int b = read(fd, buffer, 8);
        if (b != 8)
            break;
        checksum ^= *(long *)buffer;
    }
    printf("checksum = 0x%lx\n", checksum);
    close(fd);
}
// checksum = 0xdcce4fdc7fd2151d
// real    6m13.657s
// user    0m40.016s
// sys     5m33.439s
```

有 buffer 版

```c
#include <fcntl.h>
#include <stdio.h>
#include <sys/stat.h>
#include <unistd.h>

int main() {
    char buffer[4096];
    long checksum = 0;

    int fd = open("disk.dd", O_RDONLY);
    while (1) {
        int b = read(fd, buffer, 4096);
        for (int i = 0; i < (b >> 3); i++) {
            checksum ^= *((long *)buffer + i);
        }
        if (b <= 8)
            break;
    }
    printf("checksum = 0x%lx\n", checksum);
    close(fd);
}
// checksum = 0xdcce4fdc7fd2151d
// real    0m5.857s
// user    0m3.187s
// sys     0m2.550s
```

可以看到两个的速度差的不是一点半点。我也用了 `fread` 试了一下，发现即使一次读 8 字节 `fread` 的效率也不会太差。`fread` 是自带缓存的。我又去查了一下，在 stackoverflow 上看到了，也是验证了我的猜想。

> `read()` is a low level, unbuffered read. It makes a direct system call on UNIX. 其实也并不是完全没有缓存，内核还是有做的。
> 
> `fread()` is part of the C library, and provides buffered reads. It is usually implemented by calling `read()` in order to fill its buffer.

顺便来一个 Rust 版本的，和 C 语言的语义几乎一模一样。Rust 中可以用 `BufReader` 去套一个实现了 `Read` trait 的结构，就可以自动的实现 buffer 的功能了，非常方便。

不过有意思的是如果用 debug 模式执行会非常的慢，而且是慢在了 user 部分，我猜测可能是这个 transmute_copy 老老实实的在内存中完成了，没有做相应的优化，Rust 的汇编太复杂了，以后有空在深究这个问题。

Rust 使用 BufReader

```rust
use std::{
    fs::File,
    io::{BufReader, Read},
};

fn main() {
    let mut buffer = [0u8; 8];
    let buffer = &mut buffer;

    let f = File::open("disk.dd").unwrap();
    let mut f = BufReader::with_capacity(4096, f);

    let mut checksum: u64 = 0;
    loop {
        let b = f.read(buffer).unwrap();
        if b == 8 {
            unsafe {
                checksum = std::mem::transmute_copy::<[u8; 8], u64>(buffer) ^ checksum;
            }
        } else {
            break;
        }
    }
    println!("checksum = 0x{:x}", checksum);
}
// debug模式下，注意这里耗时的是user部分
// checksum = 0xdcce4fdc7fd2151d
// real    4m13.759s
// user    4m11.227s
// sys     0m2.464s

// release模式下
// checksum = 0xdcce4fdc7fd2151d
// real    0m9.864s
// user    0m7.135s
// sys     0m2.678s
```

### Rust - cached

使用内存对数据进行缓存的方法有很多。如果可以将缓存抽象为使用Key-Value的方式存储：

- Redis：Redis服务器作为一个独立的进程，不会随主程序关闭而丢失。功能丰富。
- 最简单直白：使用哈希表存，`HashMap`。
- ...

但是这些方法或多或少都需要你稍微修改一下原本程序的逻辑：

1. 首先要去需求，生成key，对缓存进行读取
    1. 如果命中（可能还要判定缓存是否还合法），返回缓存数据。
    2. 如果没有命中，使用原本程序逻辑获取数据，保存到缓存中，返回。

不难发现，这个逻辑实际上是通用的。可以将它抽象出来。在Rust中，使用宏来完成这个工作是比较合适的。**[cached](https://github.com/jaemk/cached)** 这个库帮我们实现了这个抽象。

使用这个库，我们首先要将 原本程序的逻辑（可能是耗时久的I/O，可能是耗时久的计算？anything） 提取成一个不使用`self`的函数，`f(x,x,x) -> y`。然后使用`#[cached]`宏修饰函数。

1. 自定义使用“KV数据库”类型，它现在支持`RedisCache`（如果要使用Redis可以用这个）、`TimedCache`（如果觉得数据会过期可以用这个），`SizedCache`（如果觉得需要限制缓存大小可以用这个），`DiskCache`（如果觉得缓存数据需要持久化可以用这个，在背后使用了 **[sled](https://github.com/spacejam/sled)** 数据库，类似KV版的SQLite）。
2. 自定义使用的Key。
    1. 如果不定义的话，会使用函数所有的参数算Hash作为Key（除了Redis和Disk），Redis和Disk默认用Display方法的结果作为Key。
    2. 使用`convert`修改Key。
3. Value就是返回值。需要实现`Clone`（除了 Redis和Disk），Redis和Disk需要实现`Serialize`和`DeserializeOwned`。

> Redis 毕竟没法直接存储Rust中的数据结构，很合理。那难道Sled可以直接存储Rust中的数据结构？还是他的文档没有写清楚？

### Rust - LRU

[lru-rs](https://github.com/jeromefroe/lru-rs)这个库实现了LRU，思路和上述相同。
