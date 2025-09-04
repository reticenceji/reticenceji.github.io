---
aliases: 
tags: 
date: 2025-08-10
date_modified: 2025-08-11
---

# 算法题必备 - Python

## 输入输出

如果只有若干个元素，可以使用`input()`方法来获取输入的一行。

如果同质化的元素一行一行的输入并且用空格隔开，可能迭代`stdin`+`split`是更简单的方法。

```python
import sys
for line in sys.stdin:
    a = line.split()
```

输出用`print`，如果复杂一点用format string。

## 排序

Python的`list.sort`是稳定排序，可以通过参数`key`来将list中的每个元素映射之后再比较。例如：

```python
>>> l = ['a', 'B', 'c']
>>> l.sort()
>>> l
['B', 'a', 'c']
>>> l.sort(key=str.lower)
>>> l
['a', 'B', 'c']
```

## 最小堆

Python并没有一个叫堆堆容器。[heapq](https://docs.python.org/zh-cn/3.12/library/heapq.html)是标准库自带的最小堆**算法**。他使用的容器就是Python list，`heap[0]`是最小元素。

和C++类似，我们可以通过重载运算符的方式，把最小堆变成最大堆。修改`__lt__`方法。

```python
class Item:
    def __init__(self, value):
        self.value = value
    
    def __lt__(self, other):
        # 反转比较逻辑：原数的“小”对应取反后的“大”
        return self.value > other.value

# 使用自定义对象的最大堆
heap = []
heapq.heappush(heap, Item(5))
heapq.heappush(heap, Item(8))
print(heapq.heappop(heap).value)  # 输出 8（最大元素）
```

## `eval`

eval可以直接执行字符串，可能会有意想不到的帮助。

## 数组

创建一个一维数组：

```python
>>> [0] * n
[0, 0, 0]
>>> [0 for _ in range(n)]
[0, 0, 0]
```

创建一个二维数组：

```python
>>> [[0 for _ in range(n)] for _ in range(m)]
[[0, 0, 0], [0, 0, 0]]
```

但是用`[[0]*n]*m`是不对的。对list采用乘法是**浅拷贝**列表的每个元素n次。所以如果list的元素是可变的，这样做可能会不符合你的本意。
