---
aliases: 
tags: 
date: 2025-03-06
date_modified: 2025-03-06
---

# deadpool

`deadpool` 是一个简洁明了的异步连接池实现，借助它我们可以为各种类型的连接构建连接池。学习一下它的实现。

## Managed Pool

`deadpool`定义了一个`trait manager::Manager`，顾名思义，实现这个trait的类型可以用来管理连接的创建、销毁。以[deadpool-lapin 0.12.1 - Docs.rs](https://docs.rs/crate/deadpool-lapin/latest/source/src/lib.rs)为例：

```rust
impl managed::Manager for Manager {
    type Type = lapin::Connection;
    type Error = Error;

    async fn create(&self) -> Result<lapin::Connection, Error> {
        let conn =
            lapin::Connection::connect(self.addr.as_str(), self.connection_properties.clone())
                .await?;
        Ok(conn)
    }

    async fn recycle(&self, conn: &mut lapin::Connection, _: &Metrics) -> RecycleResult {
        match conn.status().state() {
            lapin::ConnectionState::Connected => Ok(()),
            other_state => Err(RecycleError::message(format!(
                "lapin connection is in state: {:?}",
                other_state
            ))),
        }
    }
}
```

可以看到，`create`方法做的就是创建连接，`recycle`方法用来判断一个连接是否依然有效（能否再使用）。

实现了`Manager`之后，连接池`managed::Pool`就是借助`Manager`自动实现连接管理了，具体的实现逻辑都在`Pool`的方法中。

```rust
pub struct Pool<M: Manager, W: From<Object<M>> = Object<M>> {
    inner: Arc<PoolInner<M>>,
    _wrapper: PhantomData<fn() -> W>,
}
```
