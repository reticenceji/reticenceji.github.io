---
aliases: 
tags: 
date_created: Monday, September 30th 2024, 11:40:49 pm
date_modified: Wednesday, November 13th 2024, 2:15:37 pm
---

# RabbitMQ

消息队列中间件 (Message Queue Middleware ，简称为 MQ) 是指利用高效可靠的消息传递机制进行与平台无关的数据交流，并基于数据通信来进行分布式系统的集成。通过提供消息传递 和消息排队模型，它可以在 **分布式环境下扩展进程间的通信**。 对于编程人员来说，引入消息中间件还有利于程序的解耦。

开源的消息中间件有很多，比较主流的有 RabbitMQ 、 Kafka 、 Acti veMQ 、 RocketMQ等。RabbitMQ 是采用 Erlang 语言实现 AMQP （Advanced Message Queuing Protocol ，高级消息队列协议）的消息中间件。RabbitMQ 除了原生支持 AMQP 协议，还支持 STOMP ， MQTT 等多种消息中间件协议。

> RabbitMQ is a reliable and mature messaging and streaming broker, which is easy to deploy on cloud environments, on-premises, and on your local machine. It is currently used by millions worldwide.

## Introduction

RabbitMQ 整体上是 一个生产者（producer）与消费者（consumer）模型，主要负责接收、存储和转发消息。除了生产者和消费者这些通用概念，还需要知道以下术语：

- Broker（掮客）：消息中间件的服务节点。一般可以看作一个RabbitMQ服务器。
- Channel：RabbitMQ 客户端和服务端交互的信道。
- Queue：RabbitMQ 的内部对象，用于存储消息。
- Exchange、RoutingKey、Binding：从直觉出发，我们可能会认为 RabbitMQ 就是 Producer 将消息 放到指定的 Queue，然后 Consumer 从指定的队列拿出消息。 但是实际上是 Producer 将消息发送给 Exchange， Exchange 再根据 `RoutingKey` 将消息路由给指定的 Queue。常用的Exchange有下面三种
    - fanout: 将发送给 Exchange 的消息路由到所有和它绑定的 Queue。
    - direct: 将发送给 Exchange 的消息路由到和 RoutingKey 完全匹配的 Queue。
    - topic: 将发送给 Exchange 的消息路由到和 RoutingKey 模糊匹配的 Queue。（有点类似正则的感觉，但是匹配规则不能写的像正则那么复杂）

![](../../static/Pasted%20image%2020240330114846.png)

如图所示。总结一下，RabbitMQ的工作规则简单来说就是：

1. producer 将消息发送给 Exchange
2. Exchange 根据消息的 `RoutingKey` 做匹配，将消息放到 N 个队列中（如果`RoutingKey`匹配不上任何队列，那么默认会被丢弃）。
3. consumer 从 Queue中获取消息。

### AMQP

AMQP 可以理解为和 HTTP 类似的应用层协议。AMQP 协议本身包括 三层。

- Module Layer: 位 于协议最高层，主要定义了一些供客户端调用的命令，客户端可以利用这些命令实现自己的业务逻辑。例如，客户端可以使用 Queue.Declare 命令声明一个队列或者使用 Basic.Consume 订阅消费一个队列中的消息。
- Session Layer: 位于中间层，主要负责将客户端的命令发送给服务器，再将服务端的应答返回给客户端，主要为客户端与服务器之间的通信提供可靠性同步机制和错误处理。
- Transport Layer: 位于最底层，主要传输二进制数据流 ，提供帧的处理、信道复用、错误检测和数据表示等。

### 集群

RabbitMQ本身也可以被分布式部署。

## Demo

在本地开一个RabbitMQ服务端，Docker肯定是最简单的方法。

```python

docker run -d \
  --name esimmq \
  -e RABBITMQ_DEFAULT_USER=< user > \
  -e RABBITMQ_DEFAULT_PASS=< secret > \
  --hostname rabbitmq \
  --publish 15672:15672 \
  --publish 5672:5672 \
  --volume `pwd`/mqdata:/var/lib/rabbitmq \
  rabbitmq:3-management
```

对于编程人员来说，RabbitMQ人性化的地方在于他提供了很多语言的接口，截止2024-3-30，我在官网上看到了Python, Java, Ruby, PHP, .NET, JavaScript, Go, Elixir, Objective-C, Swift, Spring AMQP。下面的例子来自[tutorials](https://www.rabbitmq.com/tutorials)，实现work queue模型：

```python
#!/usr/bin/env python  
import pika  
import sys  
  
credentials = pika.PlainCredentials("jigaoqiang", "jigaoqiang")
connection = pika.BlockingConnection(
    pika.ConnectionParameters("127.0.0.1", 5672, '/', credentials)
)
channel = connection.channel() 

channel.queue_declare(queue='task_queue', durable=True)  
  
message = ' '.join(sys.argv[1:]) or "Hello World!"  
channel.basic_publish(  
    exchange='',  
    routing_key='task_queue',  
    body=message,  
    properties=pika.BasicProperties(  
    delivery_mode=pika.DeliveryMode.Persistent  
))  
print(f" [x] Sent {message}")  
connection.close()
```

```python
#!/usr/bin/env python
import pika
import time

credentials = pika.PlainCredentials("jigaoqiang", "jigaoqiang")
connection = pika.BlockingConnection(
    pika.ConnectionParameters("127.0.0.1", 5672, '/', credentials)
)
channel = connection.channel()

channel.queue_declare(queue='task_queue', durable=True)
print(' [*] Waiting for messages. To exit press CTRL+C')


def callback(ch, method, properties, body):
    print(f" [x] Received {body.decode()}")
    time.sleep(body.count(b'.'))
    print(" [x] Done")
    ch.basic_ack(delivery_tag=method.delivery_tag)


channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='task_queue', on_message_callback=callback)

channel.start_consuming()
```

使用浏览器访问`localhost:15672` 可以查看控制台。

RabbitMQ还支持多种模式，[tutorials](https://www.rabbitmq.com/tutorials) 里有详细介绍。有趣的是它可以用来实现RPC。思路很简单，再 caller 和 callee 之间建立两个反向的queue，一个用来调用，一个用来返回。不过在实践上，一般是这样：

- callee 作为 consumer，等待一个 queue（记做 `callqueue`） 发来消息进行调用。
- caller 先作为 producer，向 `callqueue` 发送消息（记做 `callmsg`），同时带上返回消息应该发送在哪个queue（记做`returnqueue`）的 RoutingKey。一般我们不将这个 RoutingKey 编码在 `callmsg` 中，而是编码在 properties 的 `reply_to` 字段。这个字段就是用来做这个事情的，算是约定俗成。
- callee 收到消息，执行函数，从`reply_to`字段拿出 RoutingKey，就可以将结果消息（记做`returnmsg`）通过 `returnqueue`返回了。
- 所以 caller 同时也要作为 consumer，等待 `returnqueue` 的`returnmsg`。

敏锐的人可能发现一个细节，如果caller同时向callee发送好几个消息，callee没有按照顺序返回怎么办？难道这个过程要阻塞的完成？当然不需要，可以给每个 `callmsg` 编上一个独一无二的编号，再在 `returnmsg` 中带上这个编号就可以了。同样的约定俗称，这个编号一般通过 properties 的 `correlation_id` 发送。再注意一个细节，传递参数的编码如果使用json的话，需要注意json中数字大小的范围限制！代码见 [tutorials](https://www.rabbitmq.com/tutorials)。
