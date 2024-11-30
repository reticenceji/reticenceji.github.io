---
aliases: 
tags: 
date_created: Wednesday, November 13th 2024, 1:30:01 pm
date_modified: Tuesday, November 26th 2024, 10:27:43 am
---

# pprof

Golang在标准库中提供了对程序进行profile的工具，帮助检测一下资源的使用情况：

- goroutine — stack traces of all current goroutines
- heap — a sampling of memory allocations of live objects
- allocs — a sampling of all past memory allocations
- threadcreate — stack traces that led to the creation of new OS threads
- block — stack traces that led to blocking on synchronization primitives
- mutex — stack traces of holders of contended mutexes

## Heap

虽然Golang有垃圾回收机制，但是仍然可能会存在内存泄漏。通过对heap进行profile，可以帮助我们分析内存泄漏的原因。他的使用非常简单，只需要开某个端口开启pprof的服务即可：

```go
import (  "net/http"  _ "net/http/pprof")

func main() {
    ...
    http.ListenAndServe("localhost:8080", nil)
    ...
}
```

然后就可以从这个端口访问到pprof的结果，使用`go tool pprof`分析

```sh
curl -sK -v http://localhost:8080/debug/pprof/heap > heap.out
go tool pprof heap.out
# 可以只用一个命令
go tool pprof http://127.0.0.1:6060/debug/pprof/heap
```

可以在执行heap分析之前先进行垃圾回收，避免一些暂未回收的内存对分析造成干扰。通过指定$gc$参数完成。

```curl
go tool pprof http://127.0.0.1:6060/debug/pprof/heap?gc=1
```

默认是查看当前使用的内存量（`inuse_space`），也可以查看函数历史申请量的总和，使用`--alloc_space`选项，如下。还有`alloc_objects`和`inuse_objects`查看对象数量而不是内存大小。

```sh
go tool pprof --alloc_space http://127.0.0.1:6060/debug/pprof/heap
```

### Demo

下面是我对我程序分析的步骤，从进入交互式界面开始。首先执行`top`命令，观察内存使用最多的**函数**：

```
(pprof) top
Showing nodes accounting for 5848.78kB, 100% of 5848.78kB total
Showing top 10 nodes out of 37
      flat  flat%   sum%        cum   cum%
 3796.44kB 64.91% 64.91%  3796.44kB 64.91%  scam-analyzer/utils.(*Set[go.shape.[20]uint8]).Add
  514.63kB  8.80% 73.71%   514.63kB  8.80%  math/rand.newSource
  513.12kB  8.77% 82.48%   513.12kB  8.77%  golang.org/x/net/http2/hpack.newInternalNode
  512.56kB  8.76% 91.25%   512.56kB  8.76%  encoding/json.typeFields
  512.02kB  8.75%   100%   512.02kB  8.75%  github.com/ethereum/go-ethereum/core/vm.newFrontierInstructionSet
         0     0%   100%   512.56kB  8.76%  encoding/json.(*decodeState).object
         0     0%   100%   512.56kB  8.76%  encoding/json.(*decodeState).unmarshal
         0     0%   100%   512.56kB  8.76%  encoding/json.(*decodeState).value
         0     0%   100%   512.56kB  8.76%  encoding/json.Unmarshal
         0     0%   100%   512.56kB  8.76%  encoding/json.cachedTypeFields

```

flat就是这个函数调用仍旧没有被释放的空间。最大的是`(*Set[go.shape.[20]uint8]).Add`这个函数申请的空间，这是我对可疑地址的缓存，是合理的。

## CPU

执行下面的命令，会在60秒内对CPU使用情况进行采样：

```bash
go tool pprof http://127.0.0.1:7001/debug/pprof/profile?seconds=60
```

---

参考链接：

- [Golang Heap 分析](https://github.com/xizhibei/blog/issues/175)
