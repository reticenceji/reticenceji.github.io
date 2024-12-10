---
aliases: 
tags: 
date_created: Tuesday, November 12th 2024, 10:39:23 am
date_modified: Monday, December 9th 2024, 7:35:24 pm
---

# Linux

此处主要记录一些常用的指令。

## Shell Commands

### 查找进程 pid `ps`

```bash
ps aux | grep [name]
```

### 查看进程内存使用大小 `/proc`

可以通过`/proc`文件系统完成，在输出中查找 `VmRSS`（实际内存使用量）和 `VmSize`（虚拟内存大小）。

```bash
cat /proc/[pid]/status
```

### 查看端口占用情况 `lsof`/`ss`

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

### TCP请求监控 `tcpdump`

例如，我想监控主机向192.168.0.52:8545端口发送的HTTP请求。

```bash
sudo tcpdump -i any dst 192.168.0.52 and port 8545 -w /path/to/logfile.pcap
```

然后我们会得到一个pcap文件。可以使用wireshark对他进行可视化分析。或者**编写 Python 脚本来分析 PCAP 文件**。例如，使用Python解析所有PCAP文件中的所有 HTTP POST 请求：

```python
from scapy.all import *

def http_post_packets(pcap_file):
    # 读取PCAP文件
    count = 0
    packets = rdpcap(pcap_file)
    
    # 过滤包含HTTP POST请求的数据包
    for pkt in packets:
        if pkt.haslayer(TCP) and pkt.haslayer(Raw):
            # 获取Raw层数据
            payload = pkt[Raw].load.decode(errors='ignore')
            # 检查是否为HTTP POST请求
            if "POST" in payload and payload.startswith("POST"):
                count += 1
                src_ip = pkt[IP].src
                dst_ip = pkt[IP].dst
                src_port = pkt[TCP].sport
                dst_port = pkt[TCP].dport
                # 尝试从请求中获取路径
                path = payload.split(" ")[1] if len(payload.split(" ")) > 1 else "Unknown Path"
                
                # 打印出请求详情
                print(f"HTTP POST Request from {src_ip}:{src_port} to {dst_ip}:{dst_port}")
                print(f"Path: {path}")
                print(f"Payload:\n{payload}")  # 打印部分payload以避免过长
                print("-" * 40)    

    print(f"Total HTTP POST requests: {count}")
    
if __name__ == "__main__":
    # 指定PCAP文件路径
    pcap_file_path = 'xxx.pcap'
    http_post_packets(pcap_file_path)
```

### 构造HTTP请求 `curl`

- `-X` 指定 Request Method
- `-H` 指定 Request Head
- `-d` 指定 Request Body

```bash
curl -X POST -H "Content-Type: application/json" -d '{"chain_id": 1, "attributes": ["Hot Wallet"], "limit": 2000}' http://172.29.4.222:7001/label/address/by-attributes
```

## Desktop Environment

我并不想花很多时间让桌面环境变得很漂亮，但是作为日常使用系统也不能太丑。。。

### Flatpak 应用字体

- [Linux 下的字体调校指南 - Leo's Field](https://szclsya.me/zh-cn/posts/fonts/linux-config-guide/)
- [Flatpak 应用中文字体问题 – Glaumar's Blog](https://blog.geekgo.tech/linux/flatpak-%E5%BA%94%E7%94%A8%E4%B8%AD%E6%96%87%E5%AD%97%E4%BD%93%E9%97%AE%E9%A2%98/)
