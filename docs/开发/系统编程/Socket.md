---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# Socket

## Socket基础

在Unix/Linux系统中，Socket 也被视为一种文件。所以基本的编程方法也是：打开-读写-关闭。

使用`socket()`函数创建一个新的 Socket，类似于打开文件，返回一个整数类型的文件描述符。例如：

```cpp
// int socket(int domain, int type, int protocol);
int socket_fd_ = socket(AF_INET, SOCK_DGRAM, 0);
```

- `AF_INET`：使用IPv4协议
- `SOCK_DGRAM`：使用数据报
    - `SOCK_STREAM`：使用数据流
- `0`：使用默认协议，对于数据报来说是UDP，对于数据流来说是TCP。

那么如何写呢？还是以UDP协议为例。根据我们对UDP协议的认识，我们只需要指定发送的IP和PORT，就可以发送数据包了，不需要建立连接。调用`sendto`方法。

```cpp
bool sendTo(const std::string& data, const std::string& ip, uint16_t port) {
    struct sockaddr_in dest_addr;
    dest_addr.sin_family = AF_INET;
    dest_addr.sin_port = htons(port);
    dest_addr.sin_addr.s_addr = inet_addr(ip.c_str());

    ssize_t sent = sendto(socket_fd_, data.c_str(), data.length(), 0,
                         (struct sockaddr*)&dest_addr, sizeof(dest_addr));
    return sent > 0;
}
```

那么如何读呢？对于UDP协议来说，只需要指定本机的端口（`bind`），然后调用`recvfrom`即可。

一个更全面的读写方法总结如下：

| Reading    | Writing    | Description                         |
| ---------- | ---------- | ----------------------------------- |
| `read`     | `write`    | 在一个连续的buffer上进行读/写                  |
| `readv`    | `writev`   | 在多个buffer上进行读/写                     |
| `recv`     | `send`     | 相比于 `read` & `write`，有更多的控制 flag    |
| `recvfrom` | `sendto`   | 同时获取/指定远程地址的读/写（针对基于包的协议）           |
| `recvmsg`  | `sendmsg`  | 相比于`readv`/`writev` ，有更多的控制 flag    |
| `recvmmsg` | `sendmmsg` | 在一个syscall完成多次 `recvmsg`/`sendmmsg` |

对于需要建立连接的协议（如TCP），在读写之前还需要更多的准备工作。**一般**的步骤如下图所示。服务端创建socket，绑定端口（`bind`）然后开启监听（`listen`），不断等待客户端连接（`connect`）。参考链接中给出了一些特殊的情况。

![TCP](https://media.geeksforgeeks.org/wp-content/uploads/20220330131350/StatediagramforserverandclientmodelofSocketdrawio2-448x660.png)

这些系统调用的具体使用细节可以参考manpage。有下面一些值得一提的点：

- `bind()`调用的第二个参数是`const struct sockaddr *addr`，但是实际上具体的地址细节由协议确定，所以对于TCP/UDP协议来说，都是实际传入`sockaddr_in`，也正因为如此第三个参数要传递`len`（数据是肯定要复制到内核态操作的）。`accept`同理。
- `read`&`write`会返回实际读写的字节数。这在网络编程的时候尤为重要。即便我们知道客户端一次发送了10字节的数据，但是一次`read`可能也会只收到4字节的数据，因为剩下的数据还没有到达。`write`则是因为内核的缓冲区大小有限。

## I/O Multiplexing

在上面介绍的Socket基础中，`read`/`write`/`accept`在没有就绪的时候都会阻塞，直到操作完成或出错。但是Linux也支持非阻塞（non-blocking）模式。如果开启了非阻塞模式，无论操作完成与否都会立即返回，如果没有就绪会返回`EAGAIN`提醒用户态稍后重试。

显然，光有非阻塞模式并不能提高效率——用户总不能在返回EAGAIN之后sleep一会儿，或者是直接重试吧，关键是要知道**操作何时能就绪**。为此，Linux提供了以下几个系统调用（集）：

- **`select`** 和 **`poll`**: 这两种技术允许程序监视多个文件描述符，以查看哪个或哪些文件描述符已准备好进行非阻塞I/O操作。这使得单个线程能够有效地管理多个I/O流。`select`较老，智能同时监听较少的fd。
- **`epoll`**: 是一种更高效的I/O事件通知方法，特别是在处理大量文件描述符时。与select和poll相比，epoll通过一种**更有效**的方式管理大量文件描述符的变化，减少了系统调用的开销。

> [!NOTE]
> `select`和 `pool` 是符合 POSIX 标准的，是标准的UNIX接口的一部分。`epoll`是Linux独有的。
> 显然，这些系统调用是阻塞的。这是很多语言实现异步IO的基础。

## 参考链接

- [4.20 没有 accept，能建立 TCP 连接吗？ | 小林coding](https://xiaolincoding.com/network/3_tcp/tcp_no_accpet.html#%E6%80%BB%E7%BB%93)
- [4.19 服务端没有 listen，客户端发起连接建立，会发生什么？ | 小林coding](https://xiaolincoding.com/network/3_tcp/tcp_no_listen.html#_4-19-%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%B2%A1%E6%9C%89-listen-%E5%AE%A2%E6%88%B7%E7%AB%AF%E5%8F%91%E8%B5%B7%E8%BF%9E%E6%8E%A5%E5%BB%BA%E7%AB%8B-%E4%BC%9A%E5%8F%91%E7%94%9F%E4%BB%80%E4%B9%88)
- [05. The Event Loop & Nonblocking IO | Build Your Own Redis with C/C++](https://build-your-own.org/redis/05_event_loop_intro)
