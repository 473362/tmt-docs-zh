# defineMod()

defineMod() 是使用 TMT 制作游戏的入口点。每个游戏应调用一次，它已经存在于模板的 main.js 中。它期望一个包含以下属性的对象。

在 defineMod() 内的运行时回调会接收一个 mod [上下文](01/06)，除非另有说明。

本页使用的共享类型：

- `StyleValue` {type: Record<string, string | number | undefined>}
将 CSS 属性名称映射到它们的值。有关支持的值和覆盖，请参见 [Styling](01/11)。
- `DecimalSource` {type: Decimal | ReadonlyDecimal | number | string}
Decimal 类型字段和操作接受的输入。更多信息请参见 [Decimal](01/04)。
- `LayerHandle` {type: layer identity}
由 [defineLayer](01/01) 返回。只暴露层的 `id` 和 `points` 资源，通过上下文访问其状态。
- `NodeHandle` {type: node identity}
由 [defineNode](01/02) 返回。只暴露独立树节点的 `id`。

## 属性

### info {type: ModInfo} {required}

info 属性接受以下属性：

- `id` {type: string} {required}
设置游戏保存数据在 LocalStorage 中的位置。
- `name` {type: string} {required}
为你的游戏命名。
- `author` {type: string} {required}
你的名字！
- `version` {type: string} {required}
游戏显示的版本。不应用于存档迁移，存档迁移请参见 `saveVersion`。
- `pointsName` {type: string} {required}
主货币的名称。
- `initialPoints` {type: DecimalSource} {required}
新玩家的起始主货币数量。必须是有限数值。
- `startLayer` {type: LayerHandle} {required}
初始选中的层。它的初始 `unlocked` 状态默认是 `true`，但其他所有层默认是 `false`。
- `offlineLimitHours` {type: number} {optional}
最大离线时间（小时）。必须是有限且非负数。默认值为 `1`。参见 [Simulation](01/10)。

### layers {type: LayerHandle[]} {required}

在这里包含所有的层句柄。未包含的句柄将不会在游戏中出现，也不会被引擎加载。

该数组中的顺序决定了当层的 `tree.position` 未定义时，该层在行内的位置。

### pointGain {type: DecimalSource} {required} {callback}

每秒获得的主要货币。必须是有限值。实际获得量计算方式为 `pointGain * delta`。

### nodes {type: NodeHandle[]} {optional}

在这里包含所有节点句柄。未包含的句柄将不会在游戏中出现，也不会被引擎加载。默认值为 `[]`。

### ui {type: ModUiDefinition} {optional}

ui 属性配置游戏的显示方式，并接受以下属性：

- `mode` {type: "tree" | "single"} {optional} 
默认值为 `"tree"`，在宽屏上显示活动页面旁边的树。`"single"` 隐藏树，只显示活动页面。深度嵌套可以在任意模式下显示两个页面。
- `backgroundStyle` {type: StyleValue} {optional} {callback} 
设置游戏包装器的样式。默认无样式。
- `notifications` {type: NotificationDefinition} {optional} 
配置弹出消息，包括完成弹出和通过 `context.popup` 请求的消息。详见 [弹出和模态](01/08)。树和标签的发光效果有各自的设置。
- `enabled` {type: boolean} {optional} 
控制弹窗是否可见。默认值为 `true`。设为 `false` 不会阻止完成钩子运行。
- `maxVisible` {type: number} {optional} 
最大可见弹窗数量。必须是正整数。默认值为 `3`。超过此数量的弹窗会移除最旧的。
- `durationMs` {type: number} {optional} 
默认弹窗生命周期（毫秒）。必须是 1 到 2147483647 的整数。默认值为 `3000`。单个弹窗可以覆盖此设置。

### simulation {type: SimulationDefinition} {optional}

simulation 属性用于配置游戏的模拟运行方式，接受以下属性。详情见 [Simulation](01/10)。

- `intervalMs` {type: number} {optional}  
每次 tick 之间的延迟，单位为毫秒。必须是 `1` 到 `2147483647` 的整数。默认值为 `50`。
- `maxTickSeconds` {type: number} {optional}  
单次 tick 的最大可能时长，单位为秒。必须是有限且正数。默认值为 `3600`。此限制不适用于离线进度。

### canGeneratePoints {type: boolean} {optional} {callback}

默认值为 `true`。当为 `false` 时，会跳过 `pointGain` 的计算和主货币的增加，并在头部显示零点数收益。

### update {type: void} {optional} {callback-only}

在主点数生成后、层更新前运行，格式为 `update(context, delta)`。`delta` 表示经过的秒数。tick 顺序和时间请见 [Simulation](01/10)。

### endgame {type: boolean} {optional} {callback}

默认值为 `false`。设置为 `true` 时，会将 `context.player.won` 设为真，保存游戏，显示结局面板，并暂停模拟和自动保存，直到玩家选择 “Keep Going!”。

