---
aliases: 
tags: 
date_modified: 2024-12-20
date: 2024-11-30
---

# 序列化

程序通常（至少）使用两种形式的数据：

1. 在内存中，数据保存在对象、结构体、列表、数组、散列表、树等中。 这些数据结构针对 CPU 的高效访问和操作进行了优化（通常使用指针）。
2. 如果要将数据写入文件，或通过**网络**发送，则必须将其 **编码（encode）/ 序列化（serialization） / 编组（marshalling）** 为某种自包含的字节序列（例如，JSON 文档）。 由于每个进程都有自己独立的地址空间，一个进程中的指针对任何其他进程都没有意义，所以这个字节序列表示会与通常在内存中使用的数据结构完全不同。

> Serialization指的是为了让数据便于传输和存储，将对象转化成特定格式的数据。Encoding是一个更宽泛的概念，将数据从一种格式转化成另一种格式都可以叫做Encoding。Marshal 不仅传输对象的状态，而且会一起传输对象的方法（相关代码）。但是实际上我们不需要严格的区分他们三者的区别。

| 编码方式                             | 二进制/文本 | 类型    | 优点             | 缺点               |
| -------------------------------- | ------ | ----- | -------------- | ---------------- |
| Base64                           | 文本     | 无     | 支持广泛，编码二进制     | 没有结构，浪费空间        |
| JSON                             | 文本     | 弱/自解释 | 简洁             |                  |
| XML                              | 文本     | 弱/自解释 |                | 复杂               |
| YAML                             | 文本     | 弱/自解释 |                |                  |
| TOML                             | 文本     | 弱/自解释 | 适合配置文件         |                  |
| CSV,TSV                          | 表格     | 弱     | 适合表格           | 缺少统一规范           |
| CBOR                             | 二进制    | 弱/自解释 | 编码紧凑，二进制版的JSON |                  |
| Protobuf                         | 二进制    | 强     | 二进制比文本节省空间     | 主要对Go比较好用        |
| Borsh                            | 二进制    | 强     | 可以序列化对象        | 使用的少，主要对Rust比较好用 |
| Thrift                           | 二进制    | 强     |                |                  |
| Avro                             | 二进制    | 弱/自解释 |                |                  |
| pickle/ java.io.Serializable/... | 二进制    | 强     | 语言自带，可以序列化对象   | 不安全，不通用          |

## JSON

JSON的用途非常广泛。很多语言内置/通过标准库支持了JSON的序列化和反序列化。有2个需要注意的点：

- 大于 $2^{53}$ 的整数无法使用 IEEE 754 双精度浮点数精确，所以不应该使用JSON直接存储这样的数据。一定要存大整数可以使用字符串。
- 不直接支持二进制数据，需要借助如Base64的帮助。

具体编程实践可以参考：

- [Python - json](../../编程语言/Python/库/json.md)
- [Rust - Serde](../../编程语言/Rust/库/Serde.md)

## XML

有人对XML的评价是：一般的语言，要么适合机器阅读，要么适合人类阅读。而XML是少有的对人和机器都不友好的。这里不做过多介绍。

Python 标准库提供的 XML 模块，对于恶意构造的数据是不安全的。 攻击者可能滥用 XML 功能来执行拒绝服务攻击、访问本地文件、生成与其它计算机的网络连接或绕过防火墙。如果来源不信任，推荐使用 [GitHub - tiran/defusedxml](https://github.com/tiran/defusedxml)。

## TOML

TOML主要用于配置文件，而不是数据传输。

- [Python - tomllib](https://docs.python.org/zh-cn/3/library/tomllib.html#module-tomllib) 3.11 引入的解析 TOML 数据的模块，接口和 json 是一致的。
- [Rust - crates.io - toml](https://crates.io/crates/toml)

## YAML

## Base64

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

## Protobuf

golang 和 Protobuf 的集成使用时最常见的。
