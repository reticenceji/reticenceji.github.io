---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-12-05
---

# Mkdocs + Obsidian + Github = Free Publish

Obsidian是我很喜欢的自托管笔记工具。但是它的Publish功能是收费的。Mkdocs是一个将markdown发布成静态网页的开源免费工具。而Github Pages可以免费部署静态站点。这不就齐活了！

前提条件：对Python/Git/Github Pages有最基本的了解。

如果你不想读下面那么多东西，Clone [GitHub - reticenceji/reticenceji.github.io: My simple blog](https://github.com/reticenceji/reticenceji.github.io) ，将`docs`文件夹中的`javascripts`和`stylesheets`复制到你的Obsidian工作目录，然后将`docs`文件夹整个替换成你的Obsidian，打开仓库的github pages选项，上传即可。你将会得到一个美观度尚可，渲染正常的网页。

如果你懂前端，自行修改`javascripts`和`stylesheets`目录中的内容。

## Obsidian Part

我只是将Obsidian用作简单的Markdown书写和管理工具，没有下载其他的渲染奇怪语法的插件。如果你有奇怪语法，可能要自己想办法通过编写 javascript 渲染了。这里，假设你的笔记全部保存在`notes`文件夹中。

## Mkdocs Part

首先需要安装依赖。这是我使用的环境，通过`poetry`来管理。

```toml
[tool.poetry.dependencies]
python = "^3.12"
mkdocs = "^1.5.0"
mkdocs-material = "^9.5.45"
mkdocs-glightbox = "^0.4.0"  
mkdocs-meta-descriptions-plugin = "^3.0.0" 
pillow = "^11.0.0"
cairosvg = "^2.7.1"
```

> [!NOTE]
> 你也可以直接使用`pip`安装下面的依赖。最基本的可以只安装`mkdocs`和`mkdocs-material`。但是后面的github workflow要相应的修改。后文假设你用`poetry`进行管理。

安装完成后，在`notes`文件夹的同级目录创建`mkdocs.yml`（也就是说我建议创建一个父目录，管理`notes`和其他文件，之后用`git`管理该父目录，之后称父目录为`root`）。

给`mkdocs.yml`填写最基本的内容：

```yaml
site_name: My Notes
docs_dir: notes
theme:
  name: material
plugins:
  - search
```

然后运行`poetry run mkdocs serve`，就可以在浏览器`http://127.0.0.1:8000/`预览渲染出来的站点了。

## Github Part

在`root`文件夹运行`git init`，添加`.gitignore`文件如下，让无关文件不要上传。

```
.cache
site
notes/.obsidian
```

添加`.github/workflows/deploy.yml`，输入以下内容。这样可以让你在上传笔记到Github的时候，自动构建、部署。

```yaml
name: Deploy MkDocs
on:
  push:
    branches: 
      - master  # 或者是 master，取决于您的默认分支名称
  pull_request:
    branches:
      - master

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          
      - name: Install Poetry
        uses: snok/install-poetry@v1
        
      - name: Install dependencies
        run: poetry install --no-interaction --no-root
        
      - name: Build and deploy
        run: |
          poetry run mkdocs gh-deploy --force 
```

然后就可以将文件上传到Github仓库（`username.github.io`仓库）了。对仓库进行如下配置。

![](../static/Pasted%20image%2020241205154750.png)

过几分钟，应该就可以在Github站点`https://username.github.io`看到了。

## 功能补全

### 主页404

一进去咋是404 Not Found？可以创建一个叫index.md的文件放在笔记的根目录作为主页。

### 无法正常渲染公式

在Obsidian中可以使用`$`来书写公式。但是mkdocs没有直接支持。可以通过集成Mathjax来支持。

在`mkdocs.yml`中添加 

```yaml
extra_javascript:
  - https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/polyfill-io/3.111.0/polyfill.min.js
  # MathJax 核心文件
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/tex-mml-chtml.js
  # 额外的字体文件
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/output/chtml/fonts/woff-v2/MathJax_Main-Regular.woff
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/output/chtml/fonts/woff-v2/MathJax_Math-Italic.woff
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/output/chtml/fonts/woff-v2/MathJax_Size1-Regular.woff
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/output/chtml/fonts/woff-v2/MathJax_Size2-Regular.woff
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/output/chtml/fonts/woff-v2/MathJax_Size3-Regular.woff
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/output/chtml/fonts/woff-v2/MathJax_Size4-Regular.woff
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/output/chtml/fonts/woff-v2/MathJax_AMS-Regular.woff
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/output/chtml/fonts/woff-v2/MathJax_Calligraphic-Regular.woff
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/output/chtml/fonts/woff-v2/MathJax_Fraktur-Regular.woff
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/output/chtml/fonts/woff-v2/MathJax_SansSerif-Regular.woff
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/output/chtml/fonts/woff-v2/MathJax_Script-Regular.woff
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/output/chtml/fonts/woff-v2/MathJax_Typewriter-Regular.woff
  - https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M/mathjax/3.2.0/es5/output/chtml/fonts/woff-v2/MathJax_Vector-Regular.woff
extra_css:
  - https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css
```

### NOTE 块

在Obisidan中可以使用`>[!NOTE]`来渲染提示块，Mkdocs没有直接支持。

在`mkdocs.yml`中添加：

```yaml
extra_javascript:
- javascripts/extra.js
extra_css:
- stylesheets/extra.css
```

在`javascripts/extra.js`脚本中添加：

```js
// 渲染[!NOTE]/[!WARN]/[!ERROR]块
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('blockquote p').forEach(function (p) {
        if (p.textContent.startsWith('[!NOTE]')) {
            const blockquote = p.parentNode;
            blockquote.classList.add('note');
            p.innerHTML = p.innerHTML.replace('[!NOTE]', '');
        } else if (p.textContent.startsWith('[!WARN]')) {
            const blockquote = p.parentNode;
            blockquote.classList.add('warn');
            p.innerHTML = p.innerHTML.replace('[!WARNING]', '');
        } else if (p.textContent.startsWith('[!ERROR]')) {
            const blockquote = p.parentNode;
            blockquote.classList.add('error');
            p.innerHTML = p.innerHTML.replace('[!ERROR]', '');
        }
    });
});
```

在`stylesheets/extra.css`中添加：

```css
blockquote.error {
    border-left: 5px solid #FF0000 !important;
    background-color: rgba(255, 0, 0, 0.15) !important;
}

blockquote.warn {
    border-left: 5px solid #FFD700 !important;
    background-color: rgba(255, 215, 0, 0.15) !important;
}

blockquote.note {
    border-left: 5px solid #0078D7 !important;
    background-color: rgba(0, 120, 215, 0.15) !important;
}
```

### 更多的美化

如果你懂css和javascript，那自然不必我多说。如果你和我一样是前端小白，那么可以抄作业[GitHub - reticenceji/reticenceji.github.io: My simple blog](https://github.com/reticenceji/reticenceji.github.io)，复制其中的docs/javascript和docs/stylesheets稍作修改，或者问问GPT。

## Example Site

[Reticence Ji's Notes](https://reticenceji.github.io/)
