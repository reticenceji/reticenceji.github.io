---
aliases: 
tags: 
date_created: Wednesday, November 13th 2024, 1:30:01 pm
date_modified: Wednesday, November 13th 2024, 2:15:37 pm
---

# RPC

## GRPC

gRPC 一开始由 google 开发，是一款语言中立、平台中立、开源的远程过程调用(RPC)系统。

gRPC是一整套RPC方案，它包括：

- Protobuf(Protocol Buffers)作为接口定义语言（IDL）和消息交换格式，关于Protobuf在[序列化](../../基础知识/程序分析/序列化.md) 文章中有介绍。Protobuf 提供了很多语言的支持。
- 基于HTTP/2 通信协议，允许在单个TCP连接上同时发送多个请求和响应，二进制分帧和头部压缩大大提高了数据传输的效率，允许服务器推送（但不等于全双工）

当然，也可以不使用Protobuf而使用其他的序列化方案，使用其他的通信协议。但是默认情况都是如此，默认情况也足够好，下面也不会涉及其他方法。

### Usage

在开始之前，需要确保 gRPC 和 Protocol Buffers 工具链已经安装。以 Go 语言为例，可以这样安装：

```bash
go install google.golang.org/grpc@latest
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

接着关键部分是定义**服务**和**消息**格式，使用`proto3`。在下面的例子中，定义了Greeter服务，提供SayHello远程调用。

```protobuf
syntax = "proto3";

package helloworld;

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloResponse);
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloResponse {
  string message = 1;
}
```

使用 `protoc` 命令行工具生成客户端和服务器端代码：

```bash
protoc --go_out=. --go-grpc_out=. helloworld.proto
```

在服务端，你需要实现在 `.proto` 文件中定义的服务接口，然后开始listen TCP请求。客户端将建立与服务器的连接，然后调用服务端的方法。参考[grpc helloworld](https://grpc.io/docs/languages/go/quickstart/)。
