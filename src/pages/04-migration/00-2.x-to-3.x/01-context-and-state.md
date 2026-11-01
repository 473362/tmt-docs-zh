# 上下文和状态

在 2.x 版本中，大多数游戏代码会读取全局的 `player`、`layers` 和 `tmp` 对象。在 3.x 版本中，回调函数会收到一个包含状态和可用操作的上下文。

层句柄用来标识层。它不是层保存的状态，所以 `prestige.points` 是一种货币资源句柄，而不是玩家当前余额。

## 读取状态

| 2.x | 3.x |
| --- | --- |
| `player.points` | `context.player.points` |
| `player.p.points` | `context.stateOf(prestige).points` |
| `player[this.layer].points` | 在层或物品回调中使用 `context.layerState.points` |
| `this.layer` | `context.layer` |
| `this.id` | 在物品回调中使用 `context.id` |
| `tmp.p.effect` | `context.getLayerEffect(prestige)` |
| `tmp.p.resetGain` | `context.getResetGain(prestige)` |
| `tmp.p.nextAt` | `context.getNextRequirement(prestige)` |
| `tmp.p.canReset` | `context.canReset(prestige)` |

没有整个 `tmp` 对象的替代方案。使用相关的 getter 或通过模块函数共享计算。完整的 getter 和 setter 列表请参见 [context](01/06)。

引擎不会把旧的定义对象绑定为 `this`。一个在 2.x 中调用 `this.cost()` 或读取 `this.layer` 的方法需要使用上下文或普通的辅助函数。

## 全局辅助函数变成上下文方法

这些示例使用了一个名为 `prestige` 的导入句柄，其层 ID 为 `"p"`：

| 2.x | 3.x |
| --- | --- |
| `hasUpgrade("p", 11)` | `context.hasUpgrade("11", prestige)` |
| `upgradeEffect("p", 11)` | `context.getUpgradeEffect("11", prestige)` |
| `getBuyableAmount("p", 11)` | `context.getBuyableAmount("11", prestige)` |
| `setBuyableAmount("p", 11, value)` | `context.stateOf(prestige).buyables["11"] = new Decimal(value)` |
| `buyableEffect("p", 11)` | `context.getBuyableEffect("11", prestige)` |
| `hasMilestone("p", 0)` | `context.hasMilestone("0", prestige)` |
| `hasAchievement("p", 11)` | `context.hasAchievement("11", prestige)` |
| `inChallenge("p", 11)` | `context.inChallenge("11", prestige)` |
| `challengeCompletions("p", 11)` | `context.getChallengeCompletions("11", prestige)` |
| `challengeEffect("p", 11)` | `context.getChallengeEffect("11", prestige)` |
| `getClickableState("p", 11)` | `context.getClickableState("11", prestige)` |
| `setClickableState("p", 11, value)` | `context.setClickableState("11", value, prestige)` |
| `buyUpgrade("p", 11)` | `context.buyUpgrade("11", prestige)` |
| `doReset("p")` | `context.reset(prestige)` |
| `doReset("p", true)` | 查看 `context.forceReset({ layer: prestige })` 及其源重置行为 |

注意新的顺序：先是项目 ID，后是层句柄。这是因为层默认指向调用它的层，所以在自引用检查中可以完全省略句柄。

项目 ID 使用字符串，即使你保留了旧游戏中的键如 `"11"`。

当效果不存在或被抑制时，效果获取器可能返回 `undefined`。使用符合你公式的中性值，例如针对乘数可以写 `context.getUpgradeEffect("11") ?? 1`。效果仍然需要由你自己的计算来应用。


## 阅读和写入有不同的作用

像成本、效果、描述和解锁条件这样的回调只是读取状态。像 `update`、`onClick` 和 `onPurchase` 这样的钩子可以改变状态。

这个旧的 update：

```js
update(diff) {
    player[this.layer].energy = player[this.layer].energy.add(diff);
}
```

在层的 setup 内容中会变成这样：

```js
update(context, delta) {
    const state = context.layerState;
    state.energy = state.energy.add(delta);
}
```

在 `startState` 中用 `new Decimal(0)` 初始化 `energy`。这里的 `diff` 和新的 `delta` 都表示秒数。

不要把隐藏在 2.x 效果或显示回调里的写操作直接带到新的读取回调里。把这些操作移到写入钩子里。

:::warning 上下文会过期
上下文及其运行的方法只属于当前回调。不要把它们保存在模块变量、定时器或 Promise 中。之后的回调必须使用自己的上下文。在重置替换层状态后，再写入前需要重新获取上下文。
:::

## 自定义保存字段

将 `startData` 字段移动到 `startState`。将 `addedPlayerData()` 的字段也移动到一个层中。根玩家字段集是不可变的。

例如，一个保存的自动化设置和第二个货币可以这样开始：

```js
startState: () => ({
    unlocked: true,
    auto: false,
    energy: new Decimal(0)
})
```

所有权存储也发生了变化。升级、里程碑和成就使用像 `{ "11": true }` 这样的记录，而不是拥有 ID 的数组。在进行游戏性检查时使用上下文辅助函数，并在转换存档时将旧数组转换。

保存的自定义值会整体替换匹配的默认值。在保存的嵌套对象中添加字段不会递归填充到旧存档中。参见 [加载与迁移](01/09?s=loading-and-migration) 和 [存档及版本检查](04/00/05) 。