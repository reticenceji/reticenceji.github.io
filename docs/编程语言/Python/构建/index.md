---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# Build

介绍一些Python生态包管理、构建、安装系统。

## vitrualenv

在一众包管理程序出现之前，virtualenv是我最喜欢的防止环境污染的办法。

安装

```bash
sudo apt install python3-virtualenv
```

使用

```bash
virtualenv .env
```

## pipx

pipx: 在隔离环境中安装和运行 Python **应用程序**。直接使用pip安装python发布的程序，可能会对环境造成污染。用pipx就没有这个困扰了。

安装：

```bash
sudo apt install pipx
pipx ensurepath
```

## poetry

Poetry 是 Python 中的依赖管理和打包工具。它允许您声明您的项目所依赖的库，并且它将为您管理（安装/更新）它们。 Poetry 提供了一个锁定文件来确保可重复安装，并可以构建您的项目以进行分发。和Rust的Cargo非常类似。

安装：

```bash
pipx install poetry
```

一个让人比较关心的问题是，poery会把依赖安装在哪里？默认情况下，Poetry 在 `{cache-dir}/virtualenvs` 中创建一个虚拟环境。您可以通过编辑 Poetry 配置来更改 `cache-dir` 值。此外，您可以使用 `virtualenvs.in-project` 配置变量在项目目录中创建虚拟环境。此外，还可以先激活虚拟环境，再使用Poetry。

### Use with Docker

按照一般的方式使用poetry安装依赖，需要将整个文件夹复制到docker中，然后执行`poetry install`。这对docker的缓存机制非常的不友好，任何的改动都要重新安装一遍依赖。可以用下面的方法代替

```dockerfile
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root --no-directory --with bin

# Copy folder
COPY . /root/esim
RUN cd /root/esim && poetry install
```

### Publish a package

如果使用poetry的话，是比较简单的。使用`poetry build`就可以了，会在`dist`文件夹下放构建的包。用`pip install xxx.whl`就可以安装了。

## pytest

python最流行的测试框架。
