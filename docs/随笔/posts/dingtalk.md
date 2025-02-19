---
aliases: 
tags:
  - fix
date: 2024-12-12
date_modified: 2024-12-12
---

# 钉钉在部分桌面环境无法打开链接

我的桌面环境是Linux Mint。钉钉版本7.6.25-Release.4112601，无法通过点击打开链接（之前版本也是）。

钉钉默认安装在`/opt/apps/com.alibabainc.dingtalk/files/<version>/com.alibaba.dingtalk`，但是一般创建的快捷方式是运行上级目录的`Elevator.sh`，他里面链接了一个保护的动态链接库`libcef.so`（我并不知道具体是干啥的），导致无法通过浏览器打开链接。

可以修改`Elevator.sh`的这一行，将`true`改成`false`。或者通过修改其他地方让它不要被加载就可以了。

```bash
...
is_enable_cef109=true
if [ "${is_enable_cef109}" = "true" ]; then
    if [ "$os_machine" = "aarch64" ]; then
        if [ "${libc_lower_29}" = "true" ]; then
            preload_libs="${preload_libs} ./libm-2.31.so "
        fi
    fi
    preload_libs="${preload_libs} ./plugins/dtwebview/libcef.so "
else
if [ "$os_machine" = "mips64" ]; then
    echo mips64el branch
    preload_libs="${preload_libs} ./plugins/dtwebview/libcef.so "
fi
fi
...
```
