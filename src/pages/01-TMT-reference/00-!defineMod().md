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