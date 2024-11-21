---
aliases: 
tags: 
date_created: Wednesday, November 20th 2024, 11:50:55 pm
date_modified: Wednesday, November 20th 2024, 11:52:45 pm
---

# net

## net/http

`net/http`包提供了构建HTTP服务器的基本工具。

1. 你需要定义一个函数，该函数接受`http.ResponseWriter`和`*http.Request`作为参数。`http.ResponseWriter`用于发送HTTP响应数据，而`*http.Request`包含了关于当前请求的所有信息，比如URL、头信息和其他可能的数据。
2. 使用`http.HandleFunc`函数注册你的处理函数。这个函数将一个URL路径和一个处理函数绑定起来。
3. 使用`http.ListenAndServe`启动服务器。这个函数需要端口号和一个处理器，如果你使用`http.HandleFunc`注册处理函数，可以直接传递`nil`作为处理器。

例如：

```go
package main

import (
    "fmt"
    "net/http"
)

// helloHandler 处理 /hello 路径的HTTP请求
func helloHandler(w http.ResponseWriter, r *http.Request) {
    // 发送HTTP响应到客户端
    fmt.Fprintf(w, "Hello, you've requested: %s\n", r.URL.Path)
}

func main() {
    // 注册URL路径和对应的处理函数
    http.HandleFunc("/hello", helloHandler)

    // 启动HTTP服务器，监听8080端口
    fmt.Println("Server is running on http://localhost:8080/")
    if err := http.ListenAndServe(":8080", nil); err != nil {
        fmt.Println("Error starting server:", err)
    }
}
```
