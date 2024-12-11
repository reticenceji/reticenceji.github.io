---
aliases: 
tags: 
date_modified: 2024-12-11
date: 2024-12-10
draft: true
---

# iZumiSwap 精度问题探究

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

记$d = \sqrt{1.0001}^2, p_x = [ d^x \times 2^{96} ]$，这个公式就是`getSqrtPrice`，他向**某一个方向**取整（不重要）。在某个Tick $[l,r)$ 添加流动性的时候（假设全是Y），Y的数量为：

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
