---
aliases: 
tags: 
date_modified: 2025-01-09
date: 2024-11-30
---

# GUI

## Design Pattern

了解GUI设计模式，可以指导我们使用GUI Framework，编写GUI 程序。

### MVC (Model-View-Controller)

- **Model（模型）** - 模型代表一个存取数据的对象。它也可以带有逻辑，在数据变化时更新控制器。
- **View（视图）** - 视图代表模型包含的数据的可视化。
- **Controller（控制器）** - 控制器作用于模型和视图上。它控制数据流向模型对象，并在数据变化时更新视图。它使视图与模型分离开。

![](../../static/Pasted%20image%2020240418130845.png)

MVC模式的具体解释各种各样。其中一个解释是：

1. Controller 负责管理 View 和 Model； （Controller write View & Model）
2. View 负责展示 Model 中的内容； （View read Model）

这其中隐含了一个问题。如果Model改变了， 如何通知View相应的更新？View不断的轮询Model肯定是一种最直接的办法，另一种办法是使用观察者模式，让观察者改变推送给View。

### MVP (Model-View-Presenter)

MVP 架构模式是 MVC 的一个变种。Presenter 可以理解为松散的控制器，其中包含了视图的 UI 业务逻辑，所有从视图发出的事件，都会通过代理给 Presenter 进行处理；同时，Presenter 也通过视图暴露的接口与其进行通信。

![](../../static/Pasted%20image%2020240418130826.png)

1. 当视图接收到来自用户的事件时，会将事件转交给 Presenter 进行处理；
2. 被动的视图向外界暴露接口，当需要更新视图时 Presenter 通过视图暴露的接口更新视图的内容；
3. Presenter 负责对模型进行操作和更新，在需要时取出其中存储的信息；
4. 当模型层改变时，可以将改变的信息发送给**观察者** Presenter；

### MVVM (Model-View-ViewModel) 🌟

![](../../static/Pasted%20image%2020240418131137.png)

在较高级别上，View “知道” ViewModel，ViewModel “知道” Model，但 Model 不知道 ViewModel，ViewModel 不知道 View。因此，ViewModel 将 View 与 Model 隔离开来，并允许 Model 独立于 View 而演化。

## Practice

介绍一个**简单，有可视化界面绘制工具，跨平台，打包方便**的GUI框架[FLTK](https://www.fltk.org/)，[FLUID](https://www.fltk.org/doc-1.3/fluid.html)是它的前端设计工具。
