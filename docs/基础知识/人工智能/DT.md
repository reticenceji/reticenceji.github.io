---
aliases: 
tags: 
date_modified: 2024-12-16
date: 2024-12-02
---

# 梯度提升决策树

## 决策树

决策树（Decision tree）是**基于已知各种情况（特征取值）** 的基础上，通过构建 **树型决策** 结构来进行分析的一种方式，是常用的简单的**有监督**的分类算法。举个例子就可以清楚的说明模型的预测原理：

例如，我们想判断非诚勿扰女嘉宾给男嘉宾的留灯概率。男嘉宾的属性有 高、富、帅。每个属性我们可以简单地定义为“是”或“否”。我们可能会有下面的决策树：

```
是否帅
├── 是
│   ├── 是否富
│   │   ├── 是
│   │   │   ├── 是否高
│   │   │   │   ├── 是: 留灯的概率非常高 (90%)
│   │   │   │   └── 否: 留灯的概率高 (80%)
│   │   │   └── 否
│   │   │       ├── 是: 留灯的概率中等 (50%)
│   │   │       └── 否: 留灯的概率低 (30%)
│   │   └── 否
│   │       ├── 是否高
│   │       │   ├── 是: 留灯的概率低 (30%)
│   │       │   └── 否: 留灯的概率非常低 (10%)
│   └── 否
│       ├── 是否富
│       │   ├── 是
│       │   │   ├── 是否高
│       │   │   │   ├── 是: 留灯的概率低 (30%)
│       │   │   │   └── 否: 留灯的概率非常低 (10%)
│       │   │   └── 否
│       │   │       ├── 是: 留灯的概率非常低 (10%)
│       │   │       └── 否: 留灯的概率极低 (5%)
│       │   └── 否
│       │       ├── 是否高
│       │       │   ├── 是: 留灯的概率非常低 (10%)
│       │       │   └── 否: 留灯的概率极低 (5%)
```

这个例子就是一个典型用决策树解决回归问题。如果最后判断的结果是留灯与否，就是分类问题。**决策树既可以用来解决回归问题，又可以用来解决分类问题**。当然，这个例子过于简单了。

## CART 分类和回归树

CART：假设决策树是**二叉**树，内部结点特征的取值为「是」和「否」，右分支是取值为「是」的分支，左分支是取值为「否」的分支。这样的决策树等价于「递归地二分每个特征」，将输入空间（特征空间）划分为有限个单元，并在这些单元上确定预测的概率分布，也就是在输入给定的条件下输出的条件概率分布。（上面的例子就是一个最简单的CART）

对于上面的例子，我们不难想到模型的训练方式：

将特征空间（高，富，帅）分成8块，每一块都有一堆男嘉宾以及其是否留灯成功（0,1）。我们要做的就是求每一块留灯成功几率的平均值。

一般的，特征空间的每一个维度不一定是可数的（例如，“高” 其实可以具体为 187 cm ...），留灯成功也可以是留灯数量。但是总体思路差不多，将特征空间分成$J$份（$R_1,R_2...R_j$），每一份给出的预测结果是相同的，可以用留灯数量的平均值。

对于回归问题，损失函数可以使用[统计](统计.md)中介绍的**均方差**，对于分类问题，损失函数可以使用[统计](统计.md)中介绍的**基尼系数**。但是CART算法一般都用来做分类问题。

> [!NOTE]
> 网络上很多文章一边用基尼系数作为损失函数，后面又在求解均方差的最优化问题。看的人云里雾里。

如何让损失函数最小？很容易想到的就是有X个男嘉宾就将空间分成X份，损失函数就是0了。所以决策树很容易过拟合，在解决最优化问题之后，后续还有剪枝步骤。这里不做介绍。

另外，决策树的**参数个数（即树到底用几个中间节点分割空间）是不确定的**，所以在求解最优化问题上的方法可能不那么直观。

## Boosting

Boosting 是机器学习中一种集成学习（Ensemble Learning）技术，其核心思想是通过**组合多个较弱的学习器（弱分类器或弱学习算法，称为基模型）来创建一个更强的学习器（强分类器）**。例如，基模型为$y=f(x)$，boosting的模型就是迭代多轮之后相加得到的模型$y=\sum_{m=1}^M f_m(x)$，其中$f_m$就是每一轮训练得到的基模型。

梯度提升（Gradient Boosting）就是以梯度下降的思想为基础，每次迭代都在当前模型的残差方向上构建一个新的弱学习器。不妨让损失函数为均方误差，具体的说

第M轮的损失函数为

$$L(w)=\sum_{i=1}^n (\hat y_i - y_i) ^2 = \sum_{i=1}^n (\hat y_i - \sum_{m=1}^{M-1}f_m(x_i) - f_M(x_i))^2$$

