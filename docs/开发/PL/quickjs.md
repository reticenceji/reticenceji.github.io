---
aliases: 
tags: 
date: 2025-04-15
date_modified: 2025-04-15
---

# QuickJS

如果想在自己的程序中嵌入一个脚本语言，有很多种方式，例如：

1. 自己创建一个DSL，解析并执行。如果要求脚本的能力很简单，这种方法是合适的。
2. 将脚本解释器打包在程序中。例如JavaScript的QuickJS（轻量）、V8（高性能），Lua（LuaJIT），TCL，Python。
3. 利用系统的脚本解释器。例如一般Linux发行版都带Python，可以直接利用系统的Python解释器，但是这样的话就要考虑版本问题。
4. 使用WASM/BPF等字节码虚拟机也是一种方法。

这里主要记录集成[QuickJS](https://bellard.org/quickjs/)的方案。QuickJS被设计的十分轻量适合集成。编译[源代码](https://github.com/bellard/quickjs#)之后可以得到静态库`libquickjs.a`，链接上去就可以了。头文件是`quickjs.h`和`quickjs-libc.h`（如需使用标准库）。

```c
// 创建 QuickJS 运行时和上下文
JSRuntime *rt = JS_NewRuntime();
JSContext *ctx = JS_NewContext(rt);

// 加载标准库（可选）
js_std_init_handlers(rt);
js_init_module_std(ctx, "std");
js_init_module_os(ctx, "os");

// 执行字符串
const char *code = "1 + 2 * 3";
JSValue result = JS_Eval(ctx, code, strlen(code), "<eval>", JS_EVAL_TYPE_GLOBAL);
if (JS_IsException(result)) {
    JS_FreeValue(ctx, result);
    // 处理错误
} else {
    printf("Result: %d\n", JS_VALUE_GET_INT(result));
    JS_FreeValue(ctx, result);
}
```

还有Rust绑定[rquickjs - Rust](https://docs.rs/rquickjs/0.9.0/rquickjs/index.html)。我在使用中发现了一个不太愉快的地方，就是不能和`serde`库很好的集成。将一个`serde_json::Value`转化成一个`rquickjs::Value`并没有一个直接的方法，反之亦然。

```rust
fn serde_value_to_js_value<'js>(
    value: &serde_json::Value,
    ctx: &rquickjs::Ctx<'js>,
) -> rquickjs::Result<rquickjs::Value<'js>> {
    match value {
        serde_json::Value::Null => Ok(rquickjs::Value::new_null(ctx.clone())),
        serde_json::Value::Bool(b) => b.into_js(ctx),
        serde_json::Value::Number(n) => {
            if n.is_f64() {
                n.as_f64().unwrap().into_js(&ctx)
            } else if n.is_i64() {
                n.as_i64().unwrap().into_js(&ctx)
            } else {
                panic!("unsupported number type: {}", n);
            }
        }
        serde_json::Value::String(s) => s.into_js(&ctx),
        serde_json::Value::Array(a) => {
            let array = rquickjs::Array::new(ctx.clone()).unwrap();
            for (i, item) in a.iter().enumerate() {
                array.set(i, serde_value_to_js_value(item, ctx)?)?;
            }
            Ok(array.into_value())
        }
        serde_json::Value::Object(o) => {
            let obj = rquickjs::Object::new(ctx.clone()).unwrap();
            for (k, v) in o {
                obj.set(k, serde_value_to_js_value(v, ctx)?)?;
            }
            Ok(obj.into_value())
        }
    }
}

fn js_value_to_serde_value<'js>(value: rquickjs::Value<'js>) -> rquickjs::Result<serde_json::Value> {
    match value.type_of() {
        rquickjs::Type::Uninitialized | rquickjs::Type::Undefined | rquickjs::Type::Null => Ok(serde_json::Value::Null),
        rquickjs::Type::Bool => Ok(serde_json::Value::Bool(value.as_bool().unwrap())),
        rquickjs::Type::BigInt => Ok(serde_json::Value::Number(serde_json::Number::from(
            value.as_big_int().cloned().unwrap().to_i64()?,
        ))),
        rquickjs::Type::Int => Ok(serde_json::Value::Number(serde_json::Number::from(
            value.as_int().unwrap(),
        ))),
        rquickjs::Type::Float => Ok(serde_json::Value::Number(
            serde_json::Number::from_f64(value.as_float().unwrap()).unwrap(),
        )),
        rquickjs::Type::String => {
            let str = value.as_string().unwrap().to_string()?;
            Ok(serde_json::Value::String(str))
        }
        rquickjs::Type::Symbol
        | rquickjs::Type::Constructor
        | rquickjs::Type::Function
        | rquickjs::Type::Promise
        | rquickjs::Type::Exception
        | rquickjs::Type::Module
        | rquickjs::Type::Unknown => Ok(serde_json::Value::Null),
        rquickjs::Type::Array => {
            let mut vec = Vec::new();
            let array = value.as_array().unwrap();
            for i in 0..array.len() {
                vec.push(js_value_to_serde_value(array.get(i).unwrap())?);
            }
            Ok(serde_json::Value::Array(vec))
        }
        rquickjs::Type::Object => {
            let mut map = serde_json::Map::new();
            let obj = value.as_object().unwrap();
            for kv in obj.props() {
                let (k, v) = kv.unwrap();
                map.insert(k, js_value_to_serde_value(v)?);
            }
            Ok(serde_json::Value::Object(map))
        }
    }
}
```

[GitHub - awslabs/llrt: LLRT (Low Latency Runtime)](https://github.com/awslabs/llrt) 为rquickjs提供了更丰富的功能，可以组合使用。不过暂时在crate.io中找不到他。
