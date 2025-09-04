---
aliases: 
tags: 
date_modified: 2025-04-03
date: 2024-11-30
---

# PostgreSQL

## CRUD

使用docker运行postgresql，将数据mount到本地：

```console
docker run -d \
	--name some-postgres \
	-e POSTGRES_PASSWORD=mysecretpassword \
	-e PGDATA=/var/lib/postgresql/data/pgdata \
	-v /custom/mount:/var/lib/postgresql/data \
	postgres
```

### notify & listen

`NOTIFY` 和 `LISTEN` 是 PostgreSQL 提供的内置发布/订阅机制，用于实现进程间通信（IPC）。它非常轻量级，适合在数据库中实现简单的事件驱动系统。

- **`LISTEN`**:
    - 用于监听一个特定的通知频道（channel）。
    - 当某个客户端发出 `NOTIFY`，所有正在监听该频道的客户端都会收到通知。
- **`NOTIFY`**:
    - 用于向一个频道发送通知。
    - 你可以附加一个可选的 "通知负载"（payload），即一段字符串数据。

例如，我们可以主动发送通知

```sql
NOTIFY channel_name, 'optional payload';  
```

也可以在表更新的时候发送通知：下面的SQL创建了一个新的函数`notify_pipeline_change()`，返回一个触发器`TRIGGER`，`AS $$ ... $$`中是函数的主体，`pg_nofity`是PG的内置函数，用来发送通知。在触发器函数中，`NEW` 是一个特殊的记录变量，表示触发器作用的表中 "新插入或更新的行"。`RETURN NEW` 表示触发器函数会返回这条新记录。`LANGUAGE plpgsql`指定了函数使用的是 PostgreSQL 的过程语言 PL/pgSQL。

```sql
CREATE OR REPLACE FUNCTION notify_pipeline_change()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('pipeline_changes', 
    json_build_object(
      'operation', TG_OP,
      'id', NEW.id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

然后结合触发器，在插入的时候调用上面定义的触发器函数

```sql
CREATE TRIGGER pipeline_change_trigger
AFTER INSERT ON pipelines
FOR EACH ROW
EXECUTE FUNCTION notify_pipeline_change();
```

### 锁

PostgreSQL 提供了几种不同的锁定模式：

- `FOR UPDATE`：最严格的锁，阻止其他事务读取或修改锁定的行

```sql
SELECT * FROM your_table WHERE id = 123 FOR UPDATE;
```

- `FOR NO KEY UPDATE`：阻止其他事务修改该行，但允许使用 `FOR SHARE` 读取

```sql
SELECT * FROM your_table WHERE id = 123 FOR NO KEY UPDATE;
```

- `FOR SHARE`：允许其他事务同时读取该行，但不能修改，直到锁释放

```sql
SELECT * FROM your_table WHERE id = 123 FOR SHARE;
```

- `FOR KEY SHARE`：最弱的锁，防止其他事务执行删除或 `UPDATE` 会修改键值的操作

```sql
SELECT * FROM your_table WHERE id = 123 FOR KEY SHARE;
```

如果想要避免长时间等待锁，可以设置锁超时。

## 内部实现

## Extension

[pgrx](https://docs.rs/pgrx/latest/pgrx/)是用来编写PostgreSQL extensions 的Rust Framework。

## 参考链接

<https://zhuanlan.zhihu.com/p/623058163>  
<https://pg-internal.vonng.com/#/>
