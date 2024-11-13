---
aliases: 
tags: 
date_created: Wednesday, November 13th 2024, 1:30:01 pm
date_modified: Wednesday, November 13th 2024, 2:15:36 pm
---

# Process

## Introduction

Process 是一个进程，一个允许的程序实例，拥有系统资源。

首先，Process 有一个 ID（`pid`）。它是一个整数，在一个时间内一个 ID 唯一对应一个进程。`pid = 0` 的是 idle 进程，`pid = 1` 的是 init 进程。`pid` 的分配一般是逐渐递增的，直到达到 `pid_max`(/proc/sys/kernel/pid_max)。

- Process 还有其父进程（`ppid`）。
- 每个进程被一个 `user` （/etc/passwd 可查看）和一个 `group`（/etc/group 可查看） 拥有，它们决定了进程拥有的权限。
- 每个 Process 属于一个 process group

### Process Basic Operation

#### Get pid

```c
#include <sys/types.h>
#include <unistd.h>
pid_t getpid (void);
pid_t getppid (void);
```

获得进程的 PID 和父进程的 PID。

#### Create process

创建新进程一般分为两步。第一步创建新进程（`fork`），第二步载入 Binary（`exec`）。

虽然只有 `exec` 一个系统调用，但是在此之上有许多的库函数可用。和系统调用相同的 `execve` 的用法如下。其他的用法大同小异，无非是简化了参数的传入。

```c
int execve (const char *filename, char *const argv[], char *const envp[]);

int main() {
	int ret;
	const char *argv[] = {"vim", NULL}; 
	ret = execve ("/usr/bin/vim", argv, NULL); 
	if (ret == -1)           // 正常情况exec不return
		perror ("execve");
	return 0;
}
```

exec 除了修改了内存的数据之外，还有许多的副作用：

- Any pending signals are lost.
- Any signals that the process is catching (see Chapter 9) are returned to their default behavior, as the signal handlers no longer exist in the process’ address space.
- Any memory locks are dropped.
- Most thread attributes are returned to the default values.
- Most process statistics are reset.
- Anything related to the process’ memory, including any mapped files, is dropped.
- Anything that exists solely in user space, including features of the C library, such as `atexit()` behavior, is dropped.

```c
#include <sys/types.h>
#include <unistd.h>
pid_t fork (void);
```

fork 用来创建一个和父进程一模一样的新进程。它的特殊之处在于他有“两个”返回值。对于父进程来说，它得到的返回值是子进程的 pid；对于子进程来说，它得到的返回值是 0。如果失败，返回 -1。因此基本的使用方式如下：

```c
pid_t pid;

pid = fork();
if (pid > 0)
	printf ("I am the parent of pid=%d!\n", pid);
else if (pid == 0)
	printf ("I am the baby!\n");
	// 一般来说在此处会调用exec
else if (pid == -1)
	perror ("fork");
```

> 现在内核的 fork 基于 Copy On Write 技术完成，我们不用太担心复制整个父进程的效率问题。在此技术实现之前可以使用 `vfork` 避免复制，但是现在毫无必要。

#### Terminate Process

```c
#include <stdlib.h>
void exit (int status);
```

退出进程。返回的 `status & 0xff` 会传递给父进程。作为系统调用 `_exit`，它可以直接退出进程。但作为 C 库包装后的函数，在退出之前，C 库会完成 3 件事情：

1. 调用在 `atexit` 和 `on_exit` 注册的函数。
2. Flush all open standard I/O stream。
3. 删除 `tmpfile()` 创建的临时文件。

子进程 terminate 之后，系统会发送 SIGCHID 信号给父进程。默认情况下这个信号会被忽略，我们可以注册信号处理函数来处理这个信号。不过在更一般的情况下，父进程需要主动等待子进程的结束，并处理返回值，这使用 `wait` 函数。

```c
#include <sys/types.h>
#include <sys/wait.h>
pid_t wait (int *status);
pid_t waitpid (pid_t pid, int *status, int options);

WIFEXITED (status);     // 进程是否正常退出，即调用`_exit()`退出
WIFSIGNALED (status);   // 进程是否因为信号退出
WIFSTOPPED (status);
WIFCONTINUED (status);
WEXITSTATUS (status);
WTERMSIG (status);
WSTOPSIG (status);
WCOREDUMP (status);
```

