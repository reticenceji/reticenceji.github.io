---
aliases: 
tags: 
date: 2025-04-16
date_modified: 2025-04-16
---

# MCP

MCP（Model Context Protocol）是最近LLM领域风头正盛的东西。不过它的本质并不复杂。LLM如果需要获得一些特定的信息，或者调用一些特定的方法，在MCP诞生之前没有一个统一的方法去做这件事情，MCP则规定了这个**标准**。

## MCP Server 踩坑记录

由于MCP太新了，相关文档不完善，API又变化的很快，导致有很多坑。[servers/src/sqlite at main · modelcontextprotocol/servers · GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite) 是我当时学习的例子，然而它的`mcp`版本是1.0.0，截止我写这个Blog的时候已经是1.6.0版本的，很多Break Change。网上很多的例子用的是`FastMcp`，但是不符合我的需求。我想要用这个例子一样的`Server`，现在被移动到了`mcp.server.lowlevel`中。

我想用`mcp dev`对我的server进行调试，但是一直报错。看了它的实现才知道，它一定要一个没有参数的`run`，而默认的low level server需要三个参数`read_stream`, `write_stream`, `initialization_options`。为了方便可以创建一个没啥用的`DevServer`包一层。

```python
class DevServer:
    def run(self):
        asyncio.run(main())


server = DevServer()
```
