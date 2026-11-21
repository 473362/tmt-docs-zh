# 添加另一层

我们下一层会把声望点数转化为水晶。水晶会增加主点数的增益，但获得它们会重置声望层的进度。

## 创建层

创建 `src/crystals.js`。在继续阅读之前，先尝试创建一个具有以下属性的层：

- 叫它 `crystals`，并确保 `id`、`name`、`symbol`、`color` 和 `resource` 字段符合这个概念。
- 放在 `prestige` 这一行之上。
- 玩家拥有≥5的声望点数时解锁。你可以在 `setup` 中使用 `unlock` 回调来实现。
- 使用声望点数作为资源进行简单重置。公式因子可以和 `prestige` 一样，如果你愿意可以保持相同。
- 提供一个 `effectDescription` 来说明水晶的效果。内容可以随意，但隐藏示例和教程的其他部分都将其视为点数增益的倍数。

<details>
<summary><b>点击这里查看水晶层。先尝试自己创建吧！</b></summary>

```js
import {defineLayer, format} from "tmt";
import {prestige} from "./prestige.js";

export const crystals = defineLayer({
    id: "crystals",
    name: "Crystals",
    symbol: "C",
    color: "#70b7ff",
    row: 1,
    resource: "crystals",

    setup: define => define({
        unlock: context => context.stateOf(prestige).points.gte(5),

        reset: {
            type: "normal",
            resource: prestige.points,
            requires: 10,
            exponent: 0.5
        },

        effectDescription: context => `你的水晶将点数增益乘以 ${format(context.layerState.points.add(1))}.`
    })
});
```

</details>

## 将其加入游戏

在 `main.js` 中导入新的 handle 并将其添加到 `layers`。我们还会扩展 `pointGain` 以使用它的倍数：

```js
pointGain(context) {
    let gain = context.stateOf(prestige).points.add(1);

    if (context.hasUpgrade("doubleGain", prestige)) {
    gain = gain.mul(2);
    }

    return gain.mul(context.stateOf(crystals).points.add(1));
}
```

当水晶为零时，倍数为一，所以添加此层不会降低现有速率。一个水晶会使其翻倍，两个则三倍，以此类推。

`crystals.js` 中的效果描述显示了倍数。但实际上是 `main.js` 中的计算才会应用它。

## 哪些内容会被重置？

默认情况下，一个层会重置逻辑行数比它低的其他层。水晶在第 `1` 行，所以重置水晶会重置第 `0` 行的声望。这会清除声望点、翻倍器和自定义能量。但声望依然是解锁状态。

你可以通过正在被重置的层上的 `retention` 来选择哪些内容可以保留。这里我们还没添加保留，所以声望进度的损失是水晶重置的代价之一。当你准备更改这些规则时，可以查看 [defineLayer](01/01)。

## 试一试

1. 刷新游戏，并至少赚取十个声望点，或者你自己设置的要求数量。
2. 选择新的 `crystals` 节点并重置获得水晶。
3. 返回 `prestige` 页面。升级应该会恢复未购买状态，能量将从零重新开始。
4. 再次赚取声望点并购买翻倍器。水晶倍数会帮助你更快地重建进度。

现在你有了两个关联的层，可以重置并重新努力。继续前往 [完成](00/06) 给游戏设定一个目标。