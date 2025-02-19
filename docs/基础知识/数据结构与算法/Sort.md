---
aliases: 
tags: 
date: 2025-01-09
date_modified: 2025-01-09
---

# 排序算法

时间复杂度为$O(nlog n)$的排序算法：堆排序，快速排序，希尔排序，归并排序。$n$指的是数组长度。

## 堆排序

查找数组中最小/大元素的时间复杂度为$O(log n)$。也就是建立堆的过程。堆排序就是将这个过程进行$n$次，所以时间复杂度是$O(log n)$。我非常喜欢这个算法，个人认为是最简单的。

## 归并排序

合并两个有序的数组的时间复杂度为$O(n)$。归并排序的思路就是将排序一个数组，变成排序2个有序的子数组的问题，分解到长度为1的数组的时候自然就是有序了。我们要进行$O(log n)$次的分解将数组大小变成1，所以时间复杂度是$O(nlog n)$。

他的一个优点是手写方便。以C++为例：

```cpp
template <typename RandomIt, typename Compare = std::less<>>
void merge_sort(RandomIt first, RandomIt last, Compare cmp = Compare()) {
  auto len = std::distance(first, last);
  if (len <= 1) return;
  auto mid = first + len / 2;
  merge_sort(first, mid, cmp);
  merge_sort(mid, last, cmp);
  std::inplace_merge(first, mid, last, cmp);
}
```

> [!NOTE]
> `std::inplace_merge`的文档说，会尝试使用额外的$O(n)$空间以达到$O(n)$的合并效率，但是如果空间不够也会使用$O(1)$的空间，但是会有$O(n^2)$的时间复杂度。这个函数自己实现也并不困难。

如果对模板不太熟悉，可以看一个特化版本的：

```cpp
void merge(int *first, int *mid, int *last) {
  std::vector<int> tmp;
  tmp.reserve(last - first);
  int *a = first, *b = mid;
  while (a != mid && b != last) {
    if (*a < *b) {
      tmp.push_back(*a);
      a++;
    } else {
      tmp.push_back(*b);
      b++;
    }
  }
  for (; a != mid; a++) {
    tmp.push_back(*a);
  }
  for (; b != last; b++) {
    tmp.push_back(*b);
  }
  for (int i = 0; i < tmp.size(); i++) {
    first[i] = tmp[i];
  }
}

void merge_sort(int *first, int *last) {
  int len = last - first;
  if (len <= 1) return;
  int *mid = first + len / 2;
  merge_sort(first, mid);
  merge_sort(mid, last);
  merge(first, mid, last);
}
```

## 希尔排序和快速排序

这两个算法实现起来复杂一点。挖个坑。

## 桶排序

基于比较的排序算法，时间复杂度$O(nlog n)$就到顶了。但是如果数据的范围较小，可以通过统计数据出现的次数进行排序。
