# 层和重置

3.x 的层将元数据、初始状态和游戏内容分开。把内容移动到 `setup` 中，然后在添加层的其他功能之前检查重置行为。

## 从 addLayer 到 defineLayer

一个小的 2.x 的层可能看起来像这样：


```js
addLayer("p", {
    name: "Prestige",
    symbol: "P",
    color: "#4caf50",
    row: 0,
    resource: "声望点数",
    startData() {
        return { unlocked: true, points: new Decimal(0) };
    },
    baseResource: "points",
    baseAmount() { return player.points; },
    requires: new Decimal(10),
    type: "normal",
    exponent: 0.5,
    upgrades: {
        11: { title: "更好的工具", description: "点数翻倍", cost: new Decimal(1) }
    }
});
```

它的 3.x 版本可以是 `src/prestige.js`：


```js
import { defineLayer, points } from "tmt";

export const prestige = defineLayer({
    id: "p",
    name: "Prestige",
    symbol: "P",
    color: "#4caf50",
    row: 0,
    resource: "声望点数",

    startState: () => ({ unlocked: true }),

    setup: define => define({
        reset: {
            type: "normal",
            resource: points,
            requires: 10,
            exponent: 0.5
        },
        upgrades: {
            "11": {
                title: "更好的工具",
                description: "点数翻倍",
                cost: 1
            }
        }
    })
});
```

这个层保持了 ID `"p"`，但是它导出的 handle 变量不一定要同名。这个 mod 包含了 `prestige` handle，并在 `pointGain` 中应用升级的倍增，如 [项目和 Mod 设置](04/00/00) 所示。

起始点数默认为零。`setup` 只会调用一次 `define`，它不是每刻调用的钩子。

## 移动层字段

| 2.x | 3.x |
| --- | --- |
| `startData` | 外层定义上的 `startState` |
| `type`, `requires`, `exponent`, `base` | `setup` 的 `reset` 内对应的字段 |
| `baseAmount`, `baseResource` | 一个 `reset.resource` 句柄 |
| `gainMult` | `reset.gainMultiplier` |
| `gainExp` | `reset.gainExponent` |
| `directMult` | `reset.finalMultiplier` |
| `softcap` | `reset.softcapStart` |
| `softcapPower` | `reset.softcapPower` |
| `canBuyMax` | 静态重置的 `reset.canMax` |
| `getResetGain` | `reset.gain(context)` |
| `getNextAt` | `reset.nextRequirement(context)` |
| `canReset` | 自定义重置的 `reset.canReset(context)` |
| `prestigeButtonText` | `ui.resetButtonText` |
| `resetDescription` | `ui.resetDescription` |
| `effect`, `effectDescription` | 在 setup 内容内保持相同名称 |
| 定义 `deactivated` | 保存状态 `deactivated`，通过 `startState` 初始化 |
| `update(diff)` | 在 setup 内容内为 `update(context, delta)` |
| `automate()` | 在 setup 内容内为 `automate(context)` |

主货币使用导出的 `points`，其他层使用它们自己的 `.points`，或者用 [defineResource](01/03) 定义自定义资源。资源设置器也告诉引擎在重置时如何清空该余额。

## 解锁是独立的

在旧的声望流程中，第一次重置就可以解锁一个层。在3.x中，需要在 `startState` 中设置其初始可用性，或在 setup 中提供一个 `unlock` 计算：

```js
unlock: context => context.player.points.gte(10)
```

起始层默认是解锁的，其他所有层默认是锁定的。一旦 `unlock` 成功，保存的标记就会保持为真。树状的可见性本身并不会解锁层。

## 检查公式

常规和静态公式依旧熟悉，但别以为每个旧的边缘情况都还能用：

- 静态重置需要一个明确大于 1 的 `base`。
- 公式的因子必须是正数且有限。对于依赖零、负数或无限因子的行为，使用自定义重置。
- 常规重置**没有默认软顶**，除非你提供了 `softcapStart`。如果需保留旧的软顶，包括你平衡依赖的旧默认值，也可以带上。
- `gain` 和 `nextRequirement` 的重写会获取上下文。旧的 `getNextAt(canMax, useType)` 调用方式不再沿用。
- `roundUpCost` 没有直接字段。如果游戏需要四舍五入，请在计算需求时显式处理。
- 自定义重置提供 `gain`、`canReset` 和 `nextRequirement`。它的增益不会自动向下取整。

对比结果时，可看第一个需求的上下方，在软顶附近，以及若干静态数量的情况。对于静态重置，`gainMultiplier` 仍会乘以成本，所以数值越大重置就越贵。

具体公式见 [defineLayer](01/01)。

## 被动生成与自动化

:::warning 被动生成现在是速率
在 2.x 版本中，`passiveGeneration` 会乘以该层计算的重置增益。在 3.x 版本中，它是每秒实际获得的资源。直接复制 `passiveGeneration: 0.1` 每秒只会获得 0.1 资源。

要保留每秒百分之十的重置增益，请使用：

```js
passiveGeneration: context => context.getResetGain().mul(0.1)
```
:::

现在没有 `autoPrestige` 或 `autoUpgrade`。请将相关自动化功能添加到 `automate` 中，并保持你原有的资格条件：

```js
automate(context) {
    if (!context.layerState.unlocked) return;
    if (context.canReset()) context.reset();
    context.buyUpgrade("11");
}
```

这些命令会自行检查是否可以购买。它们的顺序很重要，尤其是在重置会改变购买所需资源时。