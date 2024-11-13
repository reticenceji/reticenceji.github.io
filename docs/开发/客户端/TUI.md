---
aliases: 
tags: 
date_created: Wednesday, November 13th 2024, 1:30:01 pm
date_modified: Wednesday, November 13th 2024, 2:15:37 pm
---

# TUI

在[CLI](CLI.md) 中介绍了终端应用程序的两种形态。事实上，我们还可以在终端上编写类似GUI的程序，这种程序被称为 TUI。不过这样的程序**可能**是最不受欢迎的了——对人友好不如GUI，对机器友好不如CLI，长得不可能好看到哪里去，分辨率不可能太高。

但是，如果你认为这个东西肯定只是用来给人用的，并且使用者可能没有条件使用GUI程序，那么编写一个TUI程序会是一个不错的选择。一个很好的例子是 [menuconfig](https://en.wikipedia.org/wiki/Menuconfig)

![Example - menuconfig](../../static/Pasted%20image%2020240416170147.png)

有很多优秀的TUI框架帮我们封装了和终端交互的具体细节，让我们可以直接对鼠标事件、键盘事件进行编程，对界面进行设计。

TUI可以当作是一个简单的GUI程序，实际上它的编程方法和简单的GUI程序是大同小异的，无非是调用的绘图API不同，处理的事件不同，总体思路是一样的。一般过程都是

1. 设计界面外观：这包括创建窗口和其他各种构件，并进行合适的布局。TUI的外观不会太复杂。
2. 为每个构件定义事件处理程序：这一步是 TUI/GUI 开发的核心任务，决定着程序的功能 和与用户交互时的行为。

## Frameworks

### Textual for Python

<https://github.com/Textualize/textual>

### Ratatui for Rust

<https://crates.io/crates/ratatui>

[示例代码](https://github.com/ratatui-org/ratatui-website/blob/main/code/hello-world-tutorial/src/main.rs)、[更规范的示例代码](https://github.com/ratatui-org/ratatui-website/tree/main/code/counter-app-basic) 显示了使用Ratatui框架编写TUI程序的一般过程：

1. Initialize the terminal
2. Run the application in a **loop** until the user exits the app
    1. draw widgets
    2. handle events
3. Restore the terminal back to its original state

以及没有提到的，但是应该完成的任务：

1. Set panic hook to restore the terminal back to its original state.

这是一个不太完整的示例代码，完整的可以参考[代码仓库](https://github.com/ratatui-org/ratatui-website/tree/main/code)

```rust
mod tui {
    pub type Tui = Terminal<CrosstermBackend<Stdout>>;
    pub fn init() -> io::Result<Tui> {
        execute!(stdout(), EnterAlternateScreen)?;
        enable_raw_mode()?;
        Terminal::new(CrosstermBackend::new(stdout()))
    }
    pub fn restore() -> io::Result<()> {
        execute!(stdout(), LeaveAlternateScreen)?;
        disable_raw_mode()?;
        Ok(())
    }
}
#[derive(Default)]
struct App;

impl App {
    pub fn run(&mut self, terminal: &mut tui::Tui) -> Result<()> {
        while !self.exit {
            terminal.draw(|f| self.render_frame(f))?;
            self.handle_events()?;
        }
        Ok(())
    }
}
fn main() -> Result<()> {
    std::panic::set_hook(Box::new(move |panic_info| {
        tui::restore().unwrap();
        eprintln!("{}", panic_info);
    }));

    let mut terminal = tui::init()?;
    App::default().run(&mut terminal)?;
    tui::restore()?;
    
    Ok(())
}
```

### R3bl for Rust

这个库用Web前端的思维来做TUI，蛮有意思。他是异步的。

<https://github.com/r3bl-org/r3bl-open-core>
