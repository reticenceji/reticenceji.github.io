---
aliases: 
tags: 
date_modified: 2024-12-11
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

## Framework

### GTK

GTK是老牌GUI框架了，虽然具有跨平台能力，但是主要用在Linux生态。学习GTK的最好方式当然是通过编码，不过还是推荐先花一点时间看一下

- [gtk4-rs-book](https://gtk-rs.org/gtk4-rs/stable/latest/book/widgets.html)
    - [gtk4-rs-template-flatpak](https://gitlab.gnome.org/World/Rust/gtk-rust-template)
- <https://relm4.org/>
    - - [relm4-macros](https://crates.io/crates/relm4-macros) - several macros for declarative UI definitions.
    - [relm4-components](https://crates.io/crates/relm4-components) - a collections of reusable components.
    - [relm4-icons](https://crates.io/crates/relm4-icons) - icons for your application.
    - [relm4-template](https://github.com/Relm4/relm4-template) - a starter template for creating Relm4 applications in the Flatpak package format.
    - [relm4-snippets](https://github.com/Relm4/vscode-relm4-snippets) - code snippets to speed up your development.

### Kivy

如果你需要一个足够**简单**的，**跨平台**的GUI框架，并且使用**主流编程语言**，那么Python的kivy会是一个不错的选择。

按照我的个人理解，Kivy的架构借用了MVC模式的思想：

1. 分离的视图描述：Kivy使用 **.kv语言** 来描述用户界面，这类似于MVC中的 **View** 。.kv文件定义了界面的结构和样式，类似于HTML和CSS的组合。
2. 属性系统：Kivy的属性系统允许你创建响应式的**属性**，当这些属性改变时，相关的UI元素会自动更新。这类似MVC中的**Model**。
3. 逻辑与视图的分离：Python代码处理应用程序的逻辑，类似于MVC中的**Controlle**r。并且属性的改变会通过观察者模式自动（指框架帮我们做好了）改变视图。

不过感觉好像发展的还不是很成熟，很多组件是缺失的。

#### Demo

搞了一个Demo，基于[官方教程](https://kivy.org/doc/stable/tutorials/pong.html)改的。添加了对键盘事件的处理。

```python
from kivy.app import App
from kivy.uix.widget import Widget
from kivy.properties import (
    NumericProperty, ReferenceListProperty, ObjectProperty
)
from kivy.core.window import Window
from kivy.vector import Vector
from kivy.clock import Clock
from kivy.logger import Logger

class PongPaddle(Widget):
    score = NumericProperty(0)

    def bounce_ball(self, ball):
        if self.collide_widget(ball):
            vx, vy = ball.velocity
            offset = (ball.center_y - self.center_y) / (self.height / 2)
            bounced = Vector(-1 * vx, vy)
            vel = bounced * 1.1
            ball.velocity = vel.x, vel.y + offset


class PongBall(Widget):
    velocity_x = NumericProperty(0)
    velocity_y = NumericProperty(0)
    velocity = ReferenceListProperty(velocity_x, velocity_y)

    def move(self):
        self.pos = Vector(*self.velocity) + self.pos


class PongGame(Widget):
    ball = ObjectProperty(None)
    player1 = ObjectProperty(None)
    player2 = ObjectProperty(None)
    speed = 5

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.pressed_keys = set()

    def serve_ball(self, vel=(4, 0)):
        self.ball.center = self.center
        self.ball.velocity = vel

    def update(self, dt):
        self.ball.move()

        # bounce off paddles
        self.player1.bounce_ball(self.ball)
        self.player2.bounce_ball(self.ball)

        # bounce ball off bottom or top
        if (self.ball.y < self.y) or (self.ball.top > self.top):
            self.ball.velocity_y *= -1

        # went off to a side to score point?
        if self.ball.x < self.x:
            self.player2.score += 1
            self.serve_ball(vel=(4, 0))
        if self.ball.right > self.width:
            self.player1.score += 1
            self.serve_ball(vel=(-4, 0))
        
        if 'w' in self.pressed_keys:
            self.player1.center_y = min(Window.height - self.player1.size[1] // 2, self.player1.center_y+self.speed)
        if 's' in self.pressed_keys:
            self.player1.center_y = max(self.player1.size[1] // 2, self.player1.center_y-self.speed)
        if 'up' in self.pressed_keys:
            self.player2.center_y = min(Window.height - self.player2.size[1] // 2, self.player2.center_y+self.speed)
        if 'down' in self.pressed_keys:
            self.player2.center_y = max(self.player2.size[1] // 2, self.player2.center_y-self.speed)

    def on_touch_move(self, touch):
        if touch.x < self.width / 3:
            self.player1.center_y = touch.y
        if touch.x > self.width - self.width / 3:
            self.player2.center_y = touch.y

    def on_key_down(self, keyboard, keycode, text, modifiers):
        self.pressed_keys.add(keycode[1])
        return True
    
    def on_key_up(self, keyboard, keycode):
        self.pressed_keys.remove(keycode[1])
        return True

class PongApp(App):
    def build(self):
        self.game = PongGame()
        self._keyboard = Window.request_keyboard(None, self.game)
        self._keyboard.bind(on_key_down=self.game.on_key_down)
        self._keyboard.bind(on_key_up=self.game.on_key_up)
        self.game.serve_ball()
        Clock.schedule_interval(self.game.update, 1.0 / 60.0)
        return self.game

    def _keyboard_closed(self):
        self._keyboard.unbind(on_key_down=self.game.on_key_down)
        self._keyboard.unbind(on_key_up=self.game.on_key_up)
        self._keyboard = None

if __name__ == '__main__':
    PongApp().run()
```

<center>File: main.py</center>

```kv
#:kivy 1.0.9

<PongBall>:
    size: 50, 50 
    canvas:
        Ellipse:
            pos: self.pos
            size: self.size          

<PongPaddle>:
    size: 25, 200
    canvas:
        Rectangle:
            pos: self.pos
            size: self.size

<PongGame>:
    ball: pong_ball
    player1: player_left
    player2: player_right
    
    canvas:
        Rectangle:
            pos: self.center_x - 5, 0
            size: 10, self.height
    
    Label:
        font_size: 70  
        center_x: root.width / 4
        top: root.top - 50
        text: str(root.player1.score)
        
    Label:
        font_size: 70  
        center_x: root.width * 3 / 4
        top: root.top - 50
        text: str(root.player2.score)
    
    PongBall:
        id: pong_ball
        center: self.parent.center
        
    PongPaddle:
        id: player_left
        x: root.x
        center_y: root.center_y
        
    PongPaddle:
        id: player_right
        x: root.width - self.width
        center_y: root.center_y
```

<center>File: pong.kv</center>

### Lazarus

如果你需要一个编写一个**原生的、跨平台的**GUI App，那么Lazarus会是一个很好的选择。它支持 **拖拽式界面设计**，唯一的缺点（对我来说）是使用了Free Pascal编程语言，可能除了信息竞赛之外，国内已经很少使用它了，几乎没有相关的就业岗位。我也对Pascal也只有很基本的了解。

> [govcl](https://z-kit.cc/en/)项目让我们可以使用Lazarus IDE的同时，使用Golang进行编程。可以参考一下。

在用使用 Lazarus 开发 GUI 程序时，您不只编写 Pascal 单元中的代码，而且还需设计窗体（forms）。窗体上可以放置像按钮、列表框之类的可视控件，也可以放置一些非可视控件（non-visual controls）。像 Delphi 一样，在 Lazarus 中的窗体设计过程也是可视化的，控件属性的设置可以在 IDE 中完成，也可用代码实现。

#### 链接动态库

由于对Pascal不太熟悉，所以想用熟悉的语言编写程序的核心逻辑。还好，pascal 链接动态库并不复杂（当然也不简单）。这里简单介绍一下手动操作的步骤：

1. 使用C/C++/Rust...等编译出动态库文件，如 `libxxx.so`。
2. 构建的时候，需要告诉编译器去哪里找动态库文件。
    1. 使用Lazarus IDE：`Project/Project Options/Compiler Options-Paths`，在`Libraries`中添加动态库文件的路径。
    2. 命令行：添加`-Fl/path/to/lib`
3. 运行的时候，需要告诉操作系统在哪里寻找动态库文件
    1. 这个可以在编译的时候，将动态库的相对路径信息保存。使用Lazarus IDE：`Project/Project Options/Compiler Options-Compilation and Linking`，在`Pass options to linker with "-k"`中，添加`-rpath=relative_path/to/lib`。
    2. 也可以在运行的时候指定。这个不同操作系统方法不同。不推荐这么搞。
4. 在代码中，可以创建一个Unit来引入动态库中暴露的接口。举个例子

使用Rust编写一个简单的`add`函数：

```rust
#[no_mangle]
pub extern "C" fn add(left: i32, right: i32) -> i32 {
    left + right
}
```

在Pascal中，interface部分声明这个函数。这里都使用了C语言的调用规范。

```pascal
interface
{$IFDEF WINDOWS}
const
  DLL_NAME = 'xxx.dll';
{$ENDIF}
{$IFDEF LINUX}
const
  DLL_NAME = 'libxxx.so';
{$ENDIF}
{$IFDEF DARWIN}
const
  DLL_NAME = 'libxxx.dylib';
{$ENDIF}

function add(a, b: Integer): Integer; cdecl; external DLL_NAME;  
```

注意在跨语言调用的时候，要遵循**谁创建，谁释放**的原则，另外小心不同语言类型之间的映射关系。一个典型的例子是**字符串**：

1. Pascal中字符串`string`，字符串的内存管理在 Delphi 和 Free Pascal 中是自动的，使用引用计数来确保内存的正确分配和释放。可以放心的转化为`PAnsiChar`，对应C语言中的`char *`。最稳妥的办法是把指针和长度一起传过去。

### Slint

[Slint](https://github.com/slint-ui/slint/) 支持**多语言（Rust/Cpp/Js）**，**跨平台(嵌入式/桌面/移动/网页）**，简便易用，高效执行。他支持GPLv3 LICENCE，所以用作个人爱好肯定是没有问题的，也支持其他商业协议。

他使用`slint` DSL，一种类似`qml`的markup语言来描述用户界面，然后被编译/转化成对应的代码。当然，也可以在代码中布局。Designer应该是还没有开发好。这个库目前还在积极的开发过程中。

这是他的程序架构：  
![arch](https://camo.githubusercontent.com/ab9893946fc42d3e8c69a7fa46a23494b6b11a24999bdd8afe7ebfd7e42eb82c/68747470733a2f2f736c696e742e6465762f7265736f75726365732f6172636869746563747572652e64726177696f2e737667)

<https://releases.slint.dev/1.6.0/docs/rust/slint/>

#### Slint DSL

每个 **.slint文件** 定义一个或多个**Components**。这些组件声明一个**Elements Tree**。Components类似面向对象语言中的对象实例，Element自然就是Class Instance。

每个 Element 的位置和大小控制：

- 属性`x` 和 `y` 控制Element相对parent element的位置。
- 属性 `width` 和 `height` 控制 Element 的大小。
- 如果没有设置这些属性，**layout** 也可以控制。
- 还有其他更精细的控制方式。

某些Element（如`TextInput`）不仅接受来自鼠标/手指的输入，还接受来自（虚拟）键盘的按键事件。为了让项目接收这些事件，它必须具有**Focus**。这可以通过has-focus（out）属性看到。也可以通过调用`focus()`和`clear-focus()`方法来让Element获得和失去Focus。

一些实用的语法Tips:

- 标识符中的`-`和`_`是完全等价的，`-`会被转换成`_`。
- 格式化字符串`@tr("Hello, {}", name);`

BuiltIn Widgets如下。这些虽然足够，但是不方便。[std-widgets](https://releases.slint.dev/1.6.0/docs/slint/src/language/widgets/)里有更多，并且还在不断开发中。

- `Dialog`
- `Flickable`
- `FocusScope`
- `Image`
- `Path`
- `PopupWindow`
- `Rectangle`
- `Text`
- `TouchArea`
- `VerticalLayout` and `HorizontalLayout`

[Slint官方文档](https://releases.slint.dev/1.6.0/docs/slint/)，[Slint Widgets Show](https://slintpad.com/?load_demo=examples/gallery/gallery.slint)，[Rust Slint](https://releases.slint.dev/1.6.0/docs/rust/slint/#generated-components)

截至2024/7/3, **You can not access properties that are not in the root element**。这让我非常的恼火。参考[stackoverflow](https://stackoverflow.com/questions/76740968/how-to-access-widgets-created-by-slint-dsl-code/76760315#76760315)，目前只有两个绕过的办法

## Sciter

Embeddable HTML/CSS/JavaScript engine for modern UI development.

## Low Level Graphic Library

| Library | Platform        | Dimension | API |
| ------- | --------------- | --------- | --- |
| OpenGL  | Cross Platform  | 2D/3D     | C   |
| DirectX | Windows         | 2D/3D     |     |
| Vulkan  | Cross Platform  | 2D/3D     |     |
| Metal   | MacOS           | 2D/3D     |     |
| SDL     | Cross Platform  | 2D        |     |
| Cairo   | Multiple output | 2D        | C   |
| Skia    | Cross Platform  | 2D        |     |

Rendering backends:

- Qt: penGL ES, OpenGL, Vulkan, Metal, or Direct 3D
- GTK: Cairo/OpenGL/Vulkan...
- Kivy: OpenGL
- Slint: OpenGL/Skia/Software rendering
- Pygame: SDL

---
- <https://draveness.me/mvx/>
- <https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm>
