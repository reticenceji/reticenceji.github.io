---
aliases: 
tags: 
date: 2025-02-05
date_modified: 2025-02-06
---

# 回溯算法

**回溯法**（Backtracking）是一种通过“试错”来寻找问题解决方案的算法。它常用于解决组合优化问题（如排列、子集、组合、棋盘类问题），核心思想是：**递归地尝试所有可能的选择路径，当发现当前路径无法得到解时，撤销最后一步选择（回溯），尝试其他分支**。

## 核心特点

1. **系统性**：穷举所有可能的分支。
2. **剪枝优化**：提前终止不符合条件的分支（如重复值、越界）。
3. **状态重置**：撤销最后一步选择，恢复到之前的状态。

```python
def backtrack(路径, 选择列表):
    if 满足终止条件:
        保存结果（如将路径添加到全局列表）
        return
    
    for 选择 in 选择列表:
        if 不满足剪枝条件:
            做选择（将选择加入路径）
            backtrack(更新后的路径, 新的选择列表)  # 递归进入下一层
            撤销选择（将选择从路径移除）
```

以[46. 全排列 - 力扣（LeetCode）](https://leetcode.cn/problems/permutations/description/?envType=study-plan-v2&envId=top-100-liked)问题为例。这里的res就是全局结果列表，path对应路径，选择列表就是nums - used。

```python
class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        res = []
        used = [False] * len(nums)  # 记录元素是否被使用过
        
        def backtrack(path):
            if len(path) == len(nums):  # 终止条件：路径长度等于数组长度
                res.append(path.copy())
                return
            
            for i in range(len(nums)):
                if not used[i]:  # 剪枝：跳过已使用的元素
                    used[i] = True      # 做选择
                    path.append(nums[i])
                    backtrack(path)     # 递归进入下一层
                    path.pop()          # 撤销选择
                    used[i] = False
        
        backtrack([])
        return res
```

以[39. 组合总和 - 力扣（LeetCode）](https://leetcode.cn/problems/combination-sum/description/?source=vscode)为例。这道题看起来可以使用动态规划来解决，但是题目求的不是方案数量而是所有组合，动态规划可能导致太高的空间复杂度。下面是回溯的程序，sum用来简化计算，也可以不用这个参数：

```python
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        result = []

        def backtrack(path: List[int], sum: int):
            if sum == target:
                result.append(path.copy())
                return
            for num in candidates:
                if num + sum <= target and (len(path) == 0 or num >= path[-1]):
                    path.append(num)
                    backtrack(path, sum+num)
                    path.pop()

        backtrack([], 0)
        return result
```

## 参考链接

[13.1   回溯算法 - Hello 算法](https://www.hello-algo.com/chapter_backtracking/backtracking_algorithm/#1312)
