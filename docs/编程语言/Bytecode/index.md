---
aliases: 
tags: 
date_created: Monday, September 30th 2024, 11:40:49 pm
date_modified: Wednesday, November 13th 2024, 2:15:36 pm
---

# Bytecode

这里主要想介绍一些虚拟机用的字节码。

| 字节码          | Stack/Register | 字长 | 图灵完备 | 编程语言             | 主要用途         |
| --------------- | -------------- | ---- | -------- | -------------------- | ---------------- |
| EVM Bytecode    | Stack          | 256  | Yes      | Solidity             | EVM智能合约      |
| WASM Bytecode   |                |      |          | LLVM支持             | 浏览器，智能合约 |
| eBPF Bytecode   | Register       | 64   | No       | LLVM支持             | 内核，智能合约   |
| Python Bytecode | Stack          |      | Yes      | Python               | 通用             |
| Java Bytecode   |                |      | Yes      | Java/Scala/Kotlin... | 通用             |
