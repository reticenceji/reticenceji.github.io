---
aliases: 
tags: 
date: 2025-07-23
date_modified: 2025-07-23
---

# Core Dump

## Demo

执行以下命令，允许创建coredump文件。

```
ulimit -c unlimited 
```

```c
int main() {
	int a = 1/ 0;
	return 0;
}
```

然后执行会崩溃的程序，会产生coredump文件。这个文件可能在当前目录，也可能在别的地方，可以通过查看`/proc/sys/kernel/core_pattern`文件获知：

```bash
$ cat /proc/sys/kernel/core_pattern                                              
|/lib/systemd/systemd-coredump %P %u %g %s %t 9223372036854775808 %h %d
```

这说明coredump结果被通过管道传递给`/lib/systemd/systemd-coredump`程序了，他貌似会将coredump程序压缩后存在`/var/lib/systemd/coredump/`中。

将coredump程序解压后，可以通过gdb进行调试。一般会查看backtrace。

```bash
$gdb a.out coredump
```
