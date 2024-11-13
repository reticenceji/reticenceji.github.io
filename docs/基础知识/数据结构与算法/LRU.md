---
aliases: 
tags: 
date_created: Monday, September 30th 2024, 11:40:49 pm
date_modified: Wednesday, November 13th 2024, 2:15:37 pm
---

# LRU

**[Least Recently Used (LRU) cache](https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU)** 是一个经典的数据结构。它基于时间局部性（最近访问的数据，在之后应该还会访问）的想法，在Cache满的时候总是淘汰最久没有被访问的数据。

他的编程实践也是简单的。通常只需要一个 **哈希表** + **链表**。哈希表保存 数据和数据对应的链表位置，链表则 暗示了数据的上次访问时间——每次读写数据都把数据移动到链表头，满了则删除链表尾对应的数据。

```cpp
#include <iostream>
#include <unordered_map>

using namespace std;

// 定义模板的双向链表节点
template<typename K, typename V>
struct Node {
    K key;
    V value;
    Node* prev;
    Node* next;
    Node(K k, V v) : key(k), value(v), prev(nullptr), next(nullptr) {}
};

template<typename K, typename V>
class LRUCache {
    int capacity;
    Node<K, V>* head, *tail;
    unordered_map<K, Node<K, V>*> cache;

    void addNode(Node<K, V>* node) {
        node->next = head->next;
        node->prev = head;
        head->next->prev = node;
        head->next = node;
    }

    void removeNode(Node<K, V>* node) {
        Node<K, V>* prev = node->prev;
        Node<K, V>* next = node->next;
        prev->next = next;
        next->prev = prev;
    }

    void moveToHead(Node<K, V>* node) {
        removeNode(node);
        addNode(node);
    }

    Node<K, V>* popTail() {
        Node<K, V>* res = tail->prev;
        removeNode(res);
        return res;
    }

public:
    LRUCache(int capacity) : capacity(capacity) {
        head = new Node<K, V>(K(), V());
        tail = new Node<K, V>(K(), V());
        head->next = tail;
        tail->prev = head;
    }

    ~LRUCache() {
        Node<K, V>* current = head;
        while (current != nullptr) {
            Node<K, V>* next = current->next;
            delete current;
            current = next;
        }
    }

    V get(K key) {
        if (cache.find(key) == cache.end()) return V(); // 返回默认构造的值
        Node<K, V>* node = cache[key];
        moveToHead(node);
        return node->value;
    }

    void put(K key, V value) {
        if (cache.find(key) != cache.end()) {
            Node<K, V>* node = cache[key];
            node->value = value;
            moveToHead(node);
        } else {
            Node<K, V>* newNode = new Node<K, V>(key, value);
            if (cache.size() == capacity) {
                Node<K, V>* tail = popTail();
                cache.erase(tail->key);
                delete tail;
            }
            addNode(newNode);
            cache[key] = newNode;
        }
    }
};

int main() {
    LRUCache<int, string> cache(2);
    cache.put(1, "one");
    cache.put(2, "two");
    cout << cache.get(1) << endl; // 输出 "one"
    cache.put(3, "three"); // 移除键2
    cout << cache.get(2) << endl; // 输出空字符串，因为键2已被移除
    cache.put(4, "four"); // 移除键1
    cout << cache.get(1) << endl; // 输出空字符串，因为键1已被移除
    cout << cache.get(3) << endl; // 输出 "three"
    cout << cache.get(4) << endl; // 输出 "four"
    return 0;
}
```
