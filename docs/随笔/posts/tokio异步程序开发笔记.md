---
aliases: 
tags: 
date: 2025-04-09
date_modified: 2025-04-09
---

# tokio异步程序开发笔记

最近在使用Rust+Tokio开发一个流式任务（后文用`pipeline`指代）调度框架。踩了很多坑，这里记录一些心得。

## 安全退出

退出一个Shell程序，最最自然的想法是使用`Ctrl+C`，向程序发送一个SIGINT信号，默认处理就是退出程序。

然而，直接退出可能并不符合你的预期——如果任务执行了一半就退出了，会变成什么样子？

所以我们应该自定义对SIGINT的处理逻辑，这属于系统编程的范畴。还好，`tokio`库帮我们做了封装，我们可以在程序开始的时候开一个任务去等待SIGINT信号，然后进行处理

```rust
tokio::spawn(async move {
    tokio::signal::ctrl_c().await.unwrap();
    tracing::info!("Ctrl+C received, canceling...");
    // 退出逻辑，如果等待程序自然运行完成可以为空。
});
```

对于我的程序来说，每一个`pipeline`都会不停的等待新消息，也就是不会主动停止。那么就需要一个方式去通知所有的`pipeline`，应该停止接受消息了。自然的，你会想到消息队列——当收到 `SIGINT` 信号时，向所有`pipeline` 发送取消请求；所以所有的pipeline在等待新消息的**同时**，也要等待取消请求。这种同时等待两个异步任务的操作就是`select`。

伪代码如下。由于有这个消息有多个consumer，且只需要发送一次。所以可以使用[`watch::channel`](https://docs.rs/tokio/latest/tokio/sync/watch/fn.channel.html "fn tokio::sync::watch::channel")

```rust
//  logic

let (cancel_tx, cancel_rx) = tokio::sync::watch::channel(false);

// 在多个任务中共享接收端
let task1 = tokio::spawn({
    let mut rx = cancel_rx.clone();
    async move {
        while !*rx.borrow() {
            // 正常工作循环
            tokio::select! {
                _ = rx.changed() => {
                    // 收到取消信号
                    break;
                }
                // 其他工作逻辑
            }
        }
    }
});

// 发送取消信号
cancel_tx.send(true)?;
// pipeline 具体逻辑
loop {
    tokio::select! {
        _ = rx.changed() => { break; }
        message => mq.recv() {
            // 具体的处理逻辑
        }
    }
}
```

不过我的程序其实使用了一个更高级的封装[`CancellationToken`](https://docs.rs/tokio-util/latest/tokio_util/sync/struct.CancellationToken.html)，我的使用方式和消息队列没有不同，但是事实上它支持多层级的任务取消。

## 日志记录

tokio团队的`tracing`和`tracing-subscriber`用来记录异步日志很合适。我个人习惯在tokio::spawn的时候创建一个`span`。

## 超时

`tokio::time::timeout`用起来很舒服，用它包裹一个异步任务，如果超时的可以提前返回。我用它来将 回调 和 轮询 机制结合在一起。

## 性能监控

## 异步 `Drop`

流式任务调度框架，如何追踪一个输入的全流程？最简单的办法就是一直使用同一个数据。我称之为`Context`，定义如下。在消息队列中直接传递`Context`，等到消息处理完成后，`InnerContext`就会被 `drop`。将一些逻辑放在`Drop`的实现中即可，如归档到数据库。

```rust
pub type Context = Arc<Mutex<InnerContext>>

impl Drop for InnerContext {
    fn drop(&mut self) {}
}
```

但是如果我需要在`drop`中调用异步函数怎么办？`drop`不能是异步的。如何阻塞的调用异步函数？

- 可以使用`futures::executor::block_on`函数，它会创建一个简单的运行时单线程阻塞的执行异步任务。如果要进行的异步任务简单，可以使用这个方法。例如，将任务的数据通过 `channel` 传递给真正的工作任务。这是我所使用的。
- 也许可以使用[`smol::block_on`](https://docs.rs/smol/latest/smol/index.html)。
- 也可以使用`tokio::task::block_in_place`函数。

```rust
tokio::task::block_in_place(move || {
    tokio::runtime::Handle::current().block_on( async move {
        // logic
    })
});
```
