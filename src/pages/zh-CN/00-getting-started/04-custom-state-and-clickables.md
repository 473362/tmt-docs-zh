# 自定义状态和可点击元素

让我们给声望层增加能量。它每秒增加1，一个可点击元素可以用5能量兑换10点数。

能量将是我们自己的保存字段，独立于该层内置的声望点数。

## 创建保存状态

从 `"tmt"` 的导入中添加 `Decimal`。然后在 `startState` 返回的对象中添加 `energy`：

```js
startState: () => ({
  unlocked: true,
  energy: new Decimal(0)
})
```

这里返回的字段将成为该层保存状态的一部分。在此层的回调中，可以通过 `context.layerState.energy` 获取当前的能量余额。从模块回调或其他层，使用 `context.stateOf(prestige).energy`。

## 生成能量

在 `setup` 中添加一个 `update` 回调：

```js
update(context, delta) {
  const state = context.layerState;
  state.energy = state.energy.add(delta);
}
```

`delta` 是以秒为单位的经过时间。相加可以实现每秒增加1能量，无论引擎多久更新一次。如果每秒增加5，则用 `new Decimal(5).mul(delta)`。

不同于 `pointGain`，这是一个写入钩子。我们要把结果分配回 `state.energy` 来改变保存的余额。

:::tip 使用经过时间/增量时间
总是把每秒收益乘以 `delta`。在每次更新中固定增加会让产量依赖于更新时间频率。在离线时也会得到错误结果，因为引擎会在一次更新中推进经过的时间。
:::

## 用可点击按钮消耗它

我们的可点击按钮和大多数按钮一样，会有一个 `canClick` 计算和一个 `onClick` 动作：

```js
clickables: {
    releaseEnergy: {
        title: "释放能量",
        display: "花费 5 能量获得 10 点数",
        canClick: context => context.layerState.energy.gte(5),
        onClick(context) {
            const state = context.layerState;
            state.energy = state.energy.sub(5);
            context.addResource(points, 10);
        }
    }
}
```

把它放在 `upgrades` 集合下面。

`.gte(5)` 会检查能量是否大于或等于 5。一旦按钮可用，点击它会减少能量并通过导入的 `points` 资源增加 点数。

可点击按钮没有内置的消耗，所以动作会执行支付。在这里，`canClick` 能防止玩家在能量不足时使用按钮。

## 显示余额

我们给声望页面一个简单的布局：主要信息、能量显示、升级和可点击按钮。

自定义 `ui.page`（也在 `setup` 内）会替代默认布局。包涵你希望玩家看到的每个部分。

一个简单的自定义页面可以是这样：

```js
ui: {
    page: [
        {type: "section", feature: "main"},
        {
            type: "text",
            text: context => `你有 ${format(context.layerState.energy)} 能量！`
        },
        {type: "section", feature: "upgrades"},
        {type: "section", feature: "clickables"}
    ]
}
```

`format`函数会把 Decimal 转换成显示文本。

## 尝试一下

刷新页面，等待至少5能量，然后点击“释放能量”。能量应该会减少5，而点数会增加10，同时正常生成仍然进行。

通过设置保存，然后再次刷新。你的能量和升级拥有情况应该还在。能量在普通的声望重置中也会在它自己的层级中保留。

对于可以通过标准消耗字段花费的自定义资源升级或可购买物品，请参见 [defineResource](01/03)。我们的可点击物可以直接使用保存的状态，因为它自己处理支付。

接下来，我们将使用你在 [再加一层](00/05) 中学到的内容。