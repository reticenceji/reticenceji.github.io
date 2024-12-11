---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# BPF

## 起源

 BPF 的全称是 Berkeley Packet Filter, 即伯克利报文过滤器，它的设计思想来源于 1992 年的一篇论文[The BSD packet filter: A New architecture for user-level packet capture](https://www.tcpdump.org/papers/bpf-usenix93.pdf)（《BSD数据包过滤器：一种用于用户级数据包捕获的新体系结构》）。最初，BPF 是在 BSD 内核实现的，后来，由于其出色的设计思想，其他操作系统也将其引入, 包括 Linux。

现在提到更多的是eBPF(extended BPF，现在的BPF可以做的不仅仅是包过滤，所以可以当作一个专有名词)。它的价值是**可以在特权上下文中（如操作系统内核）运行沙盒程序**。

## 字节码

（这里介绍的Linux内核中的实现）eBPF 是一个 RISC **寄存器**虚拟机，共有[11 个 **64 位** 寄存器](https://github.com/torvalds/linux/blob/3d54351c64e8f9794e8838196036a2de3d752fce/include/uapi/linux/bpf.h#L60)，一个程序计数器和 512 字节的固定大小的栈。

| **`r0:`**    | 存储返回值，包括函数调用和当前程序退出代码                   |
| ------------ | ------------------------------------------------------------ |
| **`r1-r5:`** | 作为函数调用参数使用，在程序启动时，r1 包含 "上下文" 参数指针 |
| **`r6-r9:`** | 这些在内核函数调用之间被保留下来                             |
| **`r10:`**   | 每个 eBPF 程序 512 字节栈的只读指针                          |

eBPF 指令也是固定大小的 **64 位**编码，目前大约有 100 条指令，参考<https://github.com/iovisor/bpf-docs/blob/master/eBPF.md>。

eBPF 验证器：如果不考虑运行环境（eBPF虚拟机），只看指令集的话，eBPF 是图灵完备的。但是我们会将**图灵不完备**作为eBPF的主要特征。

- [Linux的验证器](https://www.kernel.org/doc/html/v5.18/bpf/verifier.html)思路似乎非常简单粗暴：(i) 禁止循环，CFG是有向无环图 (ii) 模拟执行每条路径，验证寄存器的类型。
- [PREVAIL](https://vbpf.github.io/) 使用Abstract Interpretion来验证程序的性质。

## 应用

- 在内核中允许沙盒程序，高效的过滤网络报文
- RBPF <https://github.com/qmonnet/rbpf>
- Solana 智能合约 <https://github.com/solana-labs/rbpf>