`wait` 的返回值是结束的子进程的 pid，不过 `status` 并不是 `exit(status)`。wait 的 `status >> 8` 的结果是 exit 的 status，而其低 8 位则代表了一些其他的状态，我们可以使用一些宏获取这些信息。`waitpid` 可以等待特定的子进程，具体的说：

- 如果 pid 等于 0，则等待与调用进程（父进程）同一个进程组（process group）的所有子进程。34.2 节将描述进程组的概念。
- 如果 pid 小于 -1，则会等待进程组标识符与 pid 绝对值相等的所有子进程。
- 如果 pid 等于 -1，则等待任意子进程。`wait(&status)` 的调用与 `waitpid(-1, &status, 0)` 等价。

`wait3`,`wait4`,`waitid` 也是系统调用，这里不做介绍。

> 当一个进程退出的时候，它的资源并没有被 **完全的** 清理（否则父进程怎么获取它的返回值呢）。它的清理要等到父进程去 wait 它，没有被父进程清理的进程叫做 Zombie。如果父进程先于子进程退出，那么子进程会被 init 进程领养。

除了 wait 系列的系统调用，还可以通过信号来对子进程的结束进行处理。因为子进程的终止属异步事件。父进程无法预知其子进程何时终止。父进程周期性的调用 wait 是一个可能但是繁琐的办法。为了解决这个问题，无论一个子进程于何时终止，系统都会向其父进程发送 `SIGCHLD` 信号。对该信号的默认处理是将其忽略，不过也可以安装信号处理程序来捕获它。不过，使用这一方法时需要掌握一些窍门。因为如果有两个进程相继中止，产生了两次 `SIGCHLD` 信号，父进程可能只捕获到一个（没有排队处理。解决方案是：在 `SIGCHLD` 处理程序内部循环以 `WNOHANG` 标志来调用 `waitpid()`，直至再无其他终止的子进程需要处理为止。通常 `SIGCHLD` 处理程序都简单地由以下代码组成，仅仅捕获已终止子进程而不关心其退出状态。如下所示。循环会一直持续下去，直至 `waitpid()` 返回 0，表明再无僵尸子进程存在，或 -1，表示有错误发生（可能是 ECHILD，意即再无更多的子进程）。

```c
while (waitpid(-1, NULL, WNOHANG) > 0)  // 如果关心子进程的返回值也可以再做处理
	continue;
```

```c
#include <stdlib.h>
int atexit (void (*function)(void));
```

`atexit` 是一个库函数。允许我们注册在进程退出之前要执行的函数，完成一些清理工作。它是按照先进后出的顺序执行注册的函数的。

### Access Control of Process

一个进程关联 4 组 user ID: the real, effective, saved, and file system user IDs.

1. real user ID: the user who originally ran the process. 除了 root 用户，其他用户不能修改。
2. effectuve user ID: Permission verifications normally check against this value. 它继承自父进程的 euid。不过对于设置了 `suid` 的程序，进程在 `exec` 时会修改它的 `euid` 为程序的 `suid`，这是 `passwd` 程序工作的原理，网上有很多讲解文章。
3. saved user ID: 用于 elevated privileges needs to temporarily lower its privileges. When a process forks, the child inherits the saved user ID of its parent. Upon an exec call, however, the kernel sets the saved user ID to the effective user ID, thereby making a record of the effective user ID at the time of the exec.

```c
#include <sys/types.h>
#include <unistd.h>
int setuid (uid_t uid);
int setgid (gid_t gid);
int seteuid (uid_t euid);
int setegid (gid_t egid);
int setreuid (uid_t ruid, uid_t euid);
int setregid (gid_t rgid, gid_t egid);

uid_t getuid (void);
gid_t getgid (void);
uid_t geteuid (void);
gid_t getegid (void);
```

`setuid` 和 `seteuid` 都是用来修改 `euid` 的，root 可以将 `euid` 设置成任何值，普通用户只可以将 `euid` 设置成 `ruid` 或 `suid`。不过它们是有区别的，对于普通用户来说它们是一样的，对于 root 用户来说，`setuid` 会同时修改 `ruid` 和 `suid`（也就是回不去了），`seteuid` 只会修改 `euid`。

上面的这些函数都可以用来修改 3 个 user id，将参数指定为 -1 表示不变。如果调用的不对，会返回 `EPERM` 错误表示没有修改权限。

