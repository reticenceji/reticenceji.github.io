---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# context

## Context

Go 语言的 `context` 包是专为简化跨 API 边界和 goroutines 的传递取消信号、超时、截止时间以及其他请求范围的值而设计的。这个包在并发控制中尤其有用，它帮助管理长时间运行的操作，特别是那些涉及多个 goroutines 的操作。Context 是 Go 语言中独特的设计，在其他编程语言中我们很少见到类似的概念。

[`context.Context`](https://draveness.me/golang/tree/context.Context) 是 Go 语言在 1.7 版本中引入标准库的接口[1](https://draveness.me/golang/docs/part3-runtime/ch06-concurrency/golang-context/#fn:1)，该接口定义了四个需要实现的方法，其中包括：

1. `Deadline` — 返回 [`context.Context`](https://draveness.me/golang/tree/context.Context) 被取消的时间，也就是完成工作的截止日期；
2. `Done` — 返回一个 Channel，这个 Channel 会在当前工作完成或者上下文被取消后关闭，多次调用 `Done` 方法会返回同一个 Channel；
3. `Err` — 返回 [`context.Context`](https://draveness.me/golang/tree/context.Context) 结束的原因，它只会在 `Done` 方法对应的 Channel 关闭时返回非空的值；
    1. 如果 [`context.Context`](https://draveness.me/golang/tree/context.Context) 被取消，会返回 `Canceled` 错误；
    2. 如果 [`context.Context`](https://draveness.me/golang/tree/context.Context) 超时，会返回 `DeadlineExceeded` 错误；
4. `Value` — 从 [`context.Context`](https://draveness.me/golang/tree/context.Context) 中获取键对应的值，对于同一个上下文来说，多次调用 `Value` 并传入相同的 `Key` 会返回相同的结果，该方法可以用来传递请求特定的数据；

```go
type Context interface {
	Deadline() (deadline time.Time, ok bool)
	Done() <-chan struct{}
	Err() error
	Value(key interface{}) interface{}
}
```

所以，我们经常会在发出的 goroutine 中看到这样的代码，一旦`ctx.Done()`这个channal中接收到消息或通道关闭（通常是后者），则可以结束 goroutine。

```go
ctx, cancel := context.WithCancel(context.Background())

// 在某种情况调用 cancel()

go func(){
    select {
    	case <-ctx.Done():
    		fmt.Println("main", ctx.Err())
    		return
    	}
    	...
    }
}()
```

例如一个网络服务，当接收到请求时，你可能会启动一个长时间运行的操作，但如果客户端断开连接或服务端设定的处理时间超过预期，你可能想要取消这个操作：

```go
func handleRequest(req *Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	go func() {
		select {
		case <-ctx.Done():
			fmt.Println("handleRequest", ctx.Err())
			// 可能需要进行一些清理操作
		case result := <-processLongRunningTask(req):
			// 处理结果
			fmt.Println("Result:", result)
		}
	}()
}
```
