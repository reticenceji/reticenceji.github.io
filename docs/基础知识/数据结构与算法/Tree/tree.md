---
aliases: 
tags: 
date: 2025-01-10
date_modified: 2025-01-10
---

# 树

**树 Tree** 是很重要的数据结构。在图论中我们定义树是 **无向无环连通图**，不过实际上树有很多等价的定义方式。

树的概念中有很多术语：

- **节点的度**：一个节点含有的子树的个数称为该节点的度；
- **树的度**：一棵树中，最大的节点的度称为树的度；
- **叶节点** 或 **终端节点**：度为零的节点；
- **父亲节点** 或 **父节点**：若一个节点含有子节点，则这个节点称为其子节点的父节点；
- **孩子节点或子节点**：一个节点含有的子树的根节点称为该节点的子节点；
- **兄弟节点**：具有相同父节点的节点互称为兄弟节点；
- 节点的 **层次**：从根开始定义起，根为第 1 层，根的子节点为第 2 层，以此类推；
- 树的 **高度** 或 **深度**：树中节点的最大层次；
- **节点的祖先**：从根到该节点所经分支上的所有节点；
- **子孙**：以某节点为根的子树中任一节点都称为该节点的子孙。
- **森林**：由 m（m>=0）棵互不相交的树的集合称为森林；

树的一种特例 **二叉搜索树 Binary Search Tree** 非常常见且重要。二叉搜索树是满足下列条件的树

1. 每个节点最多含有两个子树
2. 树的节点之间存在顺序关系：若它的左子树不空，则左子树上所有结点的值均小于它的根结点的值； 若它的右子树不空，则右子树上所有结点的值均大于它的根结点的值； 它的左、右子树也分别为二叉搜索树。

二叉查找树中还有一些特殊类型

- **完全二叉树 Complete Binary Tree**：一棵深度为 k 的有 n 个结点的二叉树，对树中的结点按从上至下、从左到右的顺序进行编号，如果编号为 i（1≤i≤n）的结点与满二叉树中编号为 i 的结点在二叉树中的位置相同，则这棵二叉树称为完全二叉树。
- **满二叉树 Full Binary Tree**：深度为 K 并且有 2K−12K−1 个节点的二叉树。这个有另一种解释。
- **平衡二叉树 Balance Tree**：它或者是一颗空树，或它的左子树和右子树的深度之差 (平衡因子) 的绝对值不超过 1，且它的左子树和右子树都是一颗平衡二叉树。

## 遍历

一般的树有两种遍历方式，深度优先和广度优先，深度优先又可以分为先根和后跟。对于二叉搜索树，深度优先遍历又可以分为 **前序 Pre-order**（中左右），**中序 In-order**（左中右）和 **后序 Post-order**（左右中）。

由于一个树的子树同样是一棵树，所以用递归来完成树的遍历是非常自然的想法，实现也非常简单。以[leetcode-94 二叉树的中序遍历](https://leetcode.cn/problems/binary-tree-inorder-traversal/)为例：

```cpp
class Solution {
 public:
  void t(TreeNode* root, std::vector<int>& v) {
    if (root != nullptr) {
      t(root->left, v);
      v.push_back(root->val);
      t(root->right, v);
    }
  }
  std::vector<int> inorderTraversal(TreeNode* root) {
    std::vector<int> result;
    t(root, result);
    return result;
  }
};
```