process 属于一个 user，自然也属于一个 user group，和 file 是类似的，这里不展开了，用处不多。

### Session and Process Group

process 还属于一个 process group，一个 group 有若干个 process，其中有一个 process group leader，process group ID = process group leader’s pid。类似的概念还有 session group。

process group 的主要用途是在进程之间建立作业控制关系。进程组 ID 可以用来控制进程组内的所有进程，例如发送信号，暂停或恢复进程组中的所有进程等。

一般来说，用管道创建一个 process group，一个 shell 窗口中的所有进程属于一个 session group。

```
#define _XOPEN_SOURCE 500
#include <unistd.h>
pid_t getpgid (pid_t pid);
int setpgid (pid_t pid, pid_t pgid);
```

一般来说，我们不需要自己处理这个东西。不是很重要。

### Daemon

Daemon 是运行在后台，不和 terminal 关联的程序，一般用来提供某些服务。一个进程如何变成 deamon 呢：

1. 执行一个 fork()，之后父进程退出，子进程继续执行（结果是 daemon 成为了 init 进程的子进程）。之所以要做这一步是因为下面两个原因。
    - 假设 daemon 是从命令行启动的，父进程的终止会被 shell 发现，shell 在发现之后会显  
        示出另一个 shell 提示符并让子进程继续在后台运行。
    - 子进程被确保不会成为一个进程组首进程，因为它从其父进程那里继承了进程组 ID  
        并且拥有了自己的唯一的进程 ID，而这个进程 ID 与继承而来的进程组 ID 是不同的，  
        这样才能够成功地执行下面一个步骤。
2. 子进程调用 `setsid()` 开启一个新会话并释放它与控制终端之间的所有关联关系。
3. 如果 daemon 从来没有打开过终端设备，那么就无需担心 daemon 会重新请求一个控制终端了。如果 daemon 后面可能会打开一个终端设备，那么必须要采取措施来确保这个设备不会成为控制终端。这可以通过下面两种方式实现。
    - 在所有可能应用到一个终端设备上的 open() 调用中指定 O_NOCTTY 标记。
    - 或者更简单地说，在 setsid() 调用之后执行第二个 fork()，然后再次让父进程退出并让孙子进程继续执行。这样就确保了子进程不会成为会话组长，因此根据 System V 中获取终端的规则（Linux 也遵循了这个规则），进程永远不会重新请求一个控制终端。
4. 清除进程的 umask 以确保当 daemon 创建文件和目录时拥有所需的权限。
5. 修改进程的当前工作目录，通常会改为根目录（/）。这样做是有必要的，因为 daemon 通常会一直运行直至系统关闭为止。如果 daemon 的当前工作目录为不包含/的文件系统，那么就无法卸载该文件系统。或者 daemon 可以将工作目录改为完成任务时所在的目录或在配置文件中定义的一个目录，只要包含这个目录的文件系统永远不会被卸载即可。如 cron 会将自身放在/var/spool/cron 目录下。
6. 关闭 daemon 从其父进程继承而来的所有打开着的文件描述符。（daemon 可能需要保持继承而来的文件描述的打开状态，因此这一步是可选的或者是可变更的。）之所以需要这样做的原因有很多。由于 daemon 失去了控制终端并且是在后台运行的，因此让 daemon 保持文件描述符 0、1 和 2 的打开状态毫无意义，因为它们指向的就是控制终端。此外，无法卸载长时间运行的 daemon 打开的文件所在的文件系统。因此，通常的做法是关闭所有无用的打开着的文件描述符，因为文件描述符是一种有限的资源。
7. 在关闭了文件描述符 0、1 和 2 之后，daemon 通常会打开/dev/null 并使用 dup2()（或类似的函数）使所有这些描述符指向这个设备。之所以要这样做是因为下面两个原因。
    - 它确保了当 daemon 调用了在这些描述符上执行 I/O 的库函数时不会出乎意料地失败。
    - 它防止了 daemon 后面使用描述符 1 或 2 打开一个文件的情况，因为库函数会将这些描述符当做标准输出和标准错误来写入数据（进而破坏了原有的数据）。

很多标准的 daemon 是通过在系统关闭时执行特定于应用程序的脚本来停止的。而那些不以这种方式终止的 daemon 会收到一个 SIGTERM 信号，因为在系统关闭的时候 init 进程会向所有其子进程发送这个信号。在默认情况下，SIGTERM 信号会终止一个进程。如果 daemon 在终止之前需要做些清理工作，那么就需要为这个信号建立一个处理器。这个处理器必须能 **快速地完成清理工作**。

