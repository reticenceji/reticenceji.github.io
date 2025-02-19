---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# Time

## Introduction

程序可能会关注两种时间类型：

- 真实时间：可能需要某个时间点或时间间隔。
- 进程时间：进程使用的 CPU 时间。

Linux 提供了两个系统调用，分别是 `time` 和 `gettimeofday`，前者更简单，后者更精确。`time` 返回的是自 Epoch 以来的秒数，`tv_sec` 也是。`tv_usec` 返回了微秒，尽管它的精度取决于架构的具体实现。对应的设置时间的系统调用是`stime`和`settimeofday`，不过一般程序不会在意这个。

```c
#include <sys/time.h>
#include <time.h>
#include <stdio.h>

int main() {
  time_t t = time(NULL);
  struct timeval tv;
  gettimeofday(&tv, NULL);

  printf("%ld\n", t);
  printf("%ld, %ld\n", tv.tv_sec, tv.tv_usec);
}
```

需要将时间转化成字符串可以使用库函数 `ctime`/`asctime`，它们返回的是一个指针（而不是由用户传入一个指针写入），事实上库静态分配了一块内存，所以反复调用使用的是同一块内存。这里不想仔细介绍了，这都是库函数。

想要获得进程时间，可以使用 `times` 系统调用。

需要创建一个定时器，Linux 提供了三种方式，一个是稍复杂的 `setitimer`，另一个是简单的 `alarm`，还有 Linux 特有的 `timer_create`。定时器在到时后的通知使用 signal 完成，所以需要结合中断处理函数来完成定时逻辑。根据一切皆文件的哲学，Linux 还创造了 `timerfd`，可从文件描述符中读取其所创建定时器的到期通知。因为可以使用 select()、poll() 和 epoll()（将在第 63 章进行讨论）将这种文件描述符会同其他描述符一同进行监控，所以非常实用。下面是 timer_create 的例子，5 秒的时候发送 SIGALARM 信号，之后每隔 1 秒发送 SIGALARM 信号，省略了错误处理和信号处理函数。

```c
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(int argc, char *argv[]) {
  timer_t timerid;
  struct sigevent sev;
  struct itimerspec its;

  /* SIG Handler Set*/
  /* Create the timer */
  sev.sigev_notify = SIGEV_SIGNAL;
  sev.sigev_signo = SIGRTMIN;
  sev.sigev_value.sival_ptr = &timerid;
  timer_create(CLOCK_REALTIME, &sev, &timerid);

  /* Configure the timer to expire after "freq_nanosecs" */
  its.it_value.tv_sec = 5;
  its.it_value.tv_nsec = 0;
  its.it_interval.tv_sec = 1;
  its.it_interval.tv_nsec = 0;
  /* Start the timer */
  timer_settime(timerid, 0, &its, NULL);

  /* Sleep for some time */
  // sleep(atoi(argv[1]));
  while (1)
    ;
}
```

需要休眠，Linux 也提供了两种方式，一个是低精度的 `sleep`，一个是高精度的 `nanosleep`。

## Practice

Linux/Unix 系统内部对时间的表示方式均是以自 Epoch 以来的秒数来度量的（一般叫做timestamp），Epoch 亦即通用协调时间（UTC，以前也称为格林威治标准时间，或 GMT）的 1970 年 1月 1 日早晨零点。

要将 timestamp 转化成具体的时间（如2024年3月25日22：29），我们要考虑时区问题。一般的语言都提供了相应的转化函数。参考

- [Python - Time](../../编程语言/Python/库/时间.md)
- [Rust - Time](../../编程语言/Rust/库/时间.md)

### Sleep

sleep其实没有什么好介绍的。不过倒是有一些值得注意的地方：

- Python的多线程可以使用sleep，一个线程sleep不会阻塞其他线程。也就是说python的sleep实现并不是简单的直接使用系统的sleep。
- Rust在编写异步程序的时候注意使用异步库提供的sleep函数，否则会阻塞整个进程。