当 `context.player.won` 为 `true` 时，将不再评估该条件，通常表示玩家已选择 “Keep Going!”。

### winText {type: string} {optional} {callback} {html}

在结局面板显示的内容。默认值为 `"You won!"`。

### saveVersion {type: number} {optional}

实际存档数据版本。必须是正的安全整数。默认值为 `1`。仅当你的更改需要迁移已有存档时才增加此值。这与显示的 `info.version` 是分开的。详情见 [Saves and Errors](01/09)。

### migrateSave {type: any} {required when： saveVersion > 1} {callback-only}

迁移保存状态并返回迁移状态。不会接收`context`。

其论点如下：

- `state` {type: any} {required}
解码保存状态，包含保存的`player`和`layers`字段。
- `fromVersion` {type: number} {required}
存档的原始 saveVersion。用它来选择需要迁移的步骤，以达到你当前的`saveVersion`。每次迁移都需要调用一次。

默认字段在迁移后创建。移除或重命名过时的层和功能ID，未知ID被拒绝。永久移除自定义字段也需要从`startState`中移除其初始化器。参见[加载与迁移](01/09?s=loading-and-migration)。

## ui.layout

`ui.layout` 是一个 `ShellLayoutNode` 对象的数组，按定义顺序渲染。它替代了游戏的外层（“shell”）布局。每一层内的布局仍由该层的 [ui.page](01/01?s=page-layout) 定义。

当定义了 `layout` 时，只渲染你声明的节点。

整个布局必须只包含一个 `content` 节点。

选项、信息和更新日志都会在 `content` 块中渲染。打开面板会暂时显示该分支，包括其隐藏的容器和标签。面板的返回箭头会恢复之前的视图，并在可用时将焦点回到启动器。临时选择不会保存；作者的 CSS 始终有效。

### 常用字段

类型为 `"row"`、`"column"`、`"text"`、`"button"`、`"tree"` 和 `"tabs"` 的节点除了其特有字段外，还接受以下字段：

- `shown` {类型: boolean} {可选} {回调}  
控制节点及其内容是否渲染。默认值为 `true`。
- `style` {类型: StyleValue} {可选} {回调}  
控制节点的包裹样式。默认没有样式。
- `class` {类型: ClassValue} {可选} {回调}  
控制节点的包裹类。默认没有额外类。

### 布局块

这些节点是 shell UI 的组成部分，只接受 `type`。你仍然可以把块放在行或列里来应用 `shown`、`style` 或 `class`。

| `type` | 内容 |
| --- | --- |
| `"header"` | 完整的默认标题，结合 `version`、`points` 和 `panels` 块。你也可以单独定义这些块。|
| `"points"` | 主要货币，它的名称以及增益。|
| `"version"` | 版本显示，以及用于访问更新日志的按钮（如果定义了的话）。|
| `"panels"` | 合并的 `options` 和 `info` 块。你也可以单独定义这些块。|
| `"options"` | 打开或关闭选项的按钮。|
| `"info"` | 打开或关闭信息的按钮。|
| `"navigation"` | 当 `ui.mode` 为 `"tree"` 时显示标准树，或者在深度嵌入中显示来源页面；"默认的左侧面板"。在没有深度导航的情况下，`"single"` 模式下不显示内容。|
| `"origin"` | 深度嵌入访问的来源页面（如适用）。|
| `"content"` | 选中的层页面或当前深度嵌入。在整个布局中只能出现一次。|

### 行与列

使用 `type: "row"` 表示水平组，使用 `type: "column"` 表示垂直组。两者都接受通用字段，并且有：

- `children` {类型: ShellLayoutNode[]} {必填}  
嵌套节点，按数组顺序渲染。可以包含更多的行、列或标签组。

### 文本

使用 `type: "text"` 显示任意文本。接受通用字段，并且有：

- `text` {类型: string} {必填} {回调} {html}  
节点中显示的内容。

### 按钮

使用 `type: "button"` 来创建自定义按钮。接受常用字段以及：

- `label` {类型: string} {必填} {回调} {html}  
按钮文本内容。
- `canClick` {类型: boolean} {可选} {回调}  
控制按钮是否可以点击。默认值为 `true`。
- `onClick` {类型: void} {必填} {仅回调}  
当按钮被点击且 `canClick` 为 `true` 时执行 `onClick(context)`。接收一个可写的修改上下文。



## 示例

### 重命名已保存的自定义状态

假设版本1将`energy`存储在`prestige`层，版本2称之为`charge`。更新该层的`startState`和游戏代码，使用`charge`，然后将以下字段添加到模组定义中：

```js
saveVersion: 2,
migrateSave(state, fromVersion) {
    if (fromVersion < 2) {
        const layers = state.layers;
        const { energy, ...remainingFields } = layers.prestige;

        return {
            ...state,
            layers: {
                ...layers,
                prestige: { ...remainingFields, charge: energy }
            }
        };
    }

    return state;
}
```