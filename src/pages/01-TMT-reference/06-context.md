# 上下文

`context` 是回调读取保存的状态并执行游戏操作的方式。

本页使用的共享类型：

- `DecimalSource` {type:Decimal | ReadonlyDecimal | number | string}  
可用于 Decimal 类型字段和运算的输入。更多信息请参见 [Decimal](01/04)。
- `Decimal` {type:对象}  
带有算术和比较方法的数值。更多信息请参见 [Decimal](01/04)。
- `ReadonlyDecimal` {type:受保护的 Decimal}  
支持 Decimal 计算，但不允许修改其值。更多信息请参见 [Decimal](01/04)。
- `LayerHandle` {type:层标识}  
由 [defineLayer](01/01) 返回。仅暴露层的 `id` 和 `points` 资源，使用上下文访问其状态。
- `DecimalResource` {type:资源标识}  
通过导出的 `points`、层的 `points` 或 [defineResource](01/03) 来识别货币。暴露其 `name` 和 `owner`。
- `PlayerState` {type:对象}  
主要保存的状态。其字段请参见 [Main Player Context](01/06?s=main-player-context)。
- `LayerState` {type:对象}  
实际层状态，将引擎字段与 `startState` 的自定义字段结合。字段及默认值请参见 [defineLayer 的 startState](01/01?s=2)。

## 上下文

### 主玩家上下文

以下字段可以直接通过 `context.player` 访问：

- `points` {type: Decimal} {required}  
主货币余额。初始值为 `info.initialPoints`。
- `timePlayed` {type: number} {required}  
游戏时间（秒），包括离线时间。
- `won` {type: boolean} {required}  
是否达到了游戏结束条件。
- `keepGoing` {type: boolean} {required}  
玩家是否选择在获胜后继续游戏。获胜的游戏会暂停，直到这个值为 `true`。
- `activeLayer` {type: string} {required}  
持久选择的图层 ID。深层导航有自己的临时栈，不会设置此字段。

### 模组上下文

`ModReadContext` 用于模组计算、资源获取器和节点显示回调。`ModWriteContext` 用于模组更新钩子、资源设置器和节点点击钩子。

- `player` {type: PlayerState} {required}  
读取上下文保护此状态不被修改，写入上下文允许更改其现有字段。

### 图层上下文

`LayerReadContext` 和 `LayerWriteContext` 会将当前图层和默认的本地操作添加到其中。

- `layer` {type: LayerHandle} {必填}  
当前图层的句柄。
- `layerState` {type: LayerState} {必填}  
当前图层状态。访问权限与 `stateOf(context.layer)` 相同。

图层回调、进度条、页面布局计算和快捷键都会使用这些上下文。

### 物品上下文

`ItemReadContext` 和 `ItemWriteContext` 会将当前物品添加到图层上下文中。升级、可购买物品、挑战、里程碑、成就、信息框和表单在回调中使用物品上下文。

- `id` {type: string} {必填}  
当前物品的 ID。它属于正在运行回调的集合。

### 可点击上下文

`ClickableReadContext` 和 `ClickableWriteContext` 还提供：

- `value` {type: 推断的可点击值} {必填}  
当前可点击元素的值，即使在写入钩子中也不能直接修改。用 `initialValue` 初始化它。

`setValue(value)` 可从可点击写入钩子中替换整个值。详细说明请参见下文。

### 网格上下文

`GridCellReadContext` 和 `GridCellWriteContext` 提供：

- `row` {type: number} {必填}  
  单元格行，从 `1` 开始。
- `column` {type: number} {必填}  
  单元格列，从 `1` 开始。
- `key` {type: string} {必填}  
  单元格地址，例如 `"2:3"`。
- `data` {type: 推断的网格数据} {必填}  
  当前单元格的值。在网格写入钩子中可以修改嵌套数据。要替换整个值，使用 `setGridData`，因为上下文属性本身不能被直接修改。

网格尺寸使用层上下文。单元格计算和交互使用网格上下文。

### 重置上下文

`retention` 使用 `ResetReadContext`，`onReset` 使用 `ResetContext`。它们当前的层是重置目标。

- `kind` {type: "self" | "incoming"} {必填}  
  正在发生的重置type。
- `cause` {type: "prestige" | "challenge-enter" | "challenge-exit" | "forced"} {必填}  
  启动重置的操作。
