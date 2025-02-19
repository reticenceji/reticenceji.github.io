---
aliases: 
tags: []
date_modified: 2024-12-11
date: 2024-11-30
---

# Git

在现在GPT如此牛逼的情况下，也不用特别去记Git命令。

## Git In Action

### Case 1 暂时切换分支

如果我正在一个分支上工作，突然有事要切换到其他分支看看，可以使用`git stash` 命令，先暂存一下工作区的文件。

等待切换回原来的分支，用`git stash pop`就可以恢复原来工作区的文件。

这是最基本的用法。事实上`git stash`可以暂存很多份工作区，使用`git stash list`查看暂存情况。

### Case 2 提交了垃圾文件

不小心把不要的文件commit了，这个时候再添加到.gitignore已经来不及了。可以从Git索引中删除文件：

```sh
git rm --cache xxx
```

然后将文件添加到.gitignore。

### Case 3 远程服务器拉取私有仓库

需要在服务器拉取私有仓库，但是不想把自己的私钥传到服务器。可以使用**SSH Agent Forwarding**

在本地计算机上启动ssh-agent,并添加你的GitHub私钥:

```sh
eval `ssh-agent` 
ssh-add ~/.ssh/github_rsa
```

然后使用`-A`参数连接到服务器并启用Agent Forwarding:

```sh
ssh -A user@your_server
```

> 可以在远程服务器上运行`ssh-add -L`查看是否已经添加私钥。 

这样你就可以在服务器上拉取私有仓库了,而无需将私钥拷贝到服务器上。只要保证本地计算机的安全性即可。

### Case 4 Commit规范

酌情遵守下面的规范。完整版参考<https://www.conventionalcommits.org/en/v1.0.0-beta.4/>

```
<type>(<scope>): <subject>
// 空一行
<body>
// 空一行
<footer>
```

| type     | 描述                            |
| -------- | ----------------------------- |
| feat     | 新增feature                     |
| fix      | 修复bug                         |
| docs     | 修改文档，如readme.md               |
| style    | 修改代码格式，不改变代码逻辑，如逗号、缩进、空格等     |
| refactor | 代码重构，没有新增功能或修复bug             |
| perf     | 优化相关，如提升性能、用户体验等              |
| test     | 测试用例，包括单元测试、集成测试              |
| ci       | 修改ci配置文件或脚本，如jenkins fastlame |
| chore    | 修改构建脚本、或者增加依赖库、工具等            |
| revert   | 回滚之前的commit                   |

scope：commit影响的范围，可以是影响的文件名、模块名、组件名、国家等。  
subject：commit的简短描述。  
body：commit的详细描述。  
footer：备注，通常是Breaking changes或者Closed issues

### Case 5 修改 Git 的默认编辑器

```sh
git config --global core.editor vim
```

### Case 6 回退到某个版本

这也分情况。第一种情况是我只想回去看看。

```bash
git checkout [commit-hash]
```

第二种情况是，我不想要从那时起的所有修改了。如果你想要完全回到某个版本，并丢弃所有之后的修改（包括工作目录和暂存区的修改），可以使用硬重制（第一行）；如果你只想重置 Git 历史记录，但保留更改在暂存区中，可以使用软重制（第二行）。

```bash
git reset --hard [commit-hash]
git reset --soft [commit-hash]
```

---
1. ww的资料不错 <https://gitbook.tw/> 
2. 
