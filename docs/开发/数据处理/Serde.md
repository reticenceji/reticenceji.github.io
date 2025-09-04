---
aliases: 
tags: 
date_modified: 2025-03-04
date: 2024-11-30
---

# 序列化

程序通常（至少）使用两种形式的数据：

1. 在内存中，数据保存在对象、结构体、列表、数组、散列表、树等中。 这些数据结构针对 CPU 的高效访问和操作进行了优化（通常使用指针）。
2. 如果要将数据写入文件，或通过**网络**发送，则必须将其 **编码（encode）/ 序列化（serialization） / 编组（marshalling）** 为某种字节序列（例如，JSON 文档）。 由于每个进程都有自己独立的地址空间，一个进程中的指针对任何其他进程都没有意义，所以这个字节序列表示会与通常在内存中使用的数据结构完全不同。

> 序列化Serialization指的是为了让数据便于传输和存储，将对象转化成特定格式的数据。编码Encoding是一个更宽泛的概念，将数据从一种格式转化成另一种格式都可以叫做Encoding。编组Marshal 不仅传输对象的状态，而且会一起传输对象的方法（相关代码）。但是有时我们会将他们混用，主要还是通过场景上下文来区分。

## 文本序列化

JSON, YAML, XML, TOML 都是非常流行的文本序列化的方式。他们通过明确的键名标识数据语义，支持复杂数据结构的嵌套表达。我称为**键值对型序列化格式**

| **编码方式** | **类型** | **优点**      | **缺点**  | **常用场景**         |
| -------- | ------ | ----------- | ------- | ---------------- |
| JSON     | 弱/自解释  | 简洁，生态好      | 不能有注释   | Web API，NoSQL数据库 |
| XML      | 弱/自解释  |             | 复杂，解析困难 | HTML，历史遗留项目      |
| YAML     | 弱/自解释  | 类型丰富        | 复杂，缩进敏感 | 配置文件，DevOps      |
| TOML     | 弱/自解释  | 适合配置文件，可读性强 |         | 配置文件             |

这里也顺带提一下Base64。Base64是一种编码方式，用于将二进制数据转换为文本格式。例如，可能需要在JSON中传输二进制数据，比如图片或文件，而二进制数据不能直接放在JSON里，所以可以先进行Base64编码。

与键值对型序列化格式相对应的是表格型序列化格式，这类格式通过行列结构表达数据关系，如CSV。

### JSON

JSON的用途非常广泛。很多语言内置/通过标准库支持了JSON的序列化和反序列化。有2个需要注意的点：

1. 大于 $2^{53}$ 的整数无法使用 IEEE 754 双精度浮点数精确，所以不应该使用JSON直接存储这样的数据。一定要存大整数可以使用字符串。
2. 不直接支持二进制数据，需要借助如Base64的帮助。

> [!NOTE]
> 可以看看[NEAR-SDK](https://docs.rs/near-sdk/latest/src/near_sdk/json_types/integers.rs.html#69)是如何处理第一个问题的。它用宏创建了包裹类型`U64`,`I64`，不引入额外的开销，只是改变了包裹类型的`serialize`和`deserialize`方法为针对string的操作。

具体编程实践可以参考：

- [Python - json](../../编程语言/Python/库/json.md)
- [Rust - Serde](../../编程语言/Rust/库/Serde.md)

### XML

有人对XML的评价是：一般的语言，要么适合机器阅读，要么适合人类阅读。而XML是少有的对人和机器都不友好的。这里不做过多介绍。

Python 标准库提供的 XML 模块，对于恶意构造的数据是不安全的。 攻击者可能滥用 XML 功能来执行拒绝服务攻击、访问本地文件、生成与其它计算机的网络连接或绕过防火墙。如果来源不信任，推荐使用 [GitHub - tiran/defusedxml](https://github.com/tiran/defusedxml)。

### TOML

TOML主要用于配置文件，而不是数据传输。

- [Python - tomllib](https://docs.python.org/zh-cn/3/library/tomllib.html#module-tomllib) 3.11 引入的解析 TOML 数据的模块，接口和 json 是一致的。
- [Rust - crates.io - toml](https://crates.io/crates/toml)

### YAML

### Base64

base64是相当简单的编码技术。他主要是用于将二进制数据编码成文本格式，从而满足某些限制，本身不对二进制数据作任何限制。base64只使用`A`–`Z`, `a`–`z`, `0`–`9`以及`+`和`/`来编码数据（共64个字符，代表从0到63，6位）。

也就是说，他需要用一个字节（8位）的字符，来编码一个6位的数据，所以编码之后体积会膨胀到原先的约4/3。原来的数据应该是8位的倍数而不是6位的倍数，怎么办？用`=`作为padding来填充结果。3个原本的数据，编码的到4个字符。所以如果数据最后会补充padding length = 3 - origin length % 3。

例如：编码 `hi`(0x68, 0x69, 0110 1000 0110 1001)，按照6位分就是011010, 000110 1001。也就是26, 6, 36。查表得`aGk`。还差了一个字符凑到3的倍数，补一个padding。所以最终的编码结果是`aGk=`。

base64有变种base58（去掉`0,I,l,O,+,/`方便人阅读）, base32，base16（即用Hexadecimal表达二进制数据）等。原理都一样。

Python [std - base64](https://docs.python.org/zh-cn/3/library/base64.html) 。除了 base64，还有 base32,base16 等编码也在这个库中。

```python
>>> base64.b64encode(b"hello world")
b'aGVsbG8gd29ybGQ='
>>> base64.b64decode(b'aGVsbG8gd29ybGQ=')
b'hello world'
```

## 二进制序列化方式

| **方案**   | **数据体积**   | **类型**        | **反序列化速度**   | **场景和特点**                              |
| -------- | ---------- | ------------- | ------------ | -------------------------------------- |
| ProtoBuf | 小（有数据压缩）   | 需Schema       | 快            | 用于服务通信，gRPC                            |
| Thrift   |            | 自解释，也需要Schema |              |                                        |
| FlatBuf  | 大（有数据对齐）   | 需Schema       | 极快（零拷贝，直接读取） | 用于游戏/实时系统                              |
| Borsh    |            | 自解释           |              | 用于区块链，保证相同数据结构的序列化结果**完全一致**           |
| MsgPack  | 中          | 自解释           | 快            | 二进制版JSON，用于API                         |
| CBOR     | 略大于MsgPack | 自解释           | 略慢于MsgPack   | 二进制版JSON，支持更多数据类型，标准强制兼容RFC 8949，用于IoT |
| BSON     | 大          |               |              | 用于MongoDB                              |

编程语言一般会自带Marshal的解决方案，如Python的pickle。

很多特定的领域都有他们自己的序列化数据的方式。TLV（Tag/Type-Length-Value）是经常被网络协议使用的，例如Linux Netlink, TLS, SSH。它可以形象的理解为：

```c
struct tlv {
    uint8_t type,    // type 取决于规定的类型数量，一般是1-4字节
    uint32_t length, // length 规定了value的长度，一般以字节为单位。
                     // 具体情况具体分析，如果某type就已经暗示了length，那么也可以省略
    uint8_t[] value, // 可变长度的value
}
```

TLV很适合流式解析数据，编写反序列化程序也非常方便，并且对于不认识的`type`可以直接跳过。另一种特定序列化数据的方式是提前规定好的信息组织形式（use predefined, static fields）。例如TCP数据包，UDP数据包，等等。损失一定灵活性的同时可以加快反序列化的速度，减小数据体积。
