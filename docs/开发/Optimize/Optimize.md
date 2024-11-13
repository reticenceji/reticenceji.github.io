---
aliases: 
tags: 
date_created: Monday, September 30th 2024, 11:40:49 pm
date_modified: Wednesday, November 13th 2024, 2:15:37 pm
---

# 程序优化

 克努特优化原则：We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil。它告诉我们，不要过早的优化程序，不要过度设计。

 Amdahl 定律，如果我们将程序中 性能消耗占比为 a 的部分优化了 n 倍，我们得到的效果是 $$S=\frac1{(1−a)+a/n}​$$  
他告诉我们，要优化程序，要抓住程序的性能瓶颈所在，才能做到有效优化。

| OP(io)                                               | cost（1s= 10^9ns) |
| ---------------------------------------------------- | ---------------- |
| L1 cache reference 读取CPU的一级缓存                        | 0.5 ns           |
| Branch mispredict(转移、分支预测)                           | 5 ns             |
| L2 cache reference 读取CPU的二级缓存                        | 7 ns             |
| Mutex lock/unlock 互斥锁\解锁                             | 100 ns           |
| Main memory reference 读取内存数据                         | 100 ns           |
| Compress 1K bytes with Zippy 1k字节压缩                  | 10,000 ns        |
| Send 2K bytes over 1 Gbps network 在1Gbps的网络上发送2k字节   | 20,000 ns        |
| Read 1 MB sequentially from memory 从内存顺序读取1MB        | 250,000 ns       |
| Round trip within same datacenter 从一个数据中心往返一次，ping一下 | 500,000 ns       |
| Disk seek 磁盘搜索                                       | 10,000,000 ns    |
| Read 1 MB sequentially from network 从网络上顺序读取1兆的数据    | 10,000,000 ns    |
| Read 1 MB sequentially from disk 从磁盘里面读出1MB          | 30,000,000 ns    |
| Send packet CA->Netherlands->CA 一个包的一次远程访问           | 150,000,000 ns   |
