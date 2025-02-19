---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-12-06
---

# errno

`errno` 是C/C++中用于表示系统调用和库函数错误的**全局变量**（用起来像是全局变量）。它定义在`<errno.h>`头文件中。

- 线程安全：在现代系统中，`errno` 实际上是**线程局部存储**（Thread Local Storage）的变量，每个线程都有自己的 `errno` 副本。
- 使用规则：
    - 每次系统调用后`errno`**不会**被重置。所以在调用可能设置 `errno` 的函数前，将 `errno` 设置为 0 是一个好习惯。这样做可以避免由于之前的错误状态残留而导致误判。
    - 只有当函数调用返回表示错误的值时（通常是`-1`），才应该检查`errno`。原因同上，二选一。
    - 在检查`errno`之前不应该调用其他函数，因为它们可能会修改`errno`。
    - 使用 `perror` 或 `strerror` 可以提供关于错误的描述，这比仅仅输出错误代码更有帮助。

> [!NOTE] 
> 在Linux系统中，系统调用失败时会通常返回一个错误码的负数。我们在用户态做系统调用，一般是C库（如`glibc`）封装好的，C库会将返回值取反后设置到`errno`，返回`-1`给应用程序。如果直接使用系统调用（比如通过`syscall()`函数），需要自己处理错误码。

常见的值

```c
#define EPERM           1      // Operation not permitted
#define ENOENT          2      // No such file or directory
#define ESRCH           3      // No such process
#define EINTR           4      // Interrupted system call
#define EIO             5      // I/O error
#define ENXIO           6      // No such device or address
#define E2BIG           7      // Argument list too long
#define ENOEXEC         8      // Exec format error
#define EBADF           9      // Bad file number
#define ECHILD          10     // No child processes
#define EAGAIN          11     // Try again
#define ENOMEM          12     // Out of memory
#define EACCES          13     // Permission denied
#define EFAULT          14     // Bad address
#define EBUSY           16     // Device or resource busy
#define EEXIST          17     // File exists
#define ENODEV          19     // No such device
#define ENOTDIR         20     // Not a directory
#define EISDIR          21     // Is a directory
#define EINVAL          22     // Invalid argument
#define ENOSPC          28     // No space left on device
#define EPIPE           32     // Broken pipe
```
