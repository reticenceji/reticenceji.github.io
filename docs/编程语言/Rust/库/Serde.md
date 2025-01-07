---
aliases: 
tags: 
date_modified: 2024-12-20
date: 2024-11-30
---

# Serde

[`serde`](https://github.com/serde-rs/serde) 是一个用于高效且通用地**序列化Serialize**和**反序列化Deserialize** Rust 数据结构的框架。另外，`serde`主要关注于如何将Rust结构体（struct）轻松且准确地映射到`serde`的内部数据模型，而将`serde`的内部数据模型与实际的文件格式进行转换的过程，不是`serde`库本身完成的，而是类似于`serde-json`这种库完成的。

## 使用方式

参考[Using derive · Serde](https://serde.rs/derive.html)。对于一般的情况（如反序列化个JSON文件），只需要简单的定一个一个数据结构，添加个宏就够了。以JSON为例：

在解析 JSON 文本的时候，我们可能有两种需求，以及相反的序列化的需求。

1. 解析成一个 **strongly typed** Rust data structure。比如一些 API 已经规定好了返回的数据格式。
2. 解析成一个 **untyped or loosely typed** representation。一些更普通的情况。

**Demo For Strong Type**： 我们一般使用 `#[derive(Serialize, Deserialize)]` 来修饰要序列化/反序列化的类型。然后在 `serde_json::from_str` 的时候指定类型。

```rust
use serde::{Deserialize, Serialize};
use serde_json::Result;

#[derive(Serialize, Deserialize)]
struct Person {
    name: String,
    age: u8,
    phones: Vec<String>,
}

fn typed_example() -> Result<()> {
    // Some JSON input data as a &str. Maybe this comes from the user.
    let data = r#"
        {
            "name": "John Doe",
            "age": 43,
            "phones": [
                "+44 1234567",
                "+44 2345678"
            ]
        }"#;

    // Parse the string of data into a Person object. This is exactly the
    // same function as the one that produced serde_json::Value above, but
    // now we are asking it for a Person as output.
    let p: Person = serde_json::from_str(data)?;

    // Do things just like with any other Rust data structure.
    println!("Please call {} at the number {}", p.name, p.phones[0]);

    Ok(())
}
```

如果我们希望再将 Person 序列化成 json 文本，可以调用 `serde_json::to_string`

```rust
    // Serialize it to a JSON string.
    let j = serde_json::to_string(&p)?;

    // Print, write to a file, or send to an HTTP server.
    println!("{}", j);
```

**Demo For Loose Type**: [`serde_json::Value`](https://docs.rs/serde_json/1/serde_json/value/enum.Value.html) 是这种松散类型的一般表示。在 `serde_json::from_str` 的时候指定类型为 Value 即可。

```rust
use serde_json::{Result, Value};

fn untyped_example() -> Result<()> {
    // Some JSON input data as a &str. Maybe this comes from the user.
    let data = r#"
        {
            "name": "John Doe",
            "age": 43,
            "phones": [
                "+44 1234567",
                "+44 2345678"
            ]
        }"#;

    // Parse the string of data into serde_json::Value.
    let v: Value = serde_json::from_str(data)?;

    // Access parts of the data by indexing with square brackets.
    println!("Please call {} at the number {}", v["name"], v["phones"][0]);

    Ok(())
}
```

不难想到，序列化就是先构造松散类型的 `Value` 类型数据，再 `to_string`。我们可以使用 `json!` 宏来构造 `Value` 类型数据。

```rust
use serde_json::json;

fn main() {
    // The type of `john` is `serde_json::Value`
    let john = json!({
        "name": "John Doe",
        "age": 43,
        "phones": [
            "+44 1234567",
            "+44 2345678"
        ]
    });

    println!("first phone number: {}", john["phones"][0]);

    // Convert to a string of JSON and print it out
    println!("{}", john.to_string());
}
```

## 工作原理

### 序列化

根据库的设计，对一个对象（`value`）进行序列化的基本方式为：

```rust
// 创建一个新的 序列化器，一般会传入一个`io::Write`用来写序列化的结果
let mut ser = Serializer::new(writer);
// 将 value 序列化的结果保存到 ser 中，一般就是写到相应的writer中
value.serialize(&mut ser)?;
```

`serialize`是`trait ser::Serialize`中定义的唯一的方法，他会根据用户传入的**序列化器**，对**对象**进行序列化操作。一般来说，对象的Serialize方法都是使用`#derive(Serialize)`自动生成的。这也就意味着，传入的**序列化器**必须要有良好的抽象，才能在此基础上为所有的结构自动生成`serialize`方法。

```rust
pub trait Serialize {
    /// Serializes this value into this serializer.
    fn serialize<S>(&self, serializer: &mut S) -> Result<(), S::Error>
        where S: Serializer;
}
pub trait Serializer: Sized {
    ...
    fn serialize_bool(self, v: bool) -> Result<Self::Ok, Self::Error>;
    ...
}
```

序列化器要满足`pub trait Serializer`，它包含了对[Rust Type System中29种元素](https://serde.rs/data-model.html#types)的处理方式。例如，`serialize_bool`，以JSON为例，不难猜测**序列化器**在实现这个接口时，会将`v`变成`true`或`false`的字符串。

由此，我们不难猜测——自动生成的`serialize`方法，其实规定了遍历对象的顺序，根据遍历对象的类型递归的调用每个类型相应的方法？由于宏的代码太难读懂了，不妨写一个简单的代码看宏的展开结果（使用`cargo-expand`）。结论是思路差不多。

整个序列化的过程是一个状态机的思路，状态机的代码一般由`#derive(Serialize)`自动生成，状态->状态之间的转化规则也是。而每个状态转化过程中，造成的副作用，则是由用户的**序列化器**决定。

### 反序列化

反序列化的过程似乎没有那么直白。毕竟序列化面对的是Rust的规整数据结构，反序列化面对的则是字节串。类似的，我们从基本用法入手：

```rust
let mut de = Deserializer::new(read);
let value = de::Deserialize::deserialize(&mut de)?;
de.end();
```

乍一看，懵了。为什么和序列化不一样？怎么光有**反序列化器**没有数据？其实数据一般通过`io::Read`读入。接着调用`deserialize`方法反序列化成Rust的数据结构。类似的，这个方法一般也是通过`#derive(Deserialize)`自动生成的。

```rust
pub trait Deserialize<'de>: Sized {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error> where D: Deserializer<'de>;
    }

pub trait Deserializer<'de>: Sized {
    fn deserialize_any<V>(self, visitor: V) -> Result<V::Value, Self::Error>
    where
        V: Visitor<'de>;

    /// Hint that the `Deserialize` type is expecting a `bool` value.
    fn deserialize_bool<V>(self, visitor: V) -> Result<V::Value, Self::Error>
    where
        V: Visitor<'de>;
    ...
}
```

**反序列化器**要满足`pub trait Deserializer`，它也规定了对[Rust Type System中29种元素](https://serde.rs/data-model.html#types)的处理方式。  
每一个方法都要传入一个`Visitor`，返回一个`Visitor::Value`，Visitor的作用就是给定数据，返回Rust类型。不难猜测，对于JSON来说，当遇到`"true"`的时候，返回的大概就是`Visitor::Value::Bool(True)`。如果我们知道我们的JSON就包含一个`bool`，那就调用`deserialize_bool`。

类似的，反序列化的过程也是一个状态机的思路。状态机的状态转移由`#derive(Deserialize)`自动生成。我还没有特别搞明白。

<!--除此之外，还有`deserialize_any`例如传过来一个自解释的编码方式，例如JSON？自然的想法是，先调用统一的`deserialize_any`，之后在分发给具体的`deserialize_xxx`。-->

## 编写自定义规则

## NOM

[nom](https://docs.rs/nom/latest/nom/)是一个解析器组合器库，专注于安全解析、流模式和尽可能多的零复制。

## PEST

[pest](https://pest.rs/) 是一个支持[PEG](https://en.wikipedia.org/wiki/Parsing_expression_grammar) 文法的通用 parser。

## 参考链接

- <https://github.com/serde-rs/json/tree/v0.6.0/json/src>
- <https://serde.rs/>
- <https://www.joshmcguigan.com/blog/understanding-serde/>
- <https://aptend.github.io/2020/01/08/serde-what-are-you-doing-de-part2/>
