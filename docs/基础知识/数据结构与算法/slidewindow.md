---
aliases: 
tags: 
date: 2025-01-03
date_modified: 2025-01-03
---

# 滑动窗口算法

每次遇到滑动窗口的算法题都写不出来或者不能用最好的方式写出来。这里总结一下。

从做题的技巧来说，**滑动窗口算法技巧主要用来解决子数组问题，比如让你寻找符合某个条件的最长/最短子数组**。如果要枚举所有的子数组，时间复杂度为$O(n^2)$，无论是枚举起始点+终止点，还是枚举长度+起始点。

```cpp
// 枚举起始点+终止点
for (int i=0; i<n; i++) {
    for (int j=i+1; j<n; j++) {
        // v[i,j)
    }
}
// 枚举长度+起始点
for (int l=1; l<n; l++) {
    for (int i=0; i<n-l; i++) {
        // v[i, i+l)
    }
}
```

如果使用滑动窗口逻辑，来寻找最短子串则是：

```cpp
// 最长，子串为[l,r)
int l=0; r=0;
while (r<n) {
    while (!ok(window)) {
        window.pop(v[l]);
        l++;
    }
    window.push(v[r]);
    r++;
    if (ok(window)) {
        update_best(l,r);
    }
}
// 最短，子串为[l,r)
int l=0, r=0;
while (r<n) {
    window.push(v[r]);
    r++;
    while (ok(window)) {
        update_best(l,r);
        window.pop(v[l]);
        l++;
    }
}
```

滑动窗口并不能枚举出所有的子串，但是一些题目**可能并不需要穷举所有子串，就能找到题目想要的答案**。滑动窗口的本质其实是**贪心**。例如题目要求寻找最短子串：

1. 对于一个确定的`l`，如果`[l,r)`已经满足条件，那么我们就不需要再枚举`[l,r+x)`了。
2. 对于一个确定的`r`，如果`[l,r)`满足条件，我们还可以试一试`[l+x,r)`。

## 参考链接

- [双指针技巧秒杀七道数组题目 | labuladong 的算法笔记](https://labuladong.online/algo/essential-technique/array-two-pointers-summary/)
- [滑动窗口？套路而已 | 极简教学](https://zhuanlan.zhihu.com/p/411174044)
