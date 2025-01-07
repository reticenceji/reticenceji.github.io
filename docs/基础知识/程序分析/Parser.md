---
aliases: 
tags: 
date: 2024-12-20
date_modified: 2024-12-20
---

# Parser

其实和本章的主题关系微乎其微，只是正好放在这里了。

[GitHub - tree-sitter/tree-sitter: An incremental parsing system for programming tools](https://github.com/tree-sitter/tree-sitter) 这个库集成了很多编程语言的 parser。包括但不限于以下语言，具体可以参考 [官网给出的列表](https://tree-sitter.github.io/tree-sitter/#parsers)：

- C
- JSON
- HTML
- Go
- Python
- Markdown
- Makefile
- gitignore
- SQL

C, Go, Rust, Java, Python 都可以使用它对这些语言的 parser。你也可以根据这个库自定义语法规则，为自己的语言实现 Parser。它有规定自己的 DSL，使用类似 EBNF 的文法。

```js
// 对下面这段js代码执行命令 tree-sitter generate，会生成parser.c。一般将它编译为静态库使用
module.exports = grammar({
  name: 'YOUR_LANGUAGE_NAME',

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => 'hello'
  }
});
```