- `source` {type: LayerHandle} {必填}  
  发起重置的层。
- `target` {type: LayerHandle} {必填}  
  状态正在被处理的层。
- `gain` {type: ReadonlyDecimal} {必填}  
  授予的声望货币。强制和挑战重置使用 `0`。
- `previousTargetState` {type: LayerState} {当目标状态被重置时必填}  
  旧目标状态的只读视图。

关于重置和保留的更多信息，请参见 [defineLayer](01/01?s=4)。

## 可购买

### buyUpgrade(id, layer) {type: boolean}

购买一个升级。检查花费和可负担性，支付费用，记录拥有情况，然后调用 `onPurchase`。

### buyBuyable(id, layer) {type: boolean}

购买一个可购买项目的一个等级。检查可见性、可负担性和购买限制，然后在 `onPurchase` 之前执行支付和等级增加。

### buyMaxBuyable(id, layer) {type: boolean}

在普通购买资格检查之后运行可购买项目的 `buyMax` 钩子。如果没有该钩子则返回 `false`。它不会反复购买单个等级，也不会自动花费、增加或调用 `onPurchase`。

### sellOneBuyable(id, layer) {type: boolean}

在可用性和 `canSellOne` 检查之后运行可购买项目的 `sellOne` 钩子。如果没有该钩子则返回 `false`。

### sellAllBuyable(id, layer) {type: boolean}

在可用性和 `canSellAll` 检查之后运行可购买项目的 `sellAll` 钩子。

### respecBuyables(layer) {type: boolean}

运行 `buyableRespec.onRespec` 钩子。不会打开 UI 确认对话框。

## 可点击

### setClickableState(id, value, layer) {type: boolean}

替换已保存的值。可以更新锁定、隐藏或停用的功能。写入后返回 `true`。

### setValue(value) {type: boolean}

可在可点击写入上下文中使用。使用与 `setClickableState` 相同的规则替换该可点击项的值。

### clickClickable(id, layer) {type: boolean}

检查交互资格并运行 `onClick`。没有钩子时，切换布尔值。

### holdClickable(id, interval, layer) {type: boolean}

运行可点击项的 `onHold` 钩子。没有该钩子时返回 `false`。不会自动启动计时器或重复执行。

## 网格

### setGridData(key, value, layer) {type: boolean}

也可以使用 `setGridData(row, column, value, layer)`。替换网格单元格的值。有效写入后返回 `true`。

### clickGrid(key, layer) {type: boolean}

也可以使用 `clickGrid(row, column, layer)`。触发网格单元格的 `onClick` 钩子。

### holdGrid(key, interval, layer) {type: boolean}

也可以使用 `holdGrid(row, column, interval, layer)`。触发网格单元格的长按钩子。不启动长按计时器。

## 挑战

### enterChallenge(id, layer) {type: boolean}

当当前没有挑战进行中且该挑战未达上限时进入挑战。运行其进入挑战的重置，然后调用 `onEnter`。

### completeChallenge(id, layer) {type: boolean}

尝试给当前挑战 ID 的完成次数发放奖励。奖励最多不超过完成限制。成功时调用 `onComplete` 并保持挑战处于激活状态。奖励失败返回 `false`。

### exitChallenge(id, layer) {type: boolean}

检查当前挑战 ID 的退出条件，尝试一次完成，清除激活 ID，调用 `onExit`，然后运行挑战退出重置。默认的完成按钮使用此退出操作。

## 里程碑

### toggleMilestone(id, toggleIndex, layer) {type: boolean}

- `toggleIndex` {type: number} {required}
要切换的切换项索引。索引超出定义列表范围返回 `false`。

反转里程碑切换项的状态。

## 表单

### setInput(id, value, layer) {type: boolean}

检查图层和表单的可用性，规范化提交的值，写入值或调用绑定的设置器，然后触发 `onChange`。滑块会限制在边界内，但不会四舍五入到 `step`。不可用的下拉选项会返回 `false`。

## 弹出窗口和模态框

以下写入方法在 [弹出窗口和模态框](01/08) 中进行了说明：

- `popup(request)` {type: void}  \
排队一个弹出窗口。
- `alert(options, onClose)` {type: void}  
打开一个信息模态框。
- `confirm(options, onResult)` {type: void}  
打开一个确认模态框。
- `prompt(options, onResult)` {type: void}  
打开一个需要玩家输入的模态框。