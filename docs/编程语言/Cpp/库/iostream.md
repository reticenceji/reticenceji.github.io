---
aliases: 
tags: 
date: 2025-08-08
date_modified: 2025-08-08
---

# iostream

虽然我很讨厌C++这与众不同的输入输出风格，但是还是得学习一个。

## 分隔符问题

C++的输入默认是以空格作为分隔符的。也就是说，直接使用`cin`给字符串赋值，只能得到一个单词，空格会被丢弃。

```cpp
#include <iostream>
#include <string>

int main() {
    std::string s;
    std::cin >> s;  // 输入 "Hello World"，s 只会得到 "Hello"
    std::cout << s; // 输出 "Hello"
    return 0;
}
```

可以使用`std::getline`，此时换行符会被丢弃。getline也可以自定义分隔符（第三个参数`delim`）。

```cpp
#include <iostream>
#include <string>

int main() {
    std::string s;
    std::getline(std::cin, s);  // 输入 "Hello World"，s 会得到 "Hello World"
    std::cout << s; // 输出 "Hello World"
    return 0;
}
```
