# 游戏玩法特色

把特征集合放进传递的对象里，在层设置中“定义”。大多数集合仍然是用ID键入的对象，所以移植时可以保留旧ID。

在上下文调用和引用中使用字符串ID。像“11”这样的键不再自动将项目放置在第1行第1列。布局是单独处理的。

## 升级

“标题”、“描述”、“费用”、“解锁”、“效果”和“onPurchase”依然存在，但它们的回调会获得上下文。支持该功能的“标记”会变成“标记”。

将“currencyInternalName”、“currencyLayer”和“currencyLocation”替换为一个“currency”资源句柄。使用导出的“points”、层的“.points”或[defineResource]（01/03）中的句柄。

正常购买会扣除成本并记录所有权。自定义的“pay（context， cost）”替代付款，“onPurchase（context）”在购买后运行。不要在“onPurchase”中重复标准付款。

“canAfford”会加一个条件。返回真实并不能绕过货币检查。

## 可购买

3.x 里默认的购买操作是：支付当前价格，数量增加一，并调用 `onPurchase`。而普通的 2.x 可购买项通常会完全失去自定义的 `buy` 方法。

例如，这个 setup 字段定义了一个每次价格翻倍的可购买项：

```js
buyables: {
  "11": {
    title: "生成器",
    cost: context => new Decimal(2).pow(context.getBuyableAmount("11")),
    display: context => `你拥有 ${format(context.getBuyableAmount("11"))} 个生成器`,
    effect: context => context.getBuyableAmount("11").add(1)
  }
}
```

从 `"tmt"` 导入 `Decimal` 和 `format`。价格默认为本层货币。在旧效果被用到的地方，将发电机效果应用到你的生产公式中。

旧的 `cost(x)` 和 `effect(x)` 参数现在变成了 context。通过 `context.getBuyableAmount` 获取当前数量，或者把假设数量的计算放到辅助函数如 `costAt(amount)`。

:::warning 自定义购买控制支付
如果你保留了 `buy(context, cost)`，它会替代默认的支付和数量增加。要么省略它并使用默认操作，要么自己实现两个操作。正常购买后额外操作可以用 `onPurchase`。
:::

“买到最大”、“出售”和重置仍然需要你自己实现。自定义 Buy Max 并不会自动为每个等级调用 `onPurchase`。

将重置配置移出 buyables 集合：

| 2.x buyables-level 字段 | 3.x setup 字段 |
| --- | --- |
| `respec` | `buyableRespec.onRespec(context)` |
| `respecText` | `buyableRespec.label` |
| `respecMessage` | `buyableRespec.confirmation` |
| `showRespec` | `buyableRespec.unlocked` |

重置钩子控制退款、数量变化和重置。任何保存的重置数据都放在你自定义的层状态里，引擎不会再帮你维护旧的 `spentOnBuyables` 字段。

## 可点击

用 `initialValue` 初始化一个项目的值。通过 `context.value` 读取它，并使用 `context.setValue` 来替换它：

```js
clickables: {
  "11": {
  initialValue: false,
    display: context => context.value ? "自动化：开启" : "自动化：关闭",
    onClick(context) {
      context.setValue(!context.value);
    }
  }
}
```

可点击值现在支持任何可保存的值，包括嵌套数据。

请注意，即使在写入钩子中，`context.value` 也是受保护的，你必须使用 setter。

`onHold(context, interval)` 会接收增量秒数。用这个间隔来执行每秒操作，而不是依赖旧的固定调用频率。

没有可点击元素级别的主按钮字段。为该操作定义一个普通的可点击元素，并将它放在布局中你想要的位置。


## 挑战

| 2.x | 3.x |
| --- | --- |
| `name` | `title` |
| `challengeDescription` | `description` |
| `rewardEffect` | `effect` |
| 目标货币定位字段 | `goalResource` |
| `countsAs: [11, 12]` | `countsAs: ["11", "12"]` |
| 批量完成时 `canComplete` 的数值结果 | 布尔值 `canComplete` 加上 `completionGain` |
| `onComplete()` | `onComplete(context, gained, total)` |

:::note 挑战目标默认使用层货币
旧的基于目标的挑战通常使用点数。在 3.x 中，当目标需要检测点数时，请指定 `goalResource: points`。
:::

例如，导入 `points` 后：

```js
challenges: {
"11": {
title: "扩张",
description: "主要点数收益是根源化的",
goal: 100,
goalResource: points,
goalDescription: "达到 100 点",
rewardDescription: "点数收益翻倍！",
effect: () => 2
}
}
```

在模组的 `pointGain` 中，使用 `context.inChallenge("11", prestige)` 计算惩罚，使用 `context.getChallengeEffect("11", prestige) ?? 1` 计算奖励倍数。

进入和退出挑战会重置其源层，同时保留完成历史。检查任何旧的 `doReset` 特殊情况，并将需要保留的部分转移到 retention。`countsAs` 直接匹配列出的挑战，不会递归触发。

## 里程碑和成就

保持里程碑的 `requirementDescription`、`effectDescription` 和 `done`，并为回调添加上下文。成就的 `name` 改为 `title`。使用 `description` 来解释成就。

里程碑切换现在通过 getter 和 setter 来控制。例如，在 `startState` 包含 `auto: false` 的层中，一个里程碑可以如下设置：

```js
toggles: [{
label: "自动声望",
value: {
get: context => context.layerState.auto,
set(context, value) { context.layerState.auto = value; }
}
}]
```

如果里程碑控制自动化权限，请在自动化中保留里程碑检查。保存的切换本身并不能证明里程碑当前是激活状态。

旧的每层 `milestonePopups` 和 `achievementPopups` 字段不再支持。`defineMod.ui.notifications` 配置共享弹出系统。

## 网格

旧的网格 ID `101` 会变为 `"1:1"`，`102` 变为 `"1:2"`，`201` 变为 `"2:1"`。保存的键也要一起转换。

| 2.x | 3.x |
| --- | --- |
| `cols` | `columns` |
| `getStartData(id)` | `startData(context)` |
| `getDisplay(data, id)` | `display(context)` |
| `getTitle`、`getTooltip`、`getStyle`、`getEffect` | `title`、`tooltip`、`style`、`effect` |
| `getUnlocked`、`getCanClick` | `unlocked`、`canClick` |
| `onClick(data, id)` | `onClick(context)` |
| `maxRows`、`maxCols` | 不支持 |

单元格上下文会提供 `row`、`column`、`key` 和 `data`。例如：

```js
grid: {
  rows: 2,
  columns: 2,
  startData: () => 0,
  display: context => String(context.data),
  onClick(context) {
    context.setGridData(context.key, context.data + 1);
  }
}
```


## 其他改变

使用 `context.getGridData(1, 1)` 来获取坐标，或者用 `context.getGridData("1:1")` 来获取键。在 mod 上下文中，也可以传入层句柄。

- 信息框保留 `title` 和 `body`。更新它们的回调以使用上下文。
- 条形使用字符串方向，如 `"right"` 和 `"up"`。替换旧的方向全局变量。
- 特性分支使用 ID 或 `{ target, color, width }` 对象。替换位置分支元组和数字主题颜色。

查看相关的 [defineLayer 字段](01/01)，而不是复制每个旧属性。一些 2.x 特性专用的显示和工具提示字段在新特性中没有对应字段。

接下来，将转换后的特性安排在 [页面和树](04/00/04) 中。