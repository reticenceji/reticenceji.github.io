---
aliases: 
tags: 
date: 2024-12-24
date_modified: 2024-12-24
---

# Vscode

## C++环境配置

使用clangd，配置标准为C++17，提示头文件。

```json
{
    "clangd.arguments": [
        "--compile-commands-dir=<path_to_compile_commands.json>",
        "--fallback-style=google",
        "--header-insertion=iwyu",
        "--suggest-missing-includes",
        "-std=c++17"
    ]
}
```
