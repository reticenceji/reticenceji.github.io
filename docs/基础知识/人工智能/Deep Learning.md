---
aliases: 
tags: 
date_created: Monday, September 30th 2024, 11:40:49 pm
date_modified: Wednesday, November 13th 2024, 2:15:37 pm
---

# Deep Learning

## Basic

深度学习（英语：deep learning）是**机器学习**的分支，是一种以人工**神经网络**为架构，对资料进行表征学习的算法。

### 反向传播

感觉就是一个求导的方法，没有什么特别高级的地方。  
<https://zhuanlan.zhihu.com/p/40378224>

Pre-train  
Fine-tune  
Parameter Initialization  
Batch Normalization  
Shortcut Connection

### 损失函数

交叉熵损失（cross-entropy loss）：它是分类问题最常用的损失之一。

## Models

### MLP

### CNN

### FNN

### RNN

### LSTM FRU SimpleRNN

## Pytorch

- 优化器：它的作用是根据模型参数的**梯度**，以一定的更新策略来调整**参数**值，从而不断减小**损失函数**，提高模型的性能。`torch.optim`
- 损失函数：<https://pytorch.org/docs/stable/nn.html#loss-functions>
- 网络：`torch.nn`

Hello world: 线性回归

```python
import numpy as np
import torch
from torch.utils import data
from d2l import torch as d2l
from torch import nn

true_w = torch.tensor([2, -3.4])
true_b = 4.2
features, labels = d2l.synthetic_data(true_w, true_b, 1000)

def load_array(data_arrays, batch_size, is_train=True):  #@save
    """构造一个PyTorch数据迭代器"""
    dataset = data.TensorDataset(*data_arrays)
    return data.DataLoader(dataset, batch_size, shuffle=is_train)

batch_size = 10
data_iter = load_array((features, labels), batch_size)

linear = nn.Linear(2, 1)
linear.weight.data.normal_(0, 0.01)
linear.bias.data.fill_(0)
net = nn.Sequential(linear)

loss = nn.MSELoss()

trainer = torch.optim.SGD(net.parameters(), lr=0.03)

num_epochs = 3
for epoch in range(num_epochs):
    for X,y in data_iter:
        l = loss(net(X), y)
        trainer.zero_grad()
        l.backward()
        trainer.step()
    l = loss(net(features), labels)
    print(f'epoch {epoch + 1}, loss {l:f}')
```
