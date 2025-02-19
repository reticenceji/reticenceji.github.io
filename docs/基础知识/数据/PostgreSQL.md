---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# CRUD

使用docker运行postgresql，将数据mount到本地：

```console
docker run -d \
	--name some-postgres \
	-e POSTGRES_PASSWORD=mysecretpassword \
	-e PGDATA=/var/lib/postgresql/data/pgdata \
	-v /custom/mount:/var/lib/postgresql/data \
	postgres
```

# Internal

# Externtion

[pgrx](https://docs.rs/pgrx/latest/pgrx/)是用来编写PostgreSQL extensions 的Rust Framework。

<https://zhuanlan.zhihu.com/p/623058163>  
<https://pg-internal.vonng.com/#/>
