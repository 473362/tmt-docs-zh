# defineNode()

`defineNode` 用来创建一个不是层的树节点。它们可以用于导航或运行函数。将返回的句柄添加到 [defineMod](01/00) 的 `nodes` 属性中。

节点没有自己的保存状态。显示回调接收 mod 读取上下文，`onClick` 接收 mod 写入上下文。

本页使用的共享类型：

- `StyleValue` {type: Record<string, string | number | undefined>}
将 CSS 属性名映射到其对应的值。支持的值和覆盖请参见 [Styling](01/11)。
- `ClassValue` {type: string | string[] | Record<string, boolean>}
应用空格分隔的类名、类名列表，或根据布尔值应用或不应用类名的映射。示例请参见 [Styling](01/11)。
- `LayerHandle` {type: layer identity}
由 [defineLayer](01/01) 返回。仅暴露层的 `id` 和 `points` 资源，可通过上下文访问其状态。
- `NodeHandle` {type: node identity}
由 `defineNode` 返回。仅暴露独立树节点的 `id`。

## 属性

### 身份和位置

- `id` {type: string} {required}
节点的唯一标识。在 mod 中所有层和节点中必须唯一。
- `title` {type: string} {required} {callback}
节点的名称。
- `symbol` {type: string} {可选} {callback}
确定该节点在树节点中显示的字母或符号。
- `color` {type: string} {required}
节点样式中使用的 CSS 颜色。
- `row` {type: number | "left" | "right"} {required}
节点显示的行。必须是有限值。也支持 "left" 和 "right"（参见 [layer.setup.tree](01/01?s=3.4) 的第一个属性）。
- `position` {type: number} {可选}
节点在其行中的位置。必须是有限值。默认值为 `defineMod` 的 `nodes` 中的索引。

### 外观

- `shown` {type: boolean | "ghost"} {可选} {callback}  
控制节点是否显示。`"ghost"` 会占用空间但不显示节点。
- `image` {type: string} {可选} {callback}  
控制节点树按钮显示的s片 URL。默认不显示图片，而是显示节点的符号。
- `tooltip` {type: string} {可选} {callback} {html}  
控制节点的工具提示。默认值为 `""`。
- `mark` {type: boolean | string} {可选} {callback}  
当为 `true` 时显示星标，提供 URL 时显示自定义图片，`false` 则不显示。默认值为 `false`。
- `style` {type: StyleValue} {可选} {callback}  
设置节点样式。默认无样式。
- `class` {type: ClassValue} {可选} {callback}  
给节点应用 CSS 类。默认不添加额外类。

### 连接

- `connections` {type: TreeConnectionDefinition[]} {可选}  
绘制到其他层或节点手柄的分支。默认值为 `[]`。可以通过以下字段自定义分支：
- `target` {type: LayerHandle | NodeHandle} {required}  
要连接的层或节点。
- `color` {type: string} {可选}  
连接颜色。默认值为 `"#ffffff"`。
- `width` {type: number} {可选}  
连接宽度。必须是有限且正数。默认值为 `15`。

只有当两个点都可见且非幽灵状态时，连接才会显示。与层不同，节点不会自动与前一行添加连接。

### 操作

- `canClick` {type: 布尔值} {可选} {回调}
控制节点是否能被点击。默认是 `true`。
- `onClick` {type: void} {可选} {仅回调}
交互时会以 `onClick(context)` 运行。
- `layer` {type: LayerHandle} {可选}
点击完成后要跳转的层。默认没有导航目标。

### 通知

- `shouldNotify` {type: 布尔值} {可选} {回调: 布尔值 | 未定义}
控制操作发光。默认不发光。
- `resetNotify` {type: 布尔值} {可选} {回调: 布尔值 | 未定义}
控制重置发光。默认不发光。
- `actionGlowColor` {type: 字符串} {可选} {回调}
操作发光颜色。默认是 `白色`。
- `resetGlowColor` {type: 字符串} {可选} {回调}
重置发光颜色。默认是 `红色`。

操作发光优先。

## 示例

这个节点在被点击时会弹出一条信息。在模组的 `nodes` 集合中包含 `help`。

```js
const help = defineNode({
  id: "help",
  title: "帮助",
  symbol: "?",
  color: "#ffffff",
  row: "left",
  tooltip: "怎么玩",
  onClick(context) {
    context.alert({
      title: "快速上手",
      message: "获取点数，然后重置以获得声望点数。"
    });
  }
});
```