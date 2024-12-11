---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# Serde

`Serde` 是一个用于高效且通用地**序列化Serialize**和**反序列化Deserialize** Rust 数据结构的框架。如果对序列化和反序列化的概念不清楚，可以参阅 [Serde](Serde.md)。

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

---

参考资料：

- <https://github.com/serde-rs/json/tree/v0.6.0/json/src>
- <https://serde.rs/>
- <https://www.joshmcguigan.com/blog/understanding-serde/>
- <https://aptend.github.io/2020/01/08/serde-what-are-you-doing-de-part2/>
