---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# Cargo

Cargo 是Rust的官方构建和依赖管理工具，用过都说好。最基本的使用就是`cargo new`创建新工程，编写代码然后`cargo build`或`cargo run`。具体的使用方法可以参考[cargo book](https://doc.rust-lang.org/cargo/)。此处不做介绍。

## 指定依赖项

Rust项目可以引用在 `crates.io` 或 `GitHub` 上的依赖包，也可以引用存放在本地文件系统中的依赖包。

依赖版本是很麻烦的问题，如果版本冲突（如你的代码依赖A和B，而A和B依赖两个不同版本的C）只能回退（回退A或B），或者自己另fork一个兼容的库。

```notrust
1.2.3  :=  >=1.2.3, <2.0.0
1.2    :=  >=1.2.0, <2.0.0
1      :=  >=1.0.0, <2.0.0
0.2.3  :=  >=0.2.3, <0.3.0
0.2    :=  >=0.2.0, <0.3.0
0.0.3  :=  >=0.0.3, <0.0.4
0.0    :=  >=0.0.0, <0.1.0
0      :=  >=0.0.0, <1.0.0
~1.2.3  := >=1.2.3, <1.3.0
~1.2    := >=1.2.0, <1.3.0
~1      := >=1.0.0, <2.0.0
*     := >=0.0.0
1.*   := >=1.0.0, <2.0.0
1.2.* := >=1.2.0, <1.3.0
```

> [!NOTE]  
> 所以在编写库的时候，避免使用太具体的版本依赖，不用上传Cargo.lock

除了指定版本，还可以指定本地路径和Git路径。参考[Cargo Book](https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html)

## 依赖冲突

依赖可能会因为存在某些问题被维护者从`crates.io`撤回，被标记成`yanked`。但是你又不得不去使用，可以使用`patch`特性解决这个问题。例如依赖的`parity-secp256k1`被撤回了，可以在 Cargo.toml 添加：

```toml
[patch.crates-io]
parity-secp256k1 = { git = "https://github.com/paritytech/rust-secp256k1", branch = "master" }
```

> [!WARN]
> 被撤回多半是出于某些原因，如安全问题，不要贸然使用这个办法。这个办法也可以用来强行解决依赖冲突问题。