$w$是所有的参数。其中$\hat y_i - \sum_{m=1}^{M-1}f_m(x_i)$即残差，记做$r_i$，那么第M轮的最优化目标就是让下面的公式最小，即预测值接近残差。

$$\sum_{i=1}^n (r_i-f_M(x_i))^2$$

这里是针对损失函数为均方误差的情况。对于更一般的损失函数呢？GBDT规定，**利用损失函数的负梯度在当前模型的值作为残差的近似值**，即

$$r_i \approx-[\frac{\partial L(w)}{\partial f_{M-1}(x)}] $$

## GBDT 梯度提升决策树

梯度提升决策树（Gradient Boosting Decision Tree），是一种迭代的决策树算法，就是之前介绍的 梯度提升+CART决策树 的组合。

Demo：

```python
# Example code for GBDT algorithm
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt

# 1. Generate sample data
def generate_sample_data(n_samples=1000):
    np.random.seed(42)
    X = np.random.rand(n_samples, 3) * 10  # Generate 3 features
    # Create a target variable with a nonlinear relationship
    y = (X[:, 0] ** 2) +100* np.sin(X[:, 1]) +100* np.log(X[:, 2] + 1) + np.random.normal(0, 0.1, n_samples)
    return X, y

# 2. Data preprocessing and splitting
X, y = generate_sample_data()
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Create and train GBDT model
gbdt = GradientBoostingRegressor(
    n_estimators=100,        # Number of decision trees
    learning_rate=0.1,       # Learning rate
    max_depth=3,             # Maximum depth of the tree
    min_samples_split=5,     # Minimum number of samples required to split an internal node
    min_samples_leaf=3,      # Minimum number of samples required to be at a leaf node
    subsample=0.8,           # Fraction of samples used for fitting the individual learners
    random_state=42
)

# Train the model
gbdt.fit(X_train, y_train)

# 4. Model evaluation
y_pred_train = gbdt.predict(X_train)
y_pred_test = gbdt.predict(X_test)

# Calculate evaluation metrics for training and test sets
train_mse = mean_squared_error(y_train, y_pred_train)
test_mse = mean_squared_error(y_test, y_pred_test)
train_r2 = r2_score(y_train, y_pred_train)
test_r2 = r2_score(y_test, y_pred_test)

print(f'Training set MSE: {train_mse:.4f}')
print(f'Test set MSE: {test_mse:.4f}')
print(f'Training set R2: {train_r2:.4f}')
print(f'Test set R2: {test_r2:.4f}')

# 5. Feature importance analysis
feature_importance = pd.DataFrame({
    'Feature': [f'Feature {i+1}' for i in range(X.shape[1])],
    'Importance': gbdt.feature_importances_
})
feature_importance = feature_importance.sort_values('Importance', ascending=False)
print("\nFeature Importance:")
print(feature_importance)

# 6. Plot learning curve
plt.figure(figsize=(10, 5))
plt.subplot(1, 2, 1)
plt.plot(gbdt.train_score_, label='Training set score')
plt.xlabel('Iterations')
plt.ylabel('Loss')
plt.title('Learning Curve')
plt.legend()

# 7. Plot predicted vs actual values
plt.subplot(1, 2, 2)
plt.scatter(y_test, y_pred_test, alpha=0.5)
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
plt.xlabel('Actual values')
plt.ylabel('Predicted values')
plt.title('Predicted vs Actual')
plt.tight_layout()
plt.show()

# 8. Example of model prediction
def predict_example():
    # Generate a new sample
    new_sample = np.array([[5.0, 2.0, 3.0]])
    prediction = gbdt.predict(new_sample)
    print(f'\nPrediction for new sample: {prediction[0]:.4f}')

predict_example()
```

## 缺点和优点

1. **处理非线性问题的能力有限**：决策树通过顺序地检查字段值是否满足某种条件来做决策，这种分割方式**不适合处理具有高度非线性关系的数据**。假设一个长方体有属性长、宽、高，我们想用决策树训练出可以 判断长方体体积是否大于100 cm3 的模型。显然，如果我们使用 长\*宽\*高 这个属性，可以较好解决问题，但是使用长、宽、高三个属性，决策树就无法解决问题。如果问题的影响因素过于复杂，可以使用神经网络。
2. **决策树很容易过拟合**。
3. 决策树有非常好的可解释性。

## 参考链接

- [图解机器学习 | GBDT模型详解](https://www.showmeai.tech/article-detail/193)
- [机器学习 | 详解GBDT梯度提升树原理，看完再也不怕面试了 - Coder梁 - 博客园](https://www.cnblogs.com/techflow/p/13445042.html)
