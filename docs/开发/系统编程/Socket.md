---
aliases: 
tags: 
date_created: Thursday, November 21st 2024, 4:22:43 pm
date_modified: Thursday, November 21st 2024, 4:36:04 pm
---

# Socket

## Basic Socket

在Unix/Linux系统中，Socket 也被视为一种文件。所以基本的编程方法也是：打开-读写-关闭。

使用`socket()`函数创建一个新的 Socket，类似于打开文件，返回一个整数类型的文件描述符。例如：

```cpp
socket_fd_ = socket(AF_INET, SOCK_DGRAM, 0);
```

- `AF_INET`：使用IPv4协议
- `SOCK_DGRAM`：使用UDP协议（数据报）
- `0`：使用默认协议

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