由于 daemon 是长时间运行的，因此要特别小心潜在的 **内存泄露问题** 和 **文件描述符泄露**（即应用程序没有关闭所有打开着的文件描述符）。

因为 daemon 程序不能使用标准输出，我们通常使用 `syslog` 进行日志的记录。

### Process Scheduling

进程调度基本是内核的事情。Linux 默认使用完全公平调度器（Completely Fair Scheduler，CFS）。当遇到 I/O 阻塞，或者用完了 time slice 会暂时调度到其他进程。

```
#include <sched.h>
int sched_yield(void);   // always return 0
```

用户为数不多能做的事情是主动让出 CPU，调度到其他进程。不过它几乎没有什么使用场景。在协程（Coroutine）编程中，当某个协程执行完一定的任务后，可以调用 sched_yield 函数主动让出 CPU，以便其他协程能够有更多的机会获得 CPU 时间，从而提高协程的并发性能。

```c
#include <unistd.h>
#include <sys/time.h>
#include <sys/resource.h>

int nice(int inc);   // 进程的 nice value += inc

int getpriority (int which, int who);
int setpriority (int which, int who, int prio);
```

用户还可以指定 process 的 priority（由于历史原因，也被叫做 nice value）。这会给 Kernel 调度提供建议。nice value 的取值范围是 -20（最高优先级）到 +19（最低优先级），默认值为 0。

- `nice` 的返回值是新的 nice value。一般来说，进程只能增加 nice（减小 priority），除非是 root 权限的程序。
- `setpriority` 提供成精细的控制，`which` 可以是 `PRIO_PROCESS`, `PRIO_PGRP`, or `PRIO_USER`，对应的 `who` 是 process ID`,`process group ID, or user ID，0 代表自己。

还有一些更高级的调度，例如 CPU 核心之间的调度、IO 优先级的调度、使用实时调度器的调度。这些精细的控制这里不展开介绍了。

### Resource Limit

进程能使用的资源数量是有限制的，例如打开的文件数量。拥有 `CAP_SYS_RESOURCE` 权限的进程可以调高上限，否则只能降低上限。上限有 hard limit 和 soft limit。

```c
#include <sys/time.h>
#include <sys/resource.h>
struct rlimit {
	rlim_t rlim_cur; /* soft limit */
	rlim_t rlim_max; /* hard limit */
};

int getrlimit (int resource, struct rlimit *rlim);
int setrlimit (int resource, const struct rlimit *rlim);
```

### Inter Process Communication

Pipe是一个字节流。

### /proc 文件系统

为了提供访问内核信息更加容易的方法，许多现代 UNIX 实现提供了/proc 虚拟文件系统。这个文件系统在/proc 目录下，包含许多文件，暴露了各种内核信息，并允许进程方便地使用普通文件 I/O 系统调用来读取这些信息，某些情况下也可以修改某些信息。/proc 文件系统被称为虚拟文件系统，是因为子目录和文件并没有存放在磁盘中。相反内核在进程访问它们的时候实时创建这些文件和子目录。

|`/proc/PID/*`| 进程信息                                |
|---|---|
|cmdline| 命令行参数，`\0` 分隔                       |
|cwd| 当前工作目录的符号链接                         |
|environ| 环境列表，格式为 NAME=value，`\0` 分隔         |
|exe| 被执行文件的符号链接                          |
|fd| 目录，包含进程所有打开文件的符号链接                  |
|maps| 内存映射                                |
|mem| 进程虚拟内存（执行 I/O 前必须 lseek() 到合法的偏移位置） |
|mounts| 进程的挂载点                              |
|root| root 目录的符号链接                        |
|status| 各种信息（如进程 ID、凭证、内存使用、信号等）            |
|task|                                     |

| /proc/*          | 各种系统信息               |
| ---------------- | -------------------- |
| /proc/net        | 网络和 sockets 的状态信息    |
| /proc/sys/fs     | 文件系统相关设置             |
| /proc/sys/kernel | 各种通常的内核设置            |
| /proc/sys/net    | 网络和 sockets 设置       |
| /proc/sys/vm     | 内存管理设置               |
| /proc/sysvipc    | System V IPC 对象相关的信息 |
