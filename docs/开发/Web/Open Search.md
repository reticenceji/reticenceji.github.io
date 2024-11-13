---
aliases: 
tags: 
date_created: Wednesday, November 13th 2024, 1:30:01 pm
date_modified: Wednesday, November 13th 2024, 2:15:37 pm
---

# Open Search

## Basic Usage

查看所有的索引，这可以给你一个关于哪些数据被存储的初步印象。

```bash
curl -X GET "localhost:9200/_cat/indices?v"
```

索引的映射（Mapping）定义了索引中文档的字段名和字段类型。查看映射可以帮助你理解存储在特定索引中的数据结构。

```bash
curl -X GET "localhost:9200/my-index/_mapping?pretty"
```

批量获取数据，实用Scroll API

```json
GET xxx_index/_search?scroll=1m
{
  "query": {
    "range": {
      "_id": {
        "gte": "20000000",
        "lte": "21000000"
      }
    }
  },
  "size": 1000
}
```
