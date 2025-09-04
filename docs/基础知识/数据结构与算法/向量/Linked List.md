---
aliases: 
tags: 
date: 2025-01-08
date_modified: 2025-03-09
---

# 链表

链表的特点是通过指针连接其元素，不需要在内存中连续存储。它可以分成：

- **单向链表**：每个节点包含一个数据字段和一个指向链表中下一个节点的指针。
- **双向链表**：每个节点不仅包含指向下一个节点的指针，还包含一个指向前一个节点的指针。
- **循环链表**：单向或双向链表的变体，其中尾部节点的下一个指针指向头部节点，形成一个环。

他的特点是插入和删除的效率高，为O(1)。但是不支持随机访问，必须以O(n)的代价遍历。在大多数情况下，这不是一个非常有用的数据结构，数组往往是一个更好的选择。

## 侵入式链表

值得一提的是链表的侵入式实现方式。链表的链接指针（例如`next`和`prev`指针）被直接嵌入到数据元素中。这意味着数据元素自身包含了链接到其他元素的信息。光看文字描述可能有点迷惑，看一下代码，这是我们熟悉的非侵入式的链表：

```c
struct ListNode {
    void * data;
    struct ListNode *next;
    struct ListNode *prev;
}
```

侵入式链表在Linux内核被广泛使用，大概是下面这个样子（定义在[types.h](https://elixir.bootlin.com/linux/v6.4.10/source/include/linux/types.h#L184)）：

```c
struct list_head {
	struct list_head *next, *prev;
};
struct Data {
    data;
    struct list_head list;
};
```

可以理解为，侵入式链表由数据管理指针，非侵入式链表由链表管理指针。侵入式链表的设计能够减少内存碎片，提高缓存命中率。

## 算法题

在做Leetcode的时候，我发现**双指针和链表反转**几乎是所有链表算法题的基础。

链表反转对于单链表来说确实比较烦人，可以把模板背下来：

```cpp
// 将从[start, end)范围内的链表反转
ListNode *reverse(ListNode *prev, ListNode *start, ListNode *end) {
    ListNode *curr = start;
    while (curr != end) {
        ListNode *next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}
```

- [206. 反转链表 - 力扣（LeetCode）](https://leetcode.cn/problems/reverse-linked-list/): 如果要反转整条链表，就是`reverse(nullptr, head, nullptr)`
## 参考链接

- [list.h - include/linux/list.h - Linux source code v6.4.10 - Bootlin Elixir Cross Referencer](https://elixir.bootlin.com/linux/v6.4.10/source/include/linux/list.h#L14)
- [types.h - include/linux/types.h - Linux source code v6.4.10 - Bootlin Elixir Cross Referencer](https://elixir.bootlin.com/linux/v6.4.10/source/include/linux/types.h#L184)
- [08. Hashtables | Build Your Own Redis with C/C++](https://build-your-own.org/redis/08_hashtables)
