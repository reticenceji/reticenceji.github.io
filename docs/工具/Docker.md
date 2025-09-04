---
aliases: 
tags: []
date_modified: 2025-03-26
date: 2024-11-30
---

# Docker

### Case 1: 代理

国内必须要面对的问题。国内的Docker Hub镜像基本都被封了，而直接拉太慢，有时根本访问不上。必须挂代理。

参考[Daemon proxy configuration | Docker Docs](https://docs.docker.com/engine/daemon/proxy/#httphttps-proxy)， 这里给出的方法是修改`/etc/systemd/system/docker.service.d/http-proxy.conf`，添加

```toml
[Service]
Environment="HTTP_PROXY=http://127.0.0.1:7890"
Environment="HTTPS_PROXY=http://127.0.0.1:7890"
```

然后重启docker

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

应该就可以了。

### Case 2: Dockerfile

如果要把自己程序的运行环境发布，最简单的办法就是编写Dockerfile文件，随源代码一起发布。

### Case 3: Docker Compose

Compose 是用于定义和运行多容器 Docker 应用程序的工具。通过 Compose，您可以使用 YML 文件来配置应用程序需要的所有服务。然后，使用一个命令，就可以从 YML 文件配置中创建并启动所有服务。
