---
aliases: 
tags: 
date: 2025-01-10
date_modified: 2025-01-10
---

# 二叉搜索树

二叉搜索树在二叉树的基础上又满足，对于任意一个节点：

- 若它的左子树不为空，左子树上所有节点的值都小于它的值。
- 若它的右子树不为空，右子树上所有的节点的值都大于它的值。

它的左、右子树也都是二分搜索树。

## 增删查改

二叉查找树的增删改查都非常简单。只要知道查就行，查的过程就是不断的和节点进行比较，如果查的值<节点的值就往节点的左子树查（没有左子树就查不到），查的值>节点的值就往节点的右子树查（没有右子树就查不到），查的值=节点的值就找到了。增就是查 + 增加一个节点，删就是查 + 删除这个节点。不过增删需要修改父节点包含的指针，这个实现的时候注意一下就行。

时间复杂度平均 O(logN)O(logN)，最差 O(N)O(N)。最差情况这个树被你建成了一个链表。

ADT：查找和插入都不难，但是删除要考虑三种情况：

- 0 度节点：Reset its parent link to NULL.很简单，删了就好。
- 1 度节点：Replace the node by its single child.也比较简单，把它的孩子当作它。
- 2 度节点：Replace the node by **the largest one in its left subtree** or **the smallest one in its right subtree**. Then Delete the replacing node from the subtree.
- 另一个办法是 Lazy deletion，标记为删除但不从树中移除。

```c
//==================查找=====================================
Tree find(Elementtype x,Tree t)
{
    if (t==NULL) return NULL;	//找不到
    if (x<t->Value)
        return find(t->left);	//所有比当前节点小的节点都在左子树
    else if (x> t->Value)
        return find(t->right);	//所有比当前节点大的节点都在右子树
    else
        return t;	//找到了
}//时间复杂度O(depth)，和深度密切相关，尾递归tail recursion
Tree find(Elementtype x,Tree T)
{
    while (T)
    {
        if (x==T->Value) return T;
        if (x < T->Value) T=T->left;
        else T=T->right;
    }
    return NULL;
s}//时间复杂度O(depth),和深度密切相关
Tree findMin(Tree T)
{
    if (T==NULL) return NULL;
    while (T->left) T=T->left;
    return T;
}//findMax同理
//==================插入=====================================
Tree insert(Elementtype v,Tree t)
{
    if (t==NULL){
        t = malloc(sizeof(struct treenode));
        if (t==NULL)
            ERROR();
        else{
            t->element = v;
            t->left = t->right = NULL;
        }
    }//创建一个节点
    else if (v < t->value)
        t->left = insert(v,t->left);
    else if (v > t->value)
        t->right = insert(x,t->right);
    //else，说明和现在的节点相同了，在这里我们什么都没有做。我们也可以记个数。
    return t;//不要忘了这个
}
//==================删除=====================================
Tree delete(Elementtype x,Tree t)
{
    
}//我们也可以通过给计数器-1来表示删除
```

## 红黑树

在极端情况下，一颗二叉树是会退化成链表的。为了保持高效的搜索效率，让一个树尽可能的平衡是最好的。所有有了**AVL树、红黑树**等数据结构。

红黑树常被用于创建Ordered Map容器。相比于哈希表，红黑树的增删查改时间效率较低（$O(log n)$ vs $O(1)$）但是仍然高效，节约空间并且支持顺序遍历。C++标准库的[`std::map`](https://en.cppreference.com/w/cpp/container/map)就是使用红黑树实现的。
