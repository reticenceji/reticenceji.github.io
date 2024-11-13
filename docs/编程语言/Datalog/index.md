---
aliases: 
tags: 
date_created: Monday, September 30th 2024, 11:40:49 pm
date_modified: Wednesday, November 13th 2024, 2:15:36 pm
---

# DataLog

DataLog 是**声明式(declarative)** 的编程语言。DataLog 是 Prolog 的子集，DataLog 使用一阶谓词逻辑以 Horn 子句的形式表达计算。DataLog 被广泛的用于 AI/DB/PL。DataLog 并不是图灵完备的，所以虽然 DataLog 被用于程序分析，但是一些高级的算法仍然还是用传统语言实现的。

> DataLog: SQL with recursion / Prolog without complex terms.

[GitHub - souffle-lang/souffle](https://github.com/souffle-lang/souffle) 是 DataLog 最好的开源实现。下面介绍语法是 Souffle 的语法（没错，不同引擎使用不同的语法，没有统一标准，这可能也是DataLog发展缓慢的原因）。Z3求解器内部也带了一个DataLog Engine [muZ](https://github.com/AdaCore/z3/tree/master/src/muz)。

CodeQL 也是基于 DataLog 的，他是目前 DataLog 在程序分析最成功的应用了。[Gigahorse](https://github.com/nevillegrech/gigahorse-toolchain) 是基于DataLog的Ethereum Binary分析框架。

## Program

简单的理解，DataLog 程序是由一组 **relation** 组成的。所谓 relation 可以认为就是数据的有序对。

> relation is a set of ordered tuples (x1, …, xk) where each element xi is a member of a data domain defined by a type.

那么我们如何告诉程序哪些数据具有relation呢？有2种方式。fact和rule。fact是无条件成立的relation，rule提供了relation成立的推导规则，souffle引擎会据此推导出所有成立的relation。  

可以看一个简单的例子，有向图的可达性分析。

```DataLog

.decl edge(n: symbol, m: symbol)
edge("a", "b"). /* facts of edge */
edge("b", "c").
edge("c", "b").
edge("c", "d").

.decl reachable (n: symbol, m: symbol)
.output reachable // output relation reachable

reachable(x, y):- edge(x, y). // base rule
reachable(x, z):- edge(x, y), reachable(y, z). // inductive rule
```

- `.decl edge(n: symbol, m: symbol)`声明了一个relation，其中的n,m叫做attribute。需要声明attribute的类型。
- `edge("a","b")`就是 fact ，表示存在`a->b`的边。通过4个fact，描述了一个存在的图。
    - 所以也可以把 fact 看作是 数据库。
- `reachable(n,m):- edge(x,y)`就是 rule，满足其条件的`(n,m)`都是可达的。`:-`后面跟着的就是 rule 的条件，要满足所有条件 rule 就成立。
    - 所以也可以把 rules 看作是 查询语句。
- `.output`可以输出所有成立的relation，默认是输出到`<relation name>.csv`。

注释的语法和C语言相同。以上就是最基本的 DataLog 的全部语法了。显然，对于一个大型程序的构造，这些语法是远远不够的。

## Souffle

### How Relation Store

> 下面的内容可以忽略。

一般我们不考虑souffle在内部如何存储关系，不过事实上我们可以控制，有下面这些选项：

- btree：使用B-Tree存储，这是默认方式。
- brie：类似于trie的存储方式。
- eqrel：如果关系是等价关系，可以指定这种存储形式，会使用并查集来优化。

### Type

Souffle是会检查参数的类型的，这对于大型程序的编写非常重要。基本类型一共有 4 种，以 C 的类型作为参照：

- `symbol`: `char *`
- `number`: `int`
- `unsigned`: `uint`
- `float`: `float`/ `double`

接着我们看更复杂的类型：

- 我们可以定义等价类型，如`.type myNumber = number`。那么他们就是可以互换使用的。这个和Rust中的`type mynumber = isize` 类似。
- 还可以定义子类型，语法为 `.type myEvenNumber &lt;: number`。他和面向对象中的子类类似。
- Union 类型
- Record 类型
- ADT：类似于Rust中的enum。

如果需要做类型转化，有两种做法

- 使用as，他类似于Rust的as，只做类型转化不作值的转化。
- 使用函子`to_number` 、 `to_string` 、 `to_unsigned` 和 `to_float` ，他进行了值的转化。

### Fact

Fact并没有什么好说的，就是像上面的例子一样。  
不过为了分离数据和逻辑，可以将facts存在其他文件用input语句读取。output也是类似的。

```DataLog
.decl A(a: number, b:number)
// 默认从A.facts中读取数据，数据之间使用tab隔开，一行一个fact
.input A  
// 从指定文件读取
.input A(IO=file, filename="path/to/infile", columns="4:7", delimiter=",")
// 从SQLite中读取
.input A(IO=sqlite, dbname="path/to/sqlite3db")
```

### Rule

Rule的书写如上所示。

需要注意的是，Rule的每一个变量都必须 **grounded**，即肯定在规则主体中至少出现一次。举一个稍微复杂的例子，来看看规则主体中如何表示与或非逻辑关系。  

```DataLog
LivesAt(person, building) :-
    Owner(owner, building),   // 逗号是与
    ( person=owner ; Housemate(owner, person) ),  // 分号是或
    !Except(person).   // 叹号是非
```

#### Constrait

constrait 是规则主体中 产生真值和假值 的谓词。可以是原始类型的不等式和等式，并且存在用于匹配和包含的字符串约束。例如：

```Plain Text

A(a,c) :- a > c.
B(a,c) :- a < c.
C(a,c) :- a = c.
D(a,c) :- a != c.
E(a,c) :- a <= c
F(a,c) :- a >= c.

G(a,c) :- contains(a, c).   // a 是 c 的子串
H(a,c) :- match("a.*", c).  // c 满足通配符
```

#### Argument

参数可以是constants, variables, record constructors, ADT constructors, type conversions,aggregators, and invocations to binary/unary operations, and user-defined operations.

例如：Z的参数c在第六行就被定义为cat函数，他和C语言中的`strcat`类似。

```DataLog
.decl Y(a:symbol, b:symbol)
.decl Z(a:symbol, b:symbol, c:symbol)
.output Z
Y("a","b").
Y("c","d").
Z(a,b, cat(cat(a,b), a)) :- Y(a,b).
```

#### Aggregate

聚合函数 `min` 、 `max` 、`mean`、 `sum` 和 `count` 在 souffle 中可用。以下是它们在语法上的正确用法：

```DataLog
B(y) :- y = max z : A("A", z).
B(z) :- z = min x+y : { A(x), A(y), C(y) }.
B(s, c) :- W(s), c = count : { C(s, _) }.
B(s, count : { C(s, _) }) :- W(s).
B(n, m) :- A(n, m), B(m, s), 2 * s = 2 * sum s : { A(n, s) } + 2.
C(n) :- D(n), B(n, max p : { A(n, p) }).
```

### Components

有点命名空间的感觉，组织大型程序时可以用它来进行程序的模块化。

### User Defined Functions

允许用户自定义函数可以大大的方便规则的书写。Souffle允许用户使用C/C++来编写函数，编译成动态库`libfunctors.so`之后在souffle运行时链接。下面以一个Demo为例，介绍如何编写User Defined Functions。

我们编写了两个简单的C++函数：

```cpp
#include <cstdint>
extern "C" {
  int32_t f(int32_t x) {
      return x + 1;
  }
  const char *g() {
      return "Hello world";
  }
}
```

然后使用下面的命令进行编译，一般我们编译为libfunctors.so。

```sh
g++ functors.cpp -c -fPIC -o functors.o
g++ -shared -o libfunctors.so functors.o
```

之后我们需要指定链接库地址

```sh
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:+$LD_LIBRARY_PATH:}`pwd`
```

接着我们就可以在DataLog文件中使用这些函数了。首先需要声明`@&lt;name&gt;(&lt;arg1&gt;,...,&lt;argk&gt;)`，之后使用`@name(&lt;arg1&gt;,...,&lt;argk&gt;)`对函数进行调用。

```DataLog
// introduce new functor f: number -> number
.functor f(x:number):number

.decl A(x:number)
.output A
A(1).
A(@f(i)) :- A(i), @f(i) < 100.
```

[https://github.com/plast-lab/souffle-addon](https://github.com/plast-lab/souffle-addon)这个仓库提供了对256 bits数字运算的支持，是一个很好的例子。

---

参考链接：

- [https://souffle-lang.github.io/tutorial](https://souffle-lang.github.io/tutorial)
- [https://souffle-lang.github.io/program#rules](https://souffle-lang.github.io/program#rules)
