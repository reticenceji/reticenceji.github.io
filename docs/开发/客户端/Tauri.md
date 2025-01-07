---
aliases: 
tags: 
date: 2024-12-23
date_modified: 2024-12-23
---

# Tauri

[Prerequisites | Tauri Apps](https://v1.tauri.app/v1/guides/getting-started/prerequisites) 这里给出了环境安装的方式。但是我实际上在Debian环境还安装了下面的库才能正常编译。

```bash
sudo apt install libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev libsoup-3.0-dev
```

由于我对JavaScript并不了解，所以我决定使用[Yew框架](https://yew.rs/zh-Hans/)。简单的理解他和其他前端框架的区别是，其他前端框架使用JavaScript操纵HTML，而他则是使用WebAssembly来完成这一工作。如此一来，就可以使用Rust来完成工作。

构建速度感人。。。
