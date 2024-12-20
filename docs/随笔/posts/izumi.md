---
aliases: 
tags:
  - defi
date_modified: 2024-12-20
date: 2024-12-10
draft: true
---

# iZumiSwap 精度问题探究

## iZumiSwap 基本原理

iZumiSwap 简单的说就是价格**离散**版的 UniswapV3。所以一些概念和 UniswapV3 是互通的。为了方便讲解，统一一下概念，也就基本搞清楚了二者的区别：

| 概念    | Uniswap V3                                                                                        | iZumiSwap                                                        | 说明                |
| ----- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------- |
| tick  | $price_i=\sqrt{1.0001}^i$                                                                         | 同                                                                | 指离散的价格点，在V3中是价格边界 |
| bin   | $(tick_i, tick_{i+1})$, 在这个价格区间内恒定乘积$L_i^2=(x_i+L_i/\sqrt {price_{i+1}})(y_i+L_i\sqrt{ price_i})$ | $tick_i$，在这个价格上恒定和$L_i=x_i\sqrt {price_i} + y_i/\sqrt {price_i}$ |                   |
| range | `tickSpacing`                                                                                     |                                                                  | 添加，移除流动性的最小单位     |

但是，在实际实现的过程中，并不是逐个bin进行计算的。否则太消耗Gas。基于一个显然的特性：对于当前的$tick_{c}$，可能有X有Y。对于$price_i < price_c$，只有Y，反之只有X。

所以，假设Swap的过程消耗了tick_c, c-1, c-2, c-3, c-4消耗了一部分，并且他们的流动性相同。那么中间c-1到c-3的部分，是可以使用**等比数列求和公式**计算的。也就是说，对于这种情况，是**处理单点流动性-处理范围流动性-处理单点流动**性。

而矛盾就是出现在**处理单点流动性的恒定和公式，与处理范围流动性的等比数列求和公式**。由于矛盾是出现在精度问题上，所以要搞清楚矛盾具体是什么，必须要结合代码。

记$d = \sqrt{1.0001}, p_x = [ d^x \times 2^{96} ]$，这个公式就是`getSqrtPrice`，他向**某一个方向**取整（不重要）。在某几个Tick $[l,r)$ **添加流动性**的时候（假设全是Y），Y的数量为：

$$Y = \lceil \frac {p_r - p_l}{p-2^{96}}  \times liq \rceil$$

对于这些流动性，在Swap的时候其实可以分成两种计算模式。一种是单点的流动性，一种是区域的流动性，分别对应`x2YAtPriceLiquidity`和`x2YRangeComplete`。考虑到实际的代码逻辑，如果在区间内先`x2YRangeComplete`再 `x2YAtPriceLiquidity`呢（就是上面处理c, c-1,c-2,c-3），不妨假设前者swap$[l+1, r)$的区间，后者将$l$上的流动性全部swap完。

首先使用非常符合直觉的方式（Ref-DCL有问题的实现）：（注意下面的不等号在极端情况是可以取等的。在审计以及问题排查的时候，虽然意识到了很可能是精度问题，但是只注意到了下面公式中的取整方向是有利于协议的，所以一开始找不到问题）

$$Y'= (\lfloor \frac{p_{r}-p_{l+1}}{p-2^{96}} \times liq \rfloor + \lfloor \frac{p_{l}}{2^{96}} \times liq \rfloor )  
\leq \lfloor \frac{2^{96}(p_r-p_{l+1}) + p_l(p-2^{96})}{(p-2^{96}) \times 2^{96}} \times liq \rfloor 
= \lfloor \frac{(p_r-p_l) +(\frac{p_l\times p}{2^{96}}-p_{l+1})}{(p-2^{96})} \times liq \rfloor$$

你可以证明$Y' \leq Y$吗，不可以。**因为$p_{x+1} 和 \lfloor \frac{p_{x}\times p}{2^{96}} \rfloor$大小关系不固定**。也就是说最后的值可能会大于$Y$，这就是Ref-DCL线上遇到的Bug。我们再看 iZumiSwap 的实现：

$$Y'
= (\lfloor \frac{p_{r}-(p_{l}+ \lfloor \frac{p_l(p-2^{96})}{2^{96}} \rfloor)}{p-2^{96}} \times liq \rfloor + \lfloor \frac{p_{l}}{2^{96}} \times liq \rfloor ) 
\leq \lfloor \frac{2^{96}(p_r-p_l) - p_l(p-2^{96}) + p_l(p-2^{96})}{(p-2^{96}) \times 2^{96}} \times liq\rfloor 
\leq Y$$

将公式通分，很容易证明$Y' \leq Y$，**这保证了Swap的过程换出的Y不会大于流动性添加时添加的Y，从而在移除流动性的时候不会出现下溢**。

