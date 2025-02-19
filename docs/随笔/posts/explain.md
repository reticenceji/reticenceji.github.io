---
aliases: 
tags: 
date: 2025-01-07
date_modified: 2025-01-07
---

# 记一次SLOW SQL排查

没有使用ORM框架，也没有对SQL的执行时间进行统计，只是在运行的时候发现瓶颈貌似出现在了Postgresql数据库，于是开始尝试排查。。。

## session

首先查看sessions。我用的是`dbeaver`，如果用SQL语句的话也可以：

```sql
SELECT sa.* FROM pg_catalog.pg_stat_activity sa
```

重点关注`xact start`记录的当前事务开始时间和`query start`当前正在执行的查询的开始时间。如果发现他们`state=active`而且他们较早，说明他们相关的SQL语句执行的很慢。

更好的办法应该是在执行SQL语句的时候进行时间统计，并LOG SLOW SQL，这也是很多ORM框架的自带功能。由于缺乏经验我没有做，只能这样排查。

## explain

我找到了执行很慢的SQL，但是我自认为为他们创建了索引，不应该如此之慢。

这个时候可以用`explain`来看自己的索引到底有没有真正起作用。`analyze`选项表示真正执行这条SQL语句。

```sql
explain analyze  SELECT "from", amount, number
	FROM cashflow
	WHERE "to" = $1 AND is_fund = true
	ORDER BY number ASC LIMIT 1
```

这是`explain analyze`的结果：

```sql
Limit  (cost=1654659.38..1654659.50 rows=1 width=59) (actual time=154302.162..154654.812 rows=0 loops=1)
  ->  Gather Merge  (cost=1654659.38..1654669.42 rows=86 width=59) (actual time=154045.564..154398.214 rows=0 loops=1)
        Workers Planned: 2
        Workers Launched: 2
        ->  Sort  (cost=1653659.36..1653659.47 rows=43 width=59) (actual time=153242.010..153242.104 rows=0 loops=3)
              Sort Key: number
              Sort Method: quicksort  Memory: 25kB
              Worker 0:  Sort Method: quicksort  Memory: 25kB
              Worker 1:  Sort Method: quicksort  Memory: 25kB
              ->  Parallel Seq Scan on cashflow  (cost=0.00..1653659.15 rows=43 width=59) (actual time=153238.328..153238.422 rows=0 loops=3)
                    Filter: (is_fund AND (("to")::text = '0x42be8d8f46f1eeae232f684878bc5506af962637'::text))
                    Rows Removed by Filter: 19661737
Planning Time: 1.949 ms
JIT:
  Functions: 13
  Options: Inlining true, Optimization true, Expressions true, Deforming true
  Timing: Generation 73.339 ms (Deform 6.503 ms), Inlining 369.544 ms, Optimization 114.942 ms, Emission 130.445 ms, Total 688.269 ms
Execution Time: 154701.653 ms
```

其中的`cost=start_time..end_time`表示**操作开始的代价**和**操作完成的总代价**。操作开始的代价看起来有些奇怪，它表示操作可以开始产生任何结果之前预计要花费的代价。对于一些操作，如排序或聚集，数据库需要读入所有相关数据并进行处理才能产生第一行结果。因此，这个 "开始代价" 包括了读取和处理数据直到第一行结果准备就绪所需的预计代价。可以看到执行计划中的每一步的总代价都是十分高昂的。

> cost的单位并不是时间，而是对资源成本的抽象统计。具体可以看[PostgreSQL: Documentation: 17: 19.7. Query Planning](https://www.postgresql.org/docs/current/runtime-config-query.html#RUNTIME-CONFIG-QUERY-CONSTANTS)。真正的时间需要添加`analyze`真正执行后统计。

这是我为`to, is_fund, number`添加索引后的`explain analyze`结果。可以看到他用上了索引，效率很高。

```sql
Limit  (cost=0.56..4.62 rows=1 width=59) (actual time=1.888..1.888 rows=0 loops=1)
  ->  Index Scan using cashflow_fund_idx on cashflow  (cost=0.56..418.62 rows=103 width=59) (actual time=1.885..1.885 rows=0 loops=1)
        Index Cond: ((("to")::text = '0x42be8d8f46f1eeae232f684878bc5506af962637'::text) AND (is_fund = true))
Planning Time: 355.678 ms
Execution Time: 2.136 ms
```
