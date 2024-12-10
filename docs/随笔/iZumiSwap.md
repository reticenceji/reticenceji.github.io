---
aliases: 
tags:
  - defi
date_created: Monday, December 9th 2024, 7:36:23 pm
date_modified: Tuesday, December 10th 2024, 2:53:43 pm
---

# iZumiswap 精度问题探究

```solidity
...
    ret.locPt = ret.locPt - 1;
    ret.sqrtLoc_96 = LogPowMath.getSqrtPrice(ret.locPt);
    
    uint160 sqrtLocA1_96 = uint160(
        uint256(ret.sqrtLoc_96) +
        uint256(ret.sqrtLoc_96) * (uint256(rg.sqrtRate_96) - TwoPower.Pow96) / TwoPower.Pow96
    );
    ret.acquireY = AmountMath.getAmountY(rg.liquidity, sqrtLocA1_96, rg.sqrtPriceR_96, rg.sqrtRate_96, false);
...
```

[iZiSwap-core/contracts/libraries/SwapMathX2Y.sol at main · izumiFinance/iZiSwap-core · GitHub](https://github.com/izumiFinance/iZiSwap-core/blob/main/contracts/libraries/SwapMathX2Y.sol#L151) 代码此处有点奇怪，为什么不是直接使用`getSqrtPrice(ret.locPt)`，而是`ret.locPt - 1`之后再加上中间的差（`sqrtLocA1_96`）？其实这是为了防止溢出。

记$d = \sqrt{1.0001}^2, p_x = [ d^x \times 2^{96} ]$，这个公式就是`getSqrtPrice`，他向某一个方向取整。在某个Tick $[l,r)$ 添加流动性的时候（假设全是Y），Y的数量为：

$$Y = \lceil \frac {p_r - p_l}{p-2^{96}} \rceil \times liquidity$$

对于这些流动性，如果在区间内先`x2YRangeComplete`再 `x2YAtPriceLiquidity`呢？首先使用非常符合直觉的方式：

$$Y'= (\lfloor \frac{p_{r}-p_{l+1}}{p-2^{96}} \rfloor + \lfloor \frac{p_{l}}{2^{96}} \rfloor )\times liquidity$$

你可以证明$Y' \leq Y$吗，不可以。因为$p_x 和 \lfloor \frac{p_{x-1}\times p_1}{2^{96}} \rfloor$大小关系不确定。 

如果使用函数给的略奇怪的公式则是：

$$Y'= (\lfloor \frac{p_{r}-(p_{l}+ \lfloor \frac{p_l(p(1)-2^{96})}{2^{96}} \rfloor)}{p-2^{96}} \rfloor + \lfloor \frac{p_{l}}{2^{96}} \rfloor )\times liquidity$$

将公式通分，很容易证明$Y' \leq Y$，**这保证了Swap的过程换出的Y不会大于流动性添加时添加的Y，从而在移除流动性的时候不会出现下溢**。
