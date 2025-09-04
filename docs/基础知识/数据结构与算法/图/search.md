---
aliases: 
tags: 
date: 2025-02-05
date_modified: 2025-02-05
---

# DFS/BFS

**深度优先搜索（Deep First Search, DFS）** 算法和**广度优先搜索（Breadth First Search, BFS）** 算法都是基于 **图** 这种数据结构。除了DFS和BFS，还有A\*、IDA\* 等启发式搜索算法。所以我们又将DFS和BFS称为暴力搜素算法。

DFS一般借助栈来实现，通常使用递归。他沿着一条路径搜索，直到失败后借助栈回退。BFS一般借助队列实现，通常使用循环，按照层级遍历，在解决**最短路径问题**上通常很好用。

以[994. 腐烂的橘子 - 力扣（LeetCode）](https://leetcode.cn/problems/rotting-oranges/description/)为例：我要找的其实就是每个新鲜橘子离腐烂橘子的最短路。最后再取所有最短路的最大值。

由于要求最短路，很容易想到使用BFS，这里贴一下官方题解。

```rust
use std::collections::{VecDeque, HashMap};

impl Solution {
    pub fn oranges_rotting(grid: Vec<Vec<i32>>) -> i32 {
        let mut grid = grid.clone();
        let (R, C) = (grid.len(), grid[0].len());
        const dr: [i32; 4] = [-1, 0, 1, 0];
        const dc: [i32; 4] = [0, -1, 0, 1];
        let mut queue = VecDeque::new();
        let mut depth = HashMap::new();
        
        for r in 0..R {
            for c in 0..C {
                if grid[r][c] == 2 {
                    let code = r * C + c;
                    queue.push_back(code);
                    depth.insert(code, 0);
                }
            }
        }
        
        let mut ans = 0;
        while let Some(code) = queue.pop_front() {
            let r = code / C;
            let c = code % C;
            for k in 0..4 {
                let nr = r + dr[k] as usize;
                let nc = c + dc[k] as usize;
                if 0 <= nr && nr < R && 0 <= nc && nc < C && grid[nr][nc] == 1 {
                    grid[nr][nc] = 2;
                    let ncode = nr * C + nc;
                    queue.push_back(ncode);
                    depth.insert(ncode, *depth.get(&code).unwrap() + 1);
                    ans = *depth.get(&ncode).unwrap();
                }
            }
        }
        
        for row in grid {
            for v in row {
                if v == 1 {
                    return -1;
                }
            }
        }
        ans
    }
}
/*
作者：力扣官方题解
链接：https://leetcode.cn/problems/rotting-oranges/solutions/124765/fu-lan-de-ju-zi-by-leetcode-solution/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
*/
```

深度优先的版本，贴一下自己的题解：[DFS+剪枝](https://leetcode.cn/problems/rotting-oranges/solutions/3064049/dfsjian-zhi-by-reticence-d-cjzt/?envType=study-plan-v2&envId=top-100-liked)。
