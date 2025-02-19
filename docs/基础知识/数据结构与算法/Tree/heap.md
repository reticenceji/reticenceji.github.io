---
aliases: 
tags: 
date: 2025-01-13
date_modified: 2025-01-13
---

# 堆

**堆**是一棵**树**：其每个节点都有一个键值，且每个节点的键值都大于等于/小于等于其父亲的键值，分别叫做最小堆/最大堆。

一般来说，我们在说到堆的时候往往指的是**二叉堆**：它是一颗完全二叉树形成的堆。下面是一个简易的实现：

```cpp
// 这个过程也叫 heapify
void sink(vector<int> &nums, int i) {
  int size = nums.size();
  int largest = i;
  int left = 2 * i + 1;
  int right = 2 * i + 2;
  if (left < size && nums[left] > nums[largest]) {
    largest = left;
  }

  if (right < size && nums[right] > nums[largest]) {
    largest = right;
  }

  if (largest != i) {
    std::swap(nums[i], nums[largest]);
    sink(nums, largest);
  }
}

void make_heap(vector<int> &nums) {
  for (int i = nums.size() / 2 - 1; i >= 0; i--)
    sink(nums, i);
}

int pop_heap(vector<int> &nums) {
  int result = nums[0];
  nums[0] = nums.back();
  nums.pop_back();
  sink(nums, 0);
  return result;
}

void push_heap(vector<int> &nums, int num) {
  nums.push_back(num);
  int index = nums.size() - 1;
  while (index > 0) {
    int parent = (index - 1) / 2;
    if (nums[index] > nums[parent]) {
      std::swap(nums[index], nums[parent]);
      index = parent;
    } else {
      break;
    }
  }
}
```

- 由于堆是完全二叉树，所以用数组来实现他是很合适的，不会浪费空间。
- 下沉操作（`sink`）：如果当前节点的值小于其子节点的值，则将其与最大的子节点交换，并递归地继续下沉操作。时间复杂度为$O(log (n))$。
- 将一个无序数组创建成堆：从最后一个非叶子节点开始，对每个节点应用下沉操作（Sink），以确保子树满足最大堆的属性。时间复杂度为$O(n)$，后面解释。
- 向堆中插入元素：将元素放在最后一个节点，进行“提升操作”，如果当前节点的值大于其父节点的值，则将其与父节点进行交换，并递归的继续提升操作。时间复杂度同下沉操作，$O(log (n))$。
- 弹出堆的最大值：最大值就是堆顶/树根。将它与最后一个节点交换，然后对树根进行下沉操作。时间复杂度为$O(log (n))$。

尽管`sink`操作的时间复杂度是$O(log(n))$，而建堆要进行$n/2$次操作，但是将所有操作放在一起综合考虑，按照层进行考虑。第k层有$2^k$个元素，sink操作的时间复杂度是$O(k)$

$$T = \sum_{k=1}^{log (n)} 2^kk$$ 可以使用错位相减法（等差乘等比，死去的高中记忆开始攻击我）求得$O(T) = O(n)$。

还看到了另一个巧妙的证明[堆排序中建堆过程时间复杂度O(n)怎么来的？ - 工厂方法的回答 - 知乎](https://www.zhihu.com/question/20729324/answer/132711265)。

## 参考链接

- [二叉堆 - OI Wiki](https://oi-wiki.org/ds/binary-heap/)
