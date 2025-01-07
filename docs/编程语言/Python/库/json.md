---
aliases: 
tags: 
date: 2024-12-20
date_modified: 2024-12-20
---

# JSON

Python的[标准库](https://docs.python.org/zh-cn/3/library/json.html)就支持JSON。

Python 的 dict/list 和 JSON 是一个很好的对应。序列化 `dumps` 和反序列化 `loads` 的参数是字符串，`dump` 和 `load` 的参数是文件。

```python
>>> import json
>>> json.dumps(['foo', {'bar': ('baz', None, 1.0, 2)}])
'["foo", {"bar": ["baz", null, 1.0, 2]}]'
>>> json.loads('["foo", {"bar": ["baz", null, 1.0, 2]}]')
['foo', {'bar': ['baz', None, 1.0, 2]}]
>>> from pathlib import Path
>>> json.load(Path("./a.json").open())   # 如果是一个简单脚本直接这样最简洁，只开不关
>>> json.loads(Path("./a.json").read_text())   # 如果是一个简单脚本直接这样最简洁
```

默认支持以下对象和类型，JSON 的类型都可以在 Python 中有一个很好的对应。

| Python           | JSON   |
| ---------------- | ------ |
| dict             | object |
| list, tuple      | array  |
| str              | string |
| int, float, enum | number |
| True             | true   |
| False            | false  |
| None             | null   |
