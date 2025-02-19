---
aliases: 
tags: 
date: 2024-12-16
date_modified: 2024-12-16
---

# Binrw

[`binrw`](https://github.com/jam1garner/binrw)是一个专门处理二进制文件格式的（反）序列化库，它与其他序列化库如`serde`有显著的不同。`serde`主要关注于如何将Rust结构体（struct）轻松且准确地映射到`serde`的内部数据模型。在`serde`中，将这些数据模型序列化和反序列化成文件格式的步骤需要自行实现相应的后端，虽然对于一些通用格式（如 JSON 和 XML）来说，这些后端通常已经存在。

与此相对，`binrw`专注于序列化/反序列化的具体执行过程。它允许用户更加便捷地描述Rust结构体与二进制文件格式中每个字节之间的对应关系，省去了手动编写序列化器（`Serializer`）和反序列化器（`Deserializer`）的需要。