很巧妙不是么，但是实际上还是存在问题。我们说了，下溢更本质的原因是**处理单点流动性（使用了等比数列通项公式）和处理范围流动性（使用了等比数列求和公式）的不兼容导致的。上面的处理方式仅仅考虑了处理单点流动性和处理范围流动性相邻的情况**。假设连续的处理单点流动性，还是可能会溢出，不妨假设仍考虑一个区间上的情况，不妨假设区间上每个人换得都不多，全是用单点流动性的处理公式：

$$Y' = \sum_i^{i \in [l,r)} \lfloor \frac{p_{i}}{2^{96}} \times liq \rfloor $$，考虑他和添加的流动性 

$$Y = \lceil \frac{p_{r}-p_{l}}{p-2^{96}} \times liq \rceil$$

之间的大小关系，结论是 **不一定** ！也就是说**更深层次的原因是$\frac{p_{i+1}-p_{i}}{p-2^{96}}$ 和$\frac{p_{i}}{2^{96}}$之间的大小关系不确定（和之前的公式等价）**。

我认为一个**更加科学**的修改方式是**将处理单点流动性和处理范围流动性的方法统一**。考虑到添加流动性和移除流动性都使用了处理范围流动性的方式，可以将将处理单点流动性的方式修改为处理范围流动性的方法，即相应的修改`x2YAtPriceLiquidity`。一个更加符合工程实践（考虑到当前实现和修改的工作量）的方式是进行saturate sub，即在任何时候（remove liquidity / swap），取计算出的amount和balance的较小值即可。

我是通过测试得到的。那么数学上$p_x$是如何计算的呢？

```rust
pub fn get_sqrt_price(point: i32) -> U256 {
    let abs_idx = if point < 0 {U256::from((-point) as u128)} else {U256::from(point as u128)};
    require!(abs_idx <= U256::from(RIGHT_MOST_POINT), E202_ILLEGAL_POINT);

    let mut value = if !abs_idx.bitand(1u128.into()).is_zero() {
        U256::from_str_radix("0xfffcb933bd6fad37aa2d162d1a594001", 16).unwrap()
    } else {
        U256::from_str_radix("0x100000000000000000000000000000000", 16).unwrap()
    };

    let update_value = |value: &mut U256, hex1: &str, hex2: &str|{
        if !abs_idx.bitand(U256::from_str_radix(hex1, 16).unwrap()).is_zero() {
            value.mul_assign(U256::from_str_radix(hex2, 16).unwrap());
            value.shr_assign(128u8);
        }
    };

    update_value(&mut value, "0x2", "0xfff97272373d413259a46990580e213a");
    update_value(&mut value, "0x4", "0xfff2e50f5f656932ef12357cf3c7fdcc");
    update_value(&mut value, "0x8", "0xffe5caca7e10e4e61c3624eaa0941cd0");
    update_value(&mut value, "0x10", "0xffcb9843d60f6159c9db58835c926644");
    update_value(&mut value, "0x20", "0xff973b41fa98c081472e6896dfb254c0");
    update_value(&mut value, "0x40", "0xff2ea16466c96a3843ec78b326b52861");
    update_value(&mut value, "0x80", "0xfe5dee046a99a2a811c461f1969c3053");
    update_value(&mut value, "0x100", "0xfcbe86c7900a88aedcffc83b479aa3a4");
    update_value(&mut value, "0x200", "0xf987a7253ac413176f2b074cf7815e54");
    update_value(&mut value, "0x400", "0xf3392b0822b70005940c7a398e4b70f3");
    update_value(&mut value, "0x800", "0xe7159475a2c29b7443b29c7fa6e889d9");
    update_value(&mut value, "0x1000", "0xd097f3bdfd2022b8845ad8f792aa5825");
    update_value(&mut value, "0x2000", "0xa9f746462d870fdf8a65dc1f90e061e5");
    update_value(&mut value, "0x4000", "0x70d869a156d2a1b890bb3df62baf32f7");
    update_value(&mut value, "0x8000", "0x31be135f97d08fd981231505542fcfa6");
    update_value(&mut value, "0x10000", "0x9aa508b5b7a84e1c677de54f3e99bc9");
    update_value(&mut value, "0x20000", "0x5d6af8dedb81196699c329225ee604");
    update_value(&mut value, "0x40000", "0x2216e584f5fa1ea926041bedfe98");
    update_value(&mut value, "0x80000", "0x48a170391f7dc42444e8fa2");

    if point > 0 {
        value = U256::MAX / value;
    }

    (value >> 32u8) + if (value % (U256::from(1u128 << 32u8))).is_zero() {0} else {1}
}
```

这里的每一个Magic Number，实际上对应的是$\frac{2^{128}}{\sqrt{1.0001}^i}$，最后计算得到一个定点数。

## 反思：为什么审计的时候没有发现

合约中的计算太过复杂，只关注了**代码中写出的计算**，舍入方向是否对协议是有利的。
但是等比数列求和公式，实际上是**隐含了从点到区域的求和过程公式**，即
$$\sum^n_1 a_i = \frac{a_1(1-q^n)}{1-q}$$
这个公式的舍入方向是否是对协议有利的，被忽略了。

