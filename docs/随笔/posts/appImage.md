---
aliases: 
tags: 
date: 2024-12-17
date_modified: 2024-12-17
---

# AppImage 创建“快捷方式”

AppImage是很 Linux 流行的应用打包方式。在运行的时候，他会将自身解压到`/tmp/.mount_xxx`文件夹下运行。

但是下载AppImage之后，难道每次使用都要打开下载目录然后运行吗？能不能在桌面，或者菜单，或者命令行直接打开呢？

想要在桌面/菜单打开，需要在`~/Desktop`/`~/.local/share/applications`创建一个Desktop文件。可以从`/tmp/.mount_xxx`复制Desktop文件，然后修改其中的可执行文件路径，以及Icon路径。必要的话将Icon文件复制出来。

想要在命令行打开，可以创建一个软链接到`/usr/bin`或者其他PATH中的路径。

```bash
ln -s xxx.AppImage /usr/bin/xxx
```
