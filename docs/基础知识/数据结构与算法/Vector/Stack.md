---
aliases: 
tags: 
date: 2025-02-12
date_modified: 2025-02-12
---

# 栈

## 单调栈

**单调栈（Monotone Stack）**：一种特殊的栈。在栈的「先进后出」规则基础上，要求「从 **栈顶** 到 **栈底** 的元素是单调递增（或者单调递减）」。其中满足从栈顶到栈底的元素是单调递增的栈，叫做「单调递增栈」。满足从栈顶到栈底的元素是单调递减的栈，叫做「单调递减栈」。**单调栈可以在时间复杂度为 $O(n)$ 的情况下，求解出某个元素左边或者右边第一个比它大或者小的元素**。

```python
def monotoneIncreasingStack(nums):
    stack = []
    for num in nums:
        while stack and num >= stack[-1]:
            # num 就是第一个比 stack[-1] 大的元素
            stack.pop()
        stack.append(num)
    # 执行完成后，stack可能会剩下一些元素，这些元素后面没有更大的了，根据需求进一步处理
```

[739. 每日温度 - 力扣（LeetCode）](https://leetcode.cn/problems/daily-temperatures/description/?envType=study-plan-v2&envId=top-100-liked) 是一个很典型的使用单调栈求解的例子。

```cpp
using namespace std;
class Solution {
public:
  vector<int> dailyTemperatures(vector<int> &temperatures) {
    std::vector<pair<int, int>> stack; // temp, index
    std::vector<int> result(temperatures.size(), 0);
    for (int i = 0; i < temperatures.size(); i++) {
      while (!stack.empty() && stack.back().first < temperatures[i]) {
        int index = stack.back().second;
        result[index] = i - index;
        stack.pop_back();  // 核心代码
      }
      stack.push_back(std::make_pair(temperatures[i], i));
    }
    return result;
  }
};
```
