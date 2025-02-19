---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-11-30
---

# Betweenness Centrality

betweenness centrality(介数中心性)是一种用于测量图(graph)或网络中节点重要性的指标。它的含义是:一个节点位于其他节点对之间最短路径上的次数。

更具体地说,betweenness centrality衡量的是某个节点作为中介者或者桥梁在连接其他节点对之间所扮演的重要程度。具有高betweenness centrality的节点,意味着它在网络中处于连接其他节点的关键地位。

计算一个节点v的betweenness centrality的公式为:

$$C_B(v) = \sum_{s \neq v \neq t \in V} \frac{\sigma_{st}(v)}{\sigma_{st}}$$

其中:

- V是图中所有节点的集合
- $\sigma_{st}$是从节点s到节点t的最短路径的数量
- $\sigma_{st}(v)$是从s到t的最短路径中经过节点v的路径数量 （$d_G​(s,t)$ 表示从节点$s$ 到$t$ 的最短路径的距离。有且只有$d_G(s,t)=d_G(s,v)+d_G(v,t)$成立时，我们才认为有一个节点$v$在节点$s$和$t$之间的最短路径上。

计算图的betweenness centrality通常使用[Brandes算法](https://pdodds.w3.uvm.edu/research/papers/others/2001/brandes2001a.pdf)。算法的复杂度是$O(|V||E|)$。
