---
aliases: 
tags: 
date: 2024-12-16
date_modified: 2024-12-19
---

# 图数据库 Neo4j

## 环境搭建

环境搭建还是使用[neo4j - Official Image | Docker Hub](https://hub.docker.com/_/neo4j)最方便。下面的命令默认安装了graph data science插件（国内网络可能需要花较长的时间下载插件）

```bash
docker run \
    --publish=7474:7474 --publish=7687:7687 \
    --volume=$HOME/data/cashflow:/data \
    --env NEO4J_PLUGINS='["graph-data-science"]' \
    -d --name cashflow neo4j
```

然后可以在`http://localhost:7474/browser/`访问控制台。默认的账号密码为`neo4j`/`neo4j`。

## **C**ypher **Q**uery **L**anguage

Cypher 是 Neo4j 的查询语言，用于创建、修改、查询图形数据。它的语法类似于 SQL 但专门用于处理图数据。以下以创建一个简单的区块链资金流图为例，说明Cypher的基本语法：

创建节点。资金流图的节点就是账户，添加**标签**`account`，添加**属性**`address`。暂时没有其他的属性。

```cypher
CREATE (a:account {address: "0x654321"});
CREATE (a:account {address: "0x123456"});
```

> [!WARN]
> 如果重复执行`CREATE (a:account {address: "0x123456"});`语句两次，你会发现创建了两个地址为`0x123456`的节点。这并不是我们预期的行为。如果希望避免创建重复的节点，应该使用 `MERGE` 命令而不是 `CREATE`。用法相同。

我们后续需要根据地址来查找节点，所以给`address`添加**索引**。

```
CREATE INDEX FOR (a:account) ON (a.address);
```

添加一条从`0x123456`到`0x234567`的边（关系），类型为`transfer`。属性为token, amount, number。

```cypher
MERGE (source:account {address: '0x123456'})
MERGE (target:account {address: '0x234567'})

MERGE (source)-[:transfer {token: "usdt", amount: "100000000000000000000", number: 22110000}]->(target)
```

查询账户`0x123456`连接的所有边，查询要使用`MATCH`语句。

```cypher
// 入边
MATCH (a:account {address: "0x654321"})<-[r:transfer]-() RETURN r;
// 出边
MATCH (a:account {address: "0x654321"})-[r:transfer]->() RETURN r;
// 入边&出边
MATCH (a:account {address: "0x654321"})-[r:transfer]-() RETURN r;
// 入边&出边，同时关系节点
MATCH (a:account {address: "0x654321"})-[r:transfer]-(b:account) RETURN r,b;
```

清空整个图（删除所有的点和边）

```cypher
MATCH (n:account)
DETACH DELETE n
```
