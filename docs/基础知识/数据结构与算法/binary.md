---
aliases: 
tags: 
date: 2025-02-19
date_modified: 2025-02-19
---

# 二分查找

**二分查找**（Binary Search）是一种在**有序数组**中快速查找特定元素的高效算法。其核心思想是通过不断缩小搜索范围，将时间复杂度降至 **O(log n)**。

- **初始化**：定义左右指针 `left` 和 `right`，分别指向数组的首尾元素。
- **循环缩小范围**：
    - 计算中间位置 `mid`。
    - 若中间元素等于目标值，直接返回索引。
    - 若中间元素小于目标值，说明目标在右半部分，调整 `left`。
    - 若中间元素大于目标值，说明目标在左半部分，调整 `right`。
- **终止条件**：当 `left > right` 时，表示未找到目标，返回 `-1`。

尽管二分查找思路简单清晰，但是也是挺容易出错的。下面是示例代码，返回一个`int`数组`nums`中，等于`target`的**某**一个元素的索引。

```c
int binarySearch(int* nums, int size, int target) {
    int left = 0;
    // right=size-1, 说明查找的范围是[left, right]的左闭右闭区间。
    int right = size - 1;
    while (left <= right) {
        // NOTICE: 可以防止溢出
        int mid = left + (right - left) / 2; 
        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}
```

如果想要等于`target`的第一个元素/最后一个元素怎么办？这就是[34. 在排序数组中查找元素的第一个和最后一个位置 - 力扣（LeetCode）](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array)。思路也很简单：

1. （找第一个）如果找到相等的元素，那么继续搜索的范围是`[left, mid]`。（找最后一个）搜索范围则是`[mid, right]`。不断的缩小搜索范围直到`left == right == mid`。为了保证范围可以得到缩小，注意mid的取整方向。

```cpp
class Solution {
public:
  int bs(int *nums, int target, int left, int right, bool start) {
    while (left <= right) {
        int mid;
        if (start) 
            mid = left + (right - left) / 2;
        else 
            mid = left + (right - left + 1) / 2;
      if (target == nums[mid]) {
        if (start)
          right = mid;
        else
          left = mid;

        if (left == right) {
          return right;
        }
      } else if (target > nums[mid]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return -1;
  }
  vector<int> searchRange(vector<int> &nums, int target) {
    return {bs(nums.data(), target, 0, nums.size() - 1, true),
            bs(nums.data(), target, 0, nums.size() - 1, false)};
  }
};
```
