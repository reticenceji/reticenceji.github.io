---
aliases: 
tags: 
date: 2024-12-24
date_modified: 2024-12-24
---

# 算法

算法是 C++ 标准库的基础部分。 算法不与容器本身一起使用，而与[**迭代器**](./iterator.md)一起使用。算法主要包含在头文件`<algorithm>`和`<numeric>`中。这些算法广泛覆盖了从排序和搜索到数值计算和数据操作的多种功能。

## 堆

**最大堆**数据结构主要有三个方法：

- `make_heap(begin, end)`：从现有数据创建一个堆。时间复杂度为O(lg n)。
- `push_heap(begin, end)`：添加元素到堆中。需要首先将元素放到迭代器的尾部，再调用这个方法。时间复杂度为O(lg n)。
- `pop_heap(begin, end)`：移除堆顶元素。调用这个方法之后，元素会被放到迭代器的尾部。时间复杂度为O(lg n)。

他们的使用方法并不是那么直观，可以看一个例子：

```cpp
#include <algorithm>
#include <vector>
#include <iostream>
using namespace std;
int main() {
  vector<int> apples = {1, 2, 3, 5, 2};
  make_heap(apples.begin(), apples.end());
  apples.push_back(6);
  push_heap(apples.begin(), apples.end());
  apples.push_back(0);
  push_heap(apples.begin(), apples.end());
  for (int i = 0; i < 7; i++) {
    pop_heap(apples.begin(), apples.end());
    cout << apples.back() << " ";
    apples.pop_back();
  }
  cout << endl;
  // 输出 6 5 3 2 2 1 0
}
```

另外，这是一个最大堆。如果想自定义“更大”的概念（这对自定义数据结构尤其重要），最简单的方法是传入一个**比较器**。例如上面的例子，可以改成下面的最小堆（默认的比较器是`std::less`）：

```cpp
#include <algorithm>
#include <vector>
#include <iostream>
using namespace std;
int main() {
  vector<int> apples = {1, 2, 3, 5, 2};
  make_heap(apples.begin(), apples.end(), std::greater<int>());
  apples.push_back(6);
  push_heap(apples.begin(), apples.end(), std::greater<int>());
  apples.push_back(0);
  push_heap(apples.begin(), apples.end(), std::greater<int>());
  for (int i = 0; i < 7; i++) {
    pop_heap(apples.begin(), apples.end(), std::greater<int>());
    cout << apples.back() << " ";
    apples.pop_back();
  }
  cout << endl;
  // 0 1 2 2 3 5 6
}
```

事实上，标准库提供了`priority_queue`容器，比上面手动维护堆更好。如果使用`priority_queue`修改上面的代码就是

```cpp
#include <queue>
#include <vector>
#include <iostream>
using namespace std;

int main() {
    priority_queue<int, vector<int>, greater<int>> pq ;
    vector<int> apples = {1, 2, 3, 5, 2};
    for (int apple : apples) {
        pq.push(apple);
    }
    pq.push(6);
    pq.push(0);
    while (!pq.empty()) {
        cout << pq.top() << " ";
        pq.pop();
    }
    cout << endl;
    return 0;
}
```

算法库还提供了堆排序算法`sort_heap(begin, end)`

## 排序

```cpp
// 排序
sort(begin, end)                 // 排序
stable_sort(begin, end)          // 稳定排序
partial_sort(begin, middle, end) // 部分排序

// 二分查找
binary_search(begin, end, value) // 二分查找
lower_bound(begin, end, value)   // 找第一个不小于value的位置
upper_bound(begin, end, value)   // 找第一个大于value的位置

merge(begin1, end1, begin2, end2, dest)  // 合并有序序列
```

## 集合

```cpp
// 集合操作
set_union(begin1, end1, begin2, end2, dest)         // 并集
set_intersection(begin1, end1, begin2, end2, dest)   // 交集
set_difference(begin1, end1, begin2, end2, dest)     // 差集
```

## 其他

```cpp
for_each(begin, end, f)          // 对每个元素执行操作
remove(begin, end, value)        // 移除特定值
remove_if(begin, end, pred)      // 按条件移除
replace(begin, end, old_val, new_val) // 替换值
reverse(begin, end)              // 反转序列
rotate(begin, middle, end)       // 旋转序列
shuffle(begin, end, gen)         // 随机打乱

// 复制
copy(begin, end, dest)           // 复制
copy_if(begin, end, dest, pred)  // 按条件复制
copy_n(begin, n, dest)          // 复制n个元素

// 转换和生成
transform(begin, end, dest, op)  // 转换元素
generate(begin, end, gen)        // 生成元素
fill(begin, end, value)         // 填充元素

// 查找和计数
find(begin, end, value)          // 查找元素
find_if(begin, end, pred)        // 按条件查找
count(begin, end, value)         // 计数
count_if(begin, end, pred)       // 按条件计数

// 比较
equal(begin1, end1, begin2)      // 比较两个序列是否相等
mismatch(begin1, end1, begin2)   // 找出第一个不匹配的位置

// 最值
min(a, b)                        // 最小值
max(a, b)                        // 最大值
minmax(a, b)                     // 同时返回最小值和最大值
min_element(begin, end)          // 找最小元素
max_element(begin, end)          // 找最大元素
```