## 从一处奇怪的代码开始

```rust
...
// result.acquire_y = get_amount_y(liquidity, get_sqrt_price(result.loc_pt), sqrt_price_r_96, sqrt_rate_96(), false);
ret.locPt = ret.locPt - 1;
ret.sqrtLoc_96 = LogPowMath.getSqrtPrice(ret.locPt);

uint160 sqrtLocA1_96 = uint160(
    uint256(ret.sqrtLoc_96) +
    uint256(ret.sqrtLoc_96) * (uint256(rg.sqrtRate_96) - TwoPower.Pow96) / TwoPower.Pow96
);
...
```

代码此处有点奇怪，为什么不是直接使用`getSqrtPrice(ret.locPt)`，而是通过`ret.locPt - 1`算出一个**貌似**和`getSqrtPrice(ret.locPt)`相等的`sqrtLocA1_96`？其实这是为了防止溢出。

记$d = \sqrt{1.0001}, p_x = [ d^x \times 2^{96} ]$，这个公式就是`getSqrtPrice`，他向**某一个方向**取整（不重要）。在某个Tick $[l,r)$ 添加流动性的时候（假设全是Y），Y的数量为：

$$Y = \lceil \frac {p_r - p_l}{p-2^{96}}  \times liq \rceil$$

对于这些流动性，在Swap的时候其实可以分成两种计算模式。一种是单点的流动性，一种是区域的流动性，分别对应`x2YAtPriceLiquidity`和`x2YRangeComplete`。考虑到实际的代码逻辑，如果在区间内先`x2YRangeComplete`再 `x2YAtPriceLiquidity`呢，不妨假设前者swap$[l+1, r)$的区间，后者将$l$上的流动性全部swap完。

首先使用非常符合直觉的方式（当前的实现）：

$$Y'= (\lfloor \frac{p_{r}-p_{l+1}}{p-2^{96}} \times liq \rfloor + \lfloor \frac{p_{l}}{2^{96}} \times liq \rfloor )  
\leq \lfloor \frac{2^{96}(p_r-p_{l+1}) + p_l(p-2^{96})}{(p-2^{96}) \times 2^{96}} \times liq \rfloor 
= \lfloor \frac{(p_r-p_l) +(\frac{p_l\times p}{2^{96}}-p_{l+1})}{(p-2^{96})} \times liq \rfloor$$

你可以证明$Y' \leq Y$吗，不可以。**因为$p_{x+1} 和 \lfloor \frac{p_{x}\times p}{2^{96}} \rfloor$大小关系不固定**。也就是说最后的值可能会大于$Y$。

如果使用修改后的略奇怪的公式则是：

$$Y'
= (\lfloor \frac{p_{r}-(p_{l}+ \lfloor \frac{p_l(p-2^{96})}{2^{96}} \rfloor)}{p-2^{96}} \times liq \rfloor + \lfloor \frac{p_{l}}{2^{96}} \times liq \rfloor ) 
\leq \lfloor \frac{2^{96}(p_r-p_l) - p_l(p-2^{96}) + p_l(p-2^{96})}{(p-2^{96}) \times 2^{96}} \times liq\rfloor 
\leq Y$$

将公式通分，很容易证明$Y' \leq Y$，**这保证了Swap的过程换出的Y不会大于流动性添加时添加的Y，从而在移除流动性的时候不会出现下溢**。


## 并没有解决问题

很巧妙不是么，但是实际上还是存在问题。下溢更本质的原因是**处理单点流动性（使用了等比数列通项公式）和处理范围流动性（使用了等比数列求和公式）的不兼容导致的。上面的处理方式仅仅考虑了处理单点流动性和处理范围流动性相邻的情况**。假设连续的处理单点流动性，还是可能会溢出，不妨假设仍考虑一个区间上的情况：

$$Y' = \sum_i^{i \in [l,r)} \lfloor \frac{p_{i}}{2^{96}} \times liq \rfloor $$，考虑他和 

$$Y = \lfloor \frac{p_{r}-p_{l}}{p-2^{96}} \times liq \rfloor$$

之间的大小关系，结论是 **不一定** ！一个更加科学的修改方式是**将处理单点流动性和处理范围流动性的方法统一**。考虑到添加流动性和移除流动性都使用了处理范围流动性的方式，可以将将处理单点流动性的方式修改为处理范围流动性的方法，即相应的修改`x2YAtPriceLiquidity`。

## 还有别的问题

那么 Y Swap X 是否会有类似的问题呢？答案是肯定的。要想彻底规避这个问题，还是要将处理单点流动性和处理范围流动性的方法统一。

事实上，最简单的处理办法就是忽略这些精度损失。在任何时候（remove liquidity / swap），取计算出的amount和balance的较小值即可。

## 参考链接

1. [uniswap v3 中的tick管理\_uniswap tick-CSDN博客](https://blog.csdn.net/gambool/article/details/129087906)
