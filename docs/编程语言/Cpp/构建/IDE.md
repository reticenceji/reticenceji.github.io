---
aliases: 
tags: 
date: 2024-12-31
date_modified: 2024-12-31
---

# IDE

我喜欢VSCode。这里总结一下使用VSCode进行CPP开发，踩的一些坑。

`clangd`是我比较喜欢的插件，我添加了下面的配置（`settings.json`）：

```cpp
{
    "clangd.arguments": [
        "--fallback-style=google",
        "--header-insertion=iwyu",
        "--suggest-missing-includes"
    ]
}
```

此外Doxygen Documentation Generator, CMake 也很有用。不需要什么额外的配置。

调试我更倾向直接在命令行使用`gdb`/`lldb`，不过`lldb`插件也挺好的（`launch.json`）。下面的配置仅供参考。关键是要配置 `preLaunchTask` 来构建程序，然后在`program`中指定编译出的结果。

```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug Current File",
            "type": "lldb",
            "request": "launch",
            "program": "${workspaceFolder}/build/${fileBasenameNoExtension}",
            "args": [],
            "cwd": "${workspaceFolder}",
            "preLaunchTask": "build",  //
            "stopOnEntry": false,
            "internalConsoleOptions": "neverOpen"
        }
    ]
}
```

一个编译单文件的build命令（`tasks.json`）：

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build",
            "type": "shell",
            "command": "mkdir -p build && clang++ -g ${file} -o ${workspaceFolder}/build/${fileBasenameNoExtension}",
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}
```
