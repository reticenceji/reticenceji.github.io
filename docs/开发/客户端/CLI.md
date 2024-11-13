---
aliases: 
tags: 
date_created: Wednesday, November 13th 2024, 1:30:01 pm
date_modified: Wednesday, November 13th 2024, 2:15:37 pm
---

# CLI

一般来说用户界面可以分成3种，GUI/TUI/CLI，表示图形界面，文字界面，命令行界面。CLI显然是最简单的一个，简单的说，CLI唯一的任务就是**解析用户传入的参数**。幸运的是，有许多框架帮我们解决了参数解析的问题。只要学会使用这些框架，就可以很简单的编写命令行界面。

下面分为两个章节，第一章使用简单的例子解释命令行参数的基本原理，随后我们会介绍Rust中流行的框架和Python中流行的框架。

## Basic

我们可以认为CLI程序是运行在终端界面上的程序。**终端（Terminal）** 有以下几种：

- 物理终端：直接连接在主机上的显示器、键盘鼠标统称。在实际机架式服务器部署中，一般是多台服务器共享一套终端，简称KVM（Keyboard键盘，video显示器，mouse鼠标）
- 虚拟终端（tty）：附加在物理终端之上，用软件方式虚拟实现，CentOS默认启用6个虚拟终端，可以通过快捷键来切换，切换方式:Ctrl-Alt-F[1--6], 对应的文件是/dev/tty#。可以同过tty命令来查看当前的虚拟终端号。tty是teletypewriter的简称。
- 伪终端(pty)：两种应用场景，第一在图形界面下打开的命令行接口，第二基于ssh协议或telnet协议等远程打开的命令行界面，是运维工程师用的最多的一种连接服务器的方式。pts(pseudo-terminal slave)是pty的实现方法。
- 控制终端（/dev/tty） 这是个在应用程序中的一个概念，前台进程有个控制终端，就对应这个。不过它并不指任何物理意义上的终端，其实/dev/tty会映射到当前的设备（通过tty命令可以看到），比如你如果在控制台界面下(即字符界面下）那么dev/tty就是映射到dev/tty1-6之间的一个（取决于你当前的控制台号），但是如果你现在是在图形界面（Xwindows），那么你会发现现在的/dev/tty映射到的是/dev/pts的伪终端上。比如你可以输入命令 `#tty` 那么将显示当前映射终端如：/dev/tty1或者/dev/pts/0等。

Terminal和Shell是很容易混淆的概念。终端本身并不会解析命令，它只是一个界面，负责人机交互的一个接口而已，真正处理命令的是shell。终端只负责提供一个输入命令的交互界面而已，在里面运行的命令是专门的命令执行程序shell来完成的。终端的主要任务是接收用户输入的命令和字符，然后提交给shell，并且将命令执行完的结果反馈给用户。shell负责将命令翻译，在系统执行完之后将结果返回给终端。

不过，对于CLI程序的编写，我们只需要了解基本概念就可以了，底层的规则是无趣的，交给库就可以了。

## Frameworks

### Clap for Rust

Document: <https://docs.rs/clap/latest/clap/>, <https://docs.rs/clap/latest/clap/_derive/_tutorial/index.html>

个人感觉，Rust被广泛的用在命令行程序的编写中，clap框架的优秀设计占有部分功劳。

Clap框架有两种风格的使用方式，个人偏向使用宏。一般我们会定义一个`struct Arg`，使用`Parser`过程宏来修饰它。然后需要传入的参数限制都通过过程宏的装饰决定，并且注释会被加入命令行程序的`help`说明。

```sh
cargo add clap --features derive
```

```rust
use clap::Parser;

/// Simple program to greet a person
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    /// Name of the person to greet
    #[arg(short, long)]
    name: String,

    /// Number of times to greet
    #[arg(short, long, default_value_t = 1)]
    count: u8,
}

fn main() {
    let args = Args::parse();

    for _ in 0..args.count {
        println!("Hello {}!", args.name)
    }
}
```

### Dialoguer for Rust

[dialoguer](https://crates.io/crates/dialoguer) 提供了另一种风格的命令行程序框架。它有点像大家刚入门C语言写程序一样，printf - scanf 这样通过标准输入输出进行交互的风格。一个简单的Demo如下

```rust
use dialoguer::{Confirm, Input, Select};

fn main() {
    // Get user name
    let name: String = Input::new()
        .with_prompt("What is your name?")
        .interact_text()
        .unwrap();

    // Get user age
    let age: u32 = Input::new()
        .with_prompt("What is your age?")
        .interact_text()
        .unwrap();

    // Select favorite color
    let colors = vec!["Red", "Green", "Blue", "Yellow"];
    let favorite_color = Select::new()
        .with_prompt("What is your favorite color?")
        .items(&colors)
        .interact()
        .unwrap();

    // Confirm if user wants to proceed
    let proceed = Confirm::new()
        .with_prompt(&format!("Hello, {} (age {}). Your favorite color is {}. Proceed?", name, age, colors[favorite_color]))
        .interact()
        .unwrap();

    if proceed {
        println!("Proceeding with the program...");
    } else {
        println!("Exiting the program.");
    }
}
```

Dialoguer提供了一些方便的组件：

- [Confirm](https://docs.rs/dialoguer/0.11.0/dialoguer/struct.Confirm.html "struct dialoguer::Confirm")：让用户输入 y/n
- [Input](https://docs.rs/dialoguer/0.11.0/dialoguer/struct.Input.html "struct dialoguer::Input")：让用户输入一行文字
    - [Editor](https://docs.rs/dialoguer/0.11.0/dialoguer/struct.Editor.html "struct dialoguer::Editor")：打开默认的编辑器，让用户输入多行文字。
    - [Password](https://docs.rs/dialoguer/0.11.0/dialoguer/struct.Password.html "struct dialoguer::Password")：输入密码，没有回显。
- [Select](https://docs.rs/dialoguer/0.11.0/dialoguer/struct.Select.html "struct dialoguer::Select")：让用户选择一个选项
    - [MultiSelect](https://docs.rs/dialoguer/0.11.0/dialoguer/struct.MultiSelect.html "struct dialoguer::MultiSelect")：让用户选择多个选项，空格选择回车确认。

> 对于这两种风格，前一种对用户友好对机器也友好，后一种对用户更友好，但是对机器非常不友好。

### Click for Python

Document: <https://click.palletsprojects.com/en/8.1.x/>

click框架使用装饰器来规定参数，一般我们使用 `@click.command()` 修饰入口函数，然后使用`@click.option`规定它的命令行参数。

运行时，click会自动解析用户传入的命令行参数，并传递给函数，参数的类型by default都是字符串。Demo如下。

```python
import click

@click.command()
@click.option('--count', default=1, help='Number of greetings.')
@click.option('--name', prompt='Your name',
              help='The person to greet.')
def main(count, name):
    """Simple program that greets NAME for a total of COUNT times."""
    for x in range(count):
        click.echo(f"Hello {name}!")

if __name__ == '__main__':
    main()
```

总的来说，我个人觉得click可以帮助用户快速建立一个还不错的CLI，但是并不是特别严谨。

### cli for Go

[urfave/cli](https://github.com/urfave/cli) is a **declarative**, simple, fast, and fun package for building command line tools in Go

## Advanced Topic

下面我们介绍一些稍微高级一点的主题，包括Signal处理，美化。

### Signal Handling

说起Signal，大部分人都会想起使用Ctrl+C关闭命令行程序。这就是默认情况下操作系统对`SIGINT`信号对处理方式。不过实际上，操作系统是允许用户自定义某些信号的处理方式的。关于它的具体原理，我们在[Linux-Signal](../系统编程/Signal.md) 中介绍。我们不需要通过底层的方式注册处理函数，我们只需要调用库就可以了。

在Python中，标准库有`signal`模块。他可以为信号注册处理函数。Python 信号处理程序不会在低级（ C ）信号处理程序中执行。相反，低级信号处理程序设置一个标志，告诉 virtual machine 稍后执行相应的 Python 信号处理程序。Python 信号处理程序总是会在主 Python 主解释器的主线程中执行，即使信号是在另一个线程中接收的。 这意味着信号不能被用作线程间通信的手段。当然，对于`SIGINT`的处理可以直接对`KeyBoardInterrupt`异常进行处理。

```python
import signal
import sys

def signal_handler(signal, frame):
    print('You pressed Ctrl+C!')
    sys.exit(0)

# Set the signal handler for SIGINT (Ctrl+C)
signal.signal(signal.SIGINT, signal_handler)

print('Press Ctrl+C to exit...')

# Keep the program running until a signal is received
while True:
    pass
```

例如，在Rust中我们可以使用[signal-hook](https://crates.io/crates/signal-hook)这个第三方库。他的实现感觉和Python是类似的，都是设置一个标志。在下面的例子中，如果收到`SIGINT`信号，会把term设置为`true`。如果想进一步处理，可以单开一个线程。

```rust
use std::sync::Arc;
use std::sync::atomic::AtomicBool;

fn main() {
    let term = Arc::new(AtomicBool::new(false));
    
    let _ = signal_hook::flag::register(signal_hook::consts::SIGINT, Arc::clone(&term));
}
```

[signal-hook]是一个重量级的库，如果只需要处理SIGINT，可以使用[ctrlc](https://docs.rs/ctrlc/latest/ctrlc/)。在实际的编程中，对信号进行太多的处理是危险的行为，非常容易出错。

### Beautify

在 Linux 上，终端字符颜色的控制主要基于 ANSI 转义序列。ANSI 转义序列是一组特殊的字符序列,用于控制终端输出的各种属性,包括颜色、样式、光标位置等。ANSI全称是ANSI X3.64 标准，是一个开放标准,不受任何单一公司或组织的控制。除了在Linux被广泛使用，Windows上的xterm、PuTTY也使用。Windows 控制台使用了自己的一套 API 来实现对终端输出的控制，不过Powershell也支持 ANSI。

还好，这些细节不需要了解，有库已经帮我们做好了跨平台的封装。不过如果感兴趣，也可以去阅读[ANSI X3.64 Standard](https://vt100.net/annarbor/aaa-ug/section13.html)。

- [console](https://docs.rs/console/latest/console/) for Rust: 看起来这个是一个比较简单的库，提供的功能主要是修改颜色。
- [crossterm](https://crates.io/crates/crossterm) for Rust: 提供了更全面的对终端进行操作的库。
- [rich](https://rich.readthedocs.io/en/latest/) for Python: 

### Progress Bar

进度条是让软件符合人体工学的不可或缺的部分。如果需要手动实现，跨平台和各种终端标准都很麻烦。还好，有各种库提供了支持。

- [indicatif](https://docs.rs/indicatif/latest/indicatif/#) for Rust
- [tqdm](https://tqdm.github.io/) for Python
