---
aliases: 
tags: 
date: 2024-12-24
date_modified: 2024-12-24
---

# 迭代器

迭代器是一个**named requirements**。可以循环访问 C++ 标准库容器中的元素，并提供对各个元素的访问。 C++ 标准库容器全都提供迭代器，以便**算法**可以采用标准方式访问其元素，而不必考虑用于存储元素的容器类型。

迭代器又可以根据其能力分成不同的类型。如支持Random Access的迭代器，Bi Direction的双向迭代器，只读的迭代器，等等。

> 相比于Rust主要使用Trait来定义接口/约束的机制，从而支持多态、代码复用。C++对类型的规范更加复杂：
> 1. Abstract Class：通过纯虚函数定义接口，子类必须实现所有纯虚函数。
> 2. Named Requirements: 是一个概念层面的约束，**没有具体语法表示**，主要用于模板编程，定义了类型必须满足的操作和表达式。我感觉他有点类似于Golang的Interface，因为类对它们的实现是隐式的。
> 3. Concept：C++20引入。是对Named Requirements的形式化，提供了更清晰的语法。我感觉他有点类似于Rust的trait，因为类对它们的实现是显式的。

## 参考链接

- [迭代器 | Microsoft Learn](https://learn.microsoft.com/zh-cn/cpp/standard-library/iterators?view=msvc-170)
- [Iterator library - cppreference.com](https://en.cppreference.com/w/cpp/iterator)
