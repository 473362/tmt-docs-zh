# defineLayer()

defineLayer 是你创建层的方式，这是你最常用的东西，你会在里面创建你游戏的所有内容。

将返回的句柄添加到 [defineMod](01/00) 的 `layers` 属性中。

defineLayer() 内的运行时回调会接收一个 [context](01/06)，除非另有说明。`startState` 和 `setup` 有它们自己的签名，详细说明如下。

层定义包含三部分：元数据、`startState` 和 `setup`。因为篇幅较大，`setup` 分成多部分进行文档说明。

本页使用的共享类型：

- `StyleValue` {type: Record<string, string | number | undefined>}
将 CSS 属性名称映射到其值。支持的值和覆盖方式请参见 [Styling](01/11)。
- `ClassValue` {type: string | string[] | Record<string, boolean>}
可以应用以空格分隔的类名、类名列表，或一个映射表来判断是否应用某个类。示例见 [Styling](01/11)。
- `DecimalSource` {type: Decimal | ReadonlyDecimal | number | string}
可用于 Decimal 值字段和操作的输入。详情见 [Decimal](01/04)。
- `ReadonlyDecimal` {type: protected Decimal}
支持 Decimal 计算，但不允许修改其表示。详情见 [Decimal](01/04)。
- `LayerHandle` {type: layer identity}
由 [defineLayer](01/01) 返回。只暴露层的 `id` 和 `points` 资源，通过 context 可以访问其状态。
- `NodeHandle` {type: node identity}
由 [defineNode](01/02) 返回。只暴露独立树节点的 `id`。
- `DecimalResource` {type: resource identity}
通过导出的 `points`、层的 `points` 或 [defineResource](01/03) 来识别货币。暴露其 `name` 和提供的 `owner`。
- `LayerState` {type: object}
实际的层状态，结合了引擎字段和 `startState` 的自定义字段，详见下文。
- `FormValue` {type: string | number | boolean | null}
表单控件接受的值。数字必须是有限值。每个表单有自己的规则，见下文。
- `DropdownOption` {type: object}
一个选项，包含显示标签和存储值。其字段列在 Dropdown Form 下。
- `DropdownConfiguration` {type: object}
传给 `define.dropdown` 的表单设置，包括标签、存储或绑定，以及变更回调。不包括 `type` 和 `options`，由助手提供。
- `PersistentValue` {type: null | boolean | string | number | Decimal | PersistentValue[] | Record<string, PersistentValue>}
文档中用于表示引擎可以保存的值的简写。

## 元数据属性

元数据用于识别层并创建其默认外观。

- `id` {type: 字符串} {必要}  
用于标识层。在 mod 中必须在所有层和独立节点中唯一。
- `name` {type: 字符串} {必要}  
为该层命名。
- `symbol` {type: 字符串} {必要}  
决定该层在其树节点上显示的字母或符号。
- `color` {type: 字符串} {必要}  
整个层样式中使用的 CSS 颜色。
- `row` {type: 数字} {必要}  
决定层在重置时的逻辑行，必须是有限值。同时提供默认树行。使用 `tree.row` 可以覆盖视觉行或将层放置在树的左侧或右侧。
- `resource` {type: 字符串} {必要}  
决定层提供的资源名称。无论此值为何层的 点数总是可以通过 `context.stateOf(handle).points` 访问。



## startState {type: plain object} {可选} {callback-only}

以`startState()`运行，用于初始化自定义持久状态和引擎状态字段。值必须与PersistentValue匹配。其他层可以通过`context.stateOf(handle).property`访问该状态。

以下字段控制该层的初始可用性：

- `unlocked` {type:布尔值} {可选}
控制该层是否能被选择。默认由`defineMod`的`info.startLayer`选择的层为`true`，其他层为`false`。在层锁定时，更新、自动化和被动生成仍然会运行。
- `deactivated` {type:布尔值} {可选}
默认为`false`。无法选择已停用的层，不能运行更新、自动化或被动生成，并抑制所有权、效果和源代码发起的重置。但来的重置仍然会影响它们。将该状态从其他层更改，或通过模组的更新回调来重新激活。

其他初始状态字段包括：

- `points` {type:DecimalSource} {可选}
初始层货币。必须是有限的。默认为`0`。
- `best` {type: DecimalSource} {可选}
最高记录货币。必须是有限的。默认初始`点数`值。
- `total` {type: DecimalSource} {可选}
总计记录货币获得。必须是有限的。默认初始`点数`值。
- `resetTime` {type: 数字} {可选}
自层重置以来的几秒钟。必须是有限且非负的。默认为`0`。
- `forceTooltip` {type: boolean} {可选}
保持支持的层和物品工具提示可见。默认为`false`。点击层的树节点Shift会改变它。
- `upgrades` {type: Record<string， true>} {可选}
最初购买的升级，按ID绑定。其他升级被省略。
- `buyable` {type:Record<string， DecimalSource>} {可选}
起始金额按可购买ID划分。价值必须是有限且非负的。其他可购买物品从其`初始金额`开始。
- `clickables` {type:Record<字符串，持久值>} {可选}
起始值按可点击ID表示。其他可点击节点使用其`初始值`。
- `challenges` {type:Record<字符串，编号>} {可选}
通过挑战ID开始完成。计数必须是非负整数。其他挑战完成从`0`开始。
- `activeChallenge` {type: 字符串 | null} {可选}
初始挑战ID。默认为`null`。
- `milestones` {type:Record<string， true>} {可选}
初始获得里程碑ID。默认为无。这里的初始化不会触发完成钩子。
- `achievements` {type: Record<string， true>} {可选}
初始获得成就ID。默认为零。这里的初始化不会触发完成钩子。
- `grid` {type:Record<字符串，PersistentValue>} {可选}
存储单元有效载荷的`行：列`键。默认为无。键必须对该层的网格有效。
- `infoboxes` {type:Record<字符串，布尔值>} {可选}
通过信息框ID开始折叠状态。其他信息框使用他们的`折叠`设置。
- `inputs` {type:Record<string， FormValue>} {可选}
使用引擎自有存储的表单起始值。其他表单使用`defaultValue`。绑定表单此处没有条目。

在可写回调过程中，这些字段可以通过`context.stateOf(handle)`进行更改。

每当创建新层状态时，`startState`都会运行，包括初始化、加载默认值、接收的重置以及重置源的重置。普通的Prestige保持其源状态。

startState 可用于以下情况：

- 按购买方式进行升级启动
```js
startState: () => ({
    upgrades: { startWithThisUpgrade: true }
}),
```

- 在层内创建额外资源
```js
startState: () => ({
    additionalCurrency: new Decimal(96)
}),
```

## 设置：简介和视觉属性 {type:void} {可选} {仅回调}

通过调用 `define` 一次来定义层的游戏内容。通常形式如下：
```js
setup: define => define({ /* 属性写在这里 */ })
```
setup 属性接受很多属性，比你在 TMT 其他地方能找到的都多。

以下是一些与层在树上显示和行为相关的 `setup` 属性。

### unlock {type:boolean} {可选} {回调}

当其计算结果为 `true` 时，将 `unlocked` 设为 true。一旦层被解锁，它不会自动重新锁定。默认为空。

### effect 和 effectDescription

- `effect` {type:any} {可选} {仅回调}
计算通过 `context.getLayerEffect(handle)` 访问的效果。
- `effectDescription` {type:string} {可选} {回调} {html}
显示在层主要重置信息下。

### showBest 和 showTotal

- `showBest` {type:boolean} {可选} {回调}
控制是否显示层达到的最高货币。默认为 true。
- `showTotal` {type:boolean} {可选} {回调}
控制是否显示层获得的总货币。默认为 true。

### tree {type: 对象} {可选}

通过以下属性控制该层在树上的显示效果：

- `row` {type: 数字 | "left" | "right"} {可选}  
覆盖视觉树的行。默认为该层元数据中的 `row`。`"left"` 和 `"right"` 将节点放在树的对应侧。
- `shown` {type: 布尔 | "ghost"} {可选} {回调}  
控制该层是否显示在树上。`"ghost"` 会占据空间但不显示节点。默认值为该层的 `unlocked` 状态。
- `position` {type: 数字} {可选}  
控制该层在视觉行中的位置。必须为有限数。默认为其在 `defineMod` 的 `layers` 属性中的索引。
- `connections` {type: (LayerHandle | NodeHandle | TreeConnection)[]} {可选}  
与模组中其他层或节点的视觉连接。数字行层默认与前一个显示的数字行中可见层相连。侧行层默认没有连接。`[]` 可禁用连接。这些连接不会控制重置。可通过以下字段自定义连接：
  - `target` {type: LayerHandle | NodeHandle} {必要}  
  目标层或节点。
  - `color` {type: 字符串} {可选}  
  连接颜色。默认值为 `"#ffffff"`。
  - `width` {type: 数字} {可选}  
  连接宽度。必须为有限正数。默认值为 `15`。
- `tooltip` {type: 字符串} {可选} {回调} {html}  
控制树节点提示，包括显示锁定节点时的提示。未解锁时默认 `{currency} {currency name}`，锁定时为 `""`。
- `mark` {type: 布尔 | 字符串} {可选} {回调}  
为 `true` 时显示星标，提供 URL 时显示自定义图片，`false` 则不显示标记。默认值为 `false`。
- `image` {type: 字符串} {可选} {回调}  
控制层的树按钮上显示的图片 URL。默认不显示图片，而显示层的符号。
- `actionGlowColor` {type: 字符串} {可选} {回调}  
可操作项通知的 CSS 颜色。默认值为 `"white"`。
- `resetGlowColor` {type: 字符串} {可选} {回调}  
重置通知的 CSS 颜色。默认值为 `"red"`。
- `style` {type: StyleValue} {可选} {回调}  
为树按钮设置样式。属性会覆盖 `ui.componentStyles["tree-node"]` 中的对应值。默认无额外样式。
- `class` {type: ClassValue} {可选} {回调}  
为树按钮应用 CSS 类。默认无额外类。

### shouldNotify 和 resetNotify

- `shouldNotify` {type: boolean} {可选} {回调: boolean | undefined}  
覆盖层的可操作项目通知检查。返回 `undefined` 将使用内置检查，这也是默认行为。
- `resetNotify` {type: boolean} {可选} {回调: boolean | undefined}  
覆盖层的重置通知检查。返回 `undefined` 将使用内置检查，这也是默认行为。

自动操作通知会检查可负担的升级和可购买项目、可点击和网格操作，以及当前活跃挑战的完成情况。自动重置通知使用重置可用性。操作高亮优先于重置高亮。

## 设置：重置和保留

以下是与层重置方式相关的 `setup` 属性。

### reset {type: 对象} {可选}

控制该层的重置功能。默认值是 `{ type: "none" }`。

它接受以下属性来决定它的功能：

- `type` {type: "normal" | "static" | "custom" | "none"} {必要}  
普通重置根据给定货币计算层货币增益。静态重置根据给定货币计算层货币增益，但会根据你当前的货币量调整层货币的成本。自定义重置没有内置的成本或可负担性行为，而是通过回调控制。无重置会禁用重置行为，但仍允许强制和挑战重置。
- `targets` {type: 对象} {可选}  
控制当某层被重置时，会重置哪些其他层。默认会重置元数据 `row` 较低的层。`targets` 通过三个属性配置：
- `include` {type: LayerHandle[]} {可选}  
将层添加到默认目标集合或者显式的 `only` 集合。
- `exclude` {type: LayerHandle[]} {可选}  
从最终目标集合中移除层，包括 `include` 中列出的层。
- `only` {type: LayerHandle[]} {可选}  
使用此列表替代默认基于行的目标集合。之后会应用 `include` 和 `exclude`。

普通和静态重置接受 `resource`、`requires` 以及下面共享的公式因子。软上限字段只适用于普通重置。`base` 和 `canMax` 只适用于静态重置。自定义重置接受 `gain`、`canReset` 和 `nextRequirement`，而不是公式字段。`"none"` 重置只接受 `type` 和 `targets`。

- `resource` {type: DecimalResource} {当：reset.type 是`normal`或`static`时需要}
控制复位增益计算中使用的资源。
- `requires` {type: DecimalSource} {必要时：reset.type 是`normal`还是`static`} {callback}
控制重置获得第一层货币的基础要求。
- `exponent` {type: DecimalSource} {可选} {callback}
在普通重置中，它被应用到资源分配后立即获得的层货币。在静态重置中，它被应用到有效层的货币数量上。默认为1。
- `gainMultiplier` {type: DecimalSource} {可选} {callback}
在正常重置中，指数应用后立即应用于层货币增益。静态重置则是资源需求乘以增加，**作为一种使重置成本提高而非增益倍数的方式。** 默认为1。
- `gainExponent` {type: DecimalSource} {可选} {callback}
在正常重置中，它在应用gainMultiplier后立即应用于货币收益层。在静态重置中，它除以成本指数。默认为1。
- `softcapStart` {type: DecimalSource} {指定时需要 softcapPower } {callback}
仅用于普通重置。在超过此数值时施加软上限，使用`softcapPower`作为其强度。默认为无软上限。
- `softcapPower` {type: DecimalSource} {可选} {callback}
仅用于普通重置。控制层币软上限的强度。激活软上限默认为`0.5`。
- `finalMultiplier` {type: DecimalSource} {可选} {callback}
在正常重置中，如果定义了软上限，则在应用后立即应用到层级货币收益;如果未定义，则在应用gainExponent后再加以指数。在静态重置中，指数应用前会除以层级货币金额。默认为1。
- `base` {type: DecimalSource} {需要时：reset.type is `static`} {callback}
仅用于静态重置。指数成本基必须有限且大于`1`。
- `canMax` {type: boolean} {可选} {callback}
仅用于静态重置。如果为真，静态重置一次可以获得多个点数。实际上是为静态重置启用了`购买上限`。默认为false。
- `gain` {type: DecimalSource} {当 reset.type 是`custom`时需要} {仅回调}
返回复位增益。覆盖正常和静态复位的公式，并为自定义复位提供增益。必须返回有限且非负的值。
- `canReset` {type: boolean} {required when： reset.type is `custom`} {仅回调}
仅可用于自定义重置。决定是否能触发重置。
- `nextRequirement` {type: DecimalSource} {required when： reset.type is `custom`} {仅回调}
返回显示的下一个自定义重置需求，或覆盖其对正常或静态重置的计算。静态重置也使用该值以保证可负担性。必须返回一个有限的正值。


没有 `gain` 覆盖时，普通重置在低于 `requires` 时会获得零增益。否则，其最终增益由以下公式决定：
```text
1. base = (((resource / requires)^exponent) * gainMultiplier)^gainExponent
2. 如果定义了软上限且 base > softcapStart：
   base = base^softcapPower * softcapStart^(1 - softcapPower)
3. gain = max(0, floor(base * finalMultiplier))
```

内置的普通 `nextRequirement` 反解此计算以找到下一个增益需求：
```text
1. requirement = (gain + 1) / finalMultiplier
2. 如果定义了软上限且 requirement > softcapStart：
   requirement = (requirement / softcapStart^(1 - softcapPower))^(1 / softcapPower)
3. nextRequirement = max(requires, requires * ((requirement^(1 / gainExponent) / gainMultiplier)^(1 / exponent)))
```

此需求不会被四舍五入。`gain` 覆盖会更改此反解使用的初始增益，`nextRequirement` 覆盖会直接替换反解本身。

没有 `gain` 或 `nextRequirement` 覆盖时，静态重置的计算如下：
```text
1. nextRequirement = max(requires, requires * gainMultiplier * base^(((layerCurrency / finalMultiplier)^exponent) / gainExponent))
如果 `canMax` 为 false 或 resource < requires，增益为 1。否则：
2. total = floor((log_base(max(1, resource / requires / gainMultiplier)) * gainExponent)^(1 / exponent) * finalMultiplier)
3. gain = max(1, total - layerCurrency   1)
```

普通重置需要正的计算增益，静态重置要求资源大于或等于其下一个需求，自定义重置要求 canReset 返回 true。



### 保留 {type: boolean | RetentionSelection} {可选} {回调函数}

控制在接收到重置或强制自我重置时，哪些状态会被保留。`true` 表示保留整个之前的状态。`false` 表示使用 `startState` 和引擎默认的全新状态。可用标志 `unlocked`、`deactivated` 和 `forceTooltip` 总会在重置后保留。默认值为 `false`。

保留选项接受以下字段：

- `points` {type: boolean} {可选}  
当为 `true` 时，保留之前的层级货币余额。
- `best` {type: boolean} {可选}  
当为 `true` 时，保留之前的最高层级货币记录。
- `total` {type: boolean} {可选}  
当为 `true` 时，保留之前的总层级货币记录。
- `resetTime` {type: boolean} {可选}  
当为 `true` 时，保留之前经过的重置时间。源重置仍会在重置结束时清除其计时器。
- `activeChallenge` {type: boolean} {可选}  
当为 `true` 时，保留之前的活跃挑战。
- `upgrades`、`milestones`、`achievements`、`challenges`、`buyables`、`clickables`、`grid`、`infoboxes` 和 `inputs` {type: boolean | string[]} {可选}  
保留指定的状态条目。列出要保留的 ID，使用 `true` 可保留所有条目，使用 `false` 则不保留任何条目。表单值使用 `inputs`，网格选择使用单元格键。
- `custom` {type: boolean | string[]} {可选}  
保留自定义状态。列出要保留的状态 ID，使用 `true` 可保留所有自定义状态，使用 `false` 则不保留任何状态。


例如：
```js
retention: context => ({
  best: true, // 在重置时保留最佳点数。
  milestones: true, // 在重置时保留所有里程碑。
  upgrades: ["keepThisUpgrade"], // 在重置时保留ID为 "keepThisUpgrade" 的升级
  custom: ["secondaryCurrency"], // 在重置时保留ID为 "secondaryCurrency" 的自定义状态
  points: context.source === superPrestige // 如果本次重置来自 superPrestige 层，则在重置时保留点数
})
```







### onReset {type: void} {可选} {仅回调}

运行方式为 `onReset(context)`，适用于重置的来源以及每个在状态重置后的目标。context 的 `layerState` 属于该目标。有关这里可用的重置元数据以及在评估 `retention` 时的使用，请参见 [重置上下文](01/06?s=reset-contexts)。

普通声望会授予源货币，更新最佳和总计，运行源钩子，重置下排目标，重置基础资源，并重置源的计时器。源本身不会被重置。

`context.forceReset({})` 不会授予货币，并默认保留源状态。`context.forceReset({ resetSource: true })` 会在处理完进入的目标后重置源，然后调用它的钩子。挑战的进入和退出也会重置它们的源，同时保留该源的挑战完成记录。




## 设置：ui 属性 {type: object} {可选}

`ui` 非常强大，可以让你以深度精确的方式配置层的外观。包括基本的区块布局、三种层嵌入方式、为任意组件或组件类定制样式、可嵌套的标签页、可嵌套的列和行等等。到目前为止，是最复杂的 `setup` 属性。

它接受以下属性，以及下面描述的重置文本字段：

- `page` {type: LayoutNode[]} {可选}  
定义层的布局。默认为标准层布局。
- `style` {type: StyleValue} {可选} {回调}  
为层页面设置样式。
- `componentStyles` {type: object} {可选}  
按组件名称配置样式：
- `[componentName]` {type: StyleValue} {可选} {回调}  
为指定组件设置样式。例如，`"tree-node"` 提供共享的树按钮样式。



### 页面布局

`ui.page` 用于排列内置的布局节点。默认顺序是信息框、主要重置信息、里程碑、升级、可购买项、可点击项、挑战、成就、网格、进度条以及表单。`[]` 表示不显示内容。

每个布局节点接受以下字段：

- `type` {type: "section" | "text" | "image" | "spacer" | "toggle" | "row" | "column" | "tabs" | "embed"} {required}  
决定节点的行为和字段类型。类型将在下面详细说明。
- `shown` {type: boolean} {可选} {callback}  
控制节点及其内容是否渲染。默认值为 `true`。
- `style` {type: StyleValue} {可选} {callback}  
设置节点的样式。
- `class` {type: ClassValue} {可选} {callback}  
为节点应用 CSS 类。





#### 部分

使用 `type: "section"` 来渲染内置的功能集合：

- `feature` {type: "main" | "upgrades" | "buyables" | "clickables" | "challenges" | "milestones" | "achievements" | "grid" | "bars" | "infoboxes" | "forms"} {required}  
选择要显示的内容。`"main"` 显示货币、重置控制、最佳/总计、被动获得速率以及层效果描述。
- `title` {type: string} {可选} {callback} {html}  
位于部分上方的标题。会覆盖自动生成的标题。`""` 可隐藏可见标题。
- `layout` {type: "default" | "tree"} {可选}  
默认为 `"default"`。树形布局将升级、可购买物品或可点击物品排列为自己的树状结构。
- `ids` {type: string[]} {可选}  
默认集合部分显示的物品 ID 和顺序。默认显示所有物品。`[]` 表示不显示任何物品。在 `main`、`grid` 或树形布局中不使用。
- `rows` {type: string[][]} {required when: layout is "tree"}  
用于树形布局的物品 ID 行。空行也会占用空间。不能与 `ids` 或默认布局同时使用。

物品分支会在同一树形部分内可见的端点之间绘制。它们不会创建购买前置条件。同一个物品可以出现在多个部分中。



#### 文本、图片和间隔

对于 `type: "text"`：

- `text` {type: 字符串} {必要} {回调} {html}  
节点显示的内容。

对于 `type: "image"`：

- `src` {type: 字符串} {必要} {回调}  
图片的 URL。
- `alt` {type: 字符串} {可选} {回调}  
图片的替代文本。默认值为 `""`。

对于 `type: "spacer"`：

- `size` {type: 数字 | 字符串} {可选}  
以像素或 CSS 尺寸(如 `"2rem"`)表示的间距。默认值为 `"1rem"`。同时应用于宽度和高度。



#### 切换按钮

使用 `type: "toggle"` 来创建由层状态支持的设置：

- `label` {type: 字符串} {必要} {回调} {HTML}  
控制旁边的标签。
- `binding` {type: ValueBinding<boolean>} {必要}  
将控制与支持的状态连接起来。
- `get` {type: 布尔值} {必要} {仅回调}  
以 `get(context)` 形式运行以读取当前设置。
- `set` {type: void} {必要} {仅回调}  
当设置更改时以 `set(context, value)` 形式运行。通过 `startState` 初始化支持状态，引擎不会调用此 setter 来创建默认值。



#### 行和列

使用 `type: "row"` 表示水平组，或 `type: "column"` 表示垂直组：

- `children` {type: LayoutNode[]} {必要}  
嵌套的节点，会按书写顺序显示。

```js
ui: {
    page: [
        { type: "section", feature: "main" },
        {
            type: "row",
            children: [
                { type: "section", feature: "upgrades" },
                { type: "section", feature: "buyables" }
            ]
        }
    ]
}
```




### 标签页

在页面中使用 `type: "tabs"` 来一次显示一个子页面：

- `id` {type: 字符串} {必要}  
标签组 ID，在页面范围内唯一。行、列和嵌套组共享该范围。
- `tabs` {type: TabDefinition[]} {必要}  
按显示顺序的标签列表。至少包含一条目。
- `id` {type: 字符串} {必要}  
标签 ID，在组内唯一。
- `title` {type: 字符串} {必要} {回调}  
标签按钮文本。
- `page` {type: LayoutNode[]} {必要}  
选中该标签时显示的内容。
- `shown` {type: 布尔} {可选} {回调}  
控制标签是否可用。默认值为 `true`。
- `shouldNotify` {type: 布尔} {可选} {回调: 布尔 | 未定义}  
覆盖操作通知。返回 `undefined` 会使用自动检查，这也是默认行为。
- `resetNotify` {type: 布尔} {可选} {回调: 布尔 | 未定义}  
覆盖重置通知。返回 `undefined` 会使用自动检查，这也是默认行为。
- `defaultTab` {type: 字符串} {可选}  
当当前选择不可用时使用的 ID。默认使用第一个可用的标签。
- `equalWidth` {type: 布尔} {可选}  
如果为 `true`，同一嵌套深度和范围的组按钮宽度相等。默认值为 `false`。

选择会停留在可用标签上，否则回退到 `defaultTab`，然后是第一个可用标签。所有标签隐藏时页面不会渲染。标签选择会在普通导航中保留，但不会保存，并且在玩家状态重置时清除。

自动通知会检查标签页面中的功能分类。重置通知需要一个 `main` 部分。嵌入页面不包括在内。操作通知优先于重置通知。颜色来自层的树状发光设置。






### 嵌入

使用 `type: "embed"` 来显示或导航到其他层。这些节点同样使用常见的 `shown`、`style` 和 `class` 字段。

- `mode` {type: "normal" | "peek" | "deep"} {必要}  
`"normal"` 显示一个紧凑的层树并进行正常导航。`"peek"` 在内联中渲染另一个层。`"deep"` 打开一个选定的目标层，通常显示该层的位置，并将其原点移动到通常显示树的位置。
- `source` {type: LayerHandle | EmbedSource} {当 mode 为 "normal" 或 "deep" 时必要}  
由普通或深度树提供的层。直接句柄选择一个层。
- `layer` {type: LayerHandle} {当 mode 为 "peek" 时必要}  
由 peek 内联渲染的目标层。
- `page` {type: LayoutNode[]} {可选}  
peek 特定的页面显示覆盖。默认为目标层的页面；`[]` 表示不显示页面内容。计算在目标范围内运行，可使用 `context.stateOf(targetHandle)` 访问其状态。
- `showLayerName` {type: boolean} {可选}  
在 peek 或 deep 模式下显示目标的名称。默认值为 `false`。
- `showSectionTitles` {type: boolean} {可选}  
在 peek 或 deep 模式下添加生成的章节标题。明确的章节标题优先。默认值为 `false`。

`EmbedSource` 可以通过以下字段选择层：

- `root` {type: LayerHandle} {可选}  
子孙遍历的起始层。默认包括所有层。
- `depth` {type: number} {可选}  
从 root 显示的树层数。`0` 选择 root，`1` 包括其子节点，以此类推。默认包括所有子孙。
- `include` {type: LayerHandle[]} {可选}  
添加遍历之外的层。默认值为 `[]`。
- `exclude` {type: LayerHandle[]} {可选}  
在遍历和包含后移除层。默认值为 `[]`。

一个层连接到另一个层时，在嵌入遍历中视为其子层。嵌入树独立显示未锁定、未禁用的层，而不受主树 `shown` 设置的影响。

### 组件样式

`ui.componentStyles` 应用命名的样式覆盖。本地功能样式会覆盖匹配的属性。请参阅 [组件名称](01/11?s=component-names) 了解支持的名称及它们对应的元素。





## 设置：物品集合

物品集合属性可以创建升级、可购买物品、可点击物品、挑战、里程碑、成就、网格、进度条、信息框和表单。这些都是 TMT 提供的内置`游戏功能`(称为物品)。

`upgrades`、`buyables`、`clickables`、`challenges`、`milestones`、`achievements`、`bars`、`infoboxes` 和 `forms` 集合使用物品 ID 作为键。每个条目定义相应的物品。`grid` 是单个网格定义，而不是集合。

```js
upgrades: {
  doubleGain: {
    description: "获取点数加倍",
    cost: 10,
    effect: () => 2
  }
}
```

集合默认没有条目。上下文命令中要使用物品 ID。

功能的 `unlocked` 属性默认值为 `true`。普通的交互也需要一个已解锁且未停用的层。隐藏物品不同于禁用无法购买的动作。进度奖励有自己规则，稍后会描述。

物品显示和资格计算接受只读物品上下文，并带有 `context.id`。动作钩子接收可写上下文。进度条使用层上下文，而可点击物品和网格提供它们的本地上下文。样式和类默认不覆盖。标记默认没有，除了挑战完成指示器。带有后备标题时显示物品 ID。补充文本和工具提示默认值为 `""`。

效果提供公式值，它们不会被自动应用。缺失或未激活的效果返回 `undefined`。停用会抑制活动效果，同时保留状态。升级、挑战、里程碑和成就效果也依赖于已获得的所有权。返回的效果快照为只读。

下面的章节描述每个内置集合和层的网格。

升级、可购买物品和可点击物品共享这些外观字段。其他物品类型支持它们自己的子集：

- `style` {type: StyleValue} {可选} {回调}  
为物品设置样式。
- `class` {type: ClassValue} {可选} {回调}  
为物品应用 CSS 类。
- `mark` {type: boolean | string} {可选} {回调}  
为 `true` 时显示星标，为 URL 时显示自定义片，为 `false` 时不显示标记。
- `tooltip` {type: string} {可选} {回调} {html}  
显示在物品提示中的文本。
- `branches` {type: ItemBranchDefinition[]} {可选}  
与同一集合中其他物品的视觉连接。物品 ID 使用默认连接外观。通过这些字段自定义连接：
  - `target` {type: string} {必要}  
  目标物品的 ID。
  - `color` {type: string} {可选}  
  连接的颜色。默认为 `"#ffffff"`。
  - `width` {type: number} {可选}  
  连接的宽度。默认为 `15`。

### 升级upgrade {type: Record<string, UpgradeDefinition>} {可选}

升级是TMT游戏的经典特色。购买一次即可获得某种效果。每个升级有以下属性：

- `title` {type: string} {可选} {callback} {html}  
控制显示在升级描述上方的文本。
- `description` {type: string} {required when: fullDisplay is omitted} {callback} {html}  
控制升级显示的主要文本。
- `effectDisplay` {type: string} {可选} {callback} {html}  
描述升级效果的文本，显示在描述下方。
- `fullDisplay` {type: string} {required when: description is omitted} {callback} {html}  
替代普通的升级标题、描述、效果文本和成本显示。
- `cost` {type: DecimalSource} {required} {callback}  
控制玩家购买升级所需花费的货币。
- `currency` {type: DecimalResource} {可选}  
默认使用该层的货币。控制升级使用哪种货币判定是否可购买，以及扣除哪种货币。
- `unlocked` {type: boolean} {可选} {callback}  
控制升级是否显示。
- `canAfford` {type: boolean} {可选} {callback}  
添加可负担条件。选定货币必须足够支付，默认检查不被覆盖。
- `pay` {type: void} {可选} {callback-only}  
以 `pay(context, cost)` 形式执行，覆盖默认货币扣除。所有权仍会正常记录。其他购买效果使用 `onPurchase`。
- `onPurchase` {type: void} {可选} {callback-only}  
升级被购买时执行。
- `effect` {type: any} {可选} {callback-only}  
计算 `context.getUpgradeEffect(id)` 返回的效果。

### 可购买buyable {type: Record<string, BuyableDefinition>} {可选}

可购买项目是可以多次购买的升级。每个可购买项目都有以下属性：

- `title` {type: string} {可选} {callback} {html}  
控制显示在可购买项目顶部的文本。
- `display` {type: string} {required} {callback} {html}  
控制显示在可购买项目主体的文本。
- `effectDisplay` {type: string} {可选} {callback} {html}  
描述可购买项目效果的文本，显示在主体文本下方。
- `cost` {type: DecimalSource} {required} {callback}  
控制购买该可购买项目所需支付的货币数量。
- `currency` {type: DecimalResource} {可选}  
默认使用所在层的货币。控制用于判断可购买项目是否能负担的货币类型，以及购买后减少的货币类型。
- `unlocked` {type: boolean} {可选} {callback}  
控制可购买项目是否显示。
- `initialAmount` {type: DecimalSource} {可选}  
可购买项目初始等级数量。默认为 `0`。
- `purchaseLimit` {type: DecimalSource} {可选} {callback}  
限制可购买数量上限。必须是有限值。默认没有上限。
- `canAfford` {type: boolean} {可选} {callback}  
添加可负担性条件。选定的货币必须仍然能覆盖成本，默认检查不会被覆盖。
- `buy` {type: void} {可选} {callback-only}  
以 `buy(context, cost)` 运行，替代默认支付和数量递增。仍会检查可负担性。
- `buyMax` {type: void} {可选} {callback-only}  
赋予可购买项目的最大购买按钮功能。
- `canSellOne` {type: boolean} {可选} {callback}  
控制是否可以执行 sellOne。默认 `true`。
- `sellOne` {type: void} {可选} {callback-only}  
赋予可购买项目单次出售按钮功能。
- `canSellAll` {type: boolean} {可选} {callback}  
控制是否可以执行 sellAll。默认 `true`。
- `sellAll` {type: void} {可选} {callback-only}  
赋予可购买项目全部出售按钮功能。
- `onPurchase` {type: void} {可选} {callback-only}  
在成功执行单次购买操作后(包括自定义 `buy`)，以 `onPurchase(context)` 运行。最大购买不会触发此函数。
- `effect` {type: any} {可选} {callback-only}  
计算通过 `context.getBuyableEffect(id)` 返回的效果。

购买一次时会检查可用性、成本和购买上限，然后扣费、增加数量，并运行 `onPurchase`。自定义 `buy` 可控制支付和数量递增。结果数量超过当前上限时会被拒绝而不是限制在上限。


### 可购买重置buyableRespec {type:BuyableRespecDefinition} {可选}

为可购买区域添加重置属性控制。界面会先请求确认，然后重新检查可用性。调用`context.respecBuyables()`直接执行重置属性，无需打开对话框。

- `label` {type: string} {可选} {callback}
按钮文字。默认为`重置`。确认对话框也用它作为标题。
- `unlocked` {type:布林值} {可选} {回拨}
控制重置技能点的动作是否可用。默认为`true`。
- `confirmation` {type: 字符串} {可选} {callback} {html}
界面运行重置点前会显示提示。默认是`你确定吗？`.
- `onRespec` {type: void} {required} {仅回调}
接受后以`onRespec(context)`运行。引擎没有默认的重置特性。


### 可点击clickable {type: Record<string, ClickableDefinition>} {可选}

可点击项在点击或长按时会执行操作。默认点击会在 `true` 和 `false` 之间切换。使用 `onClick` 来定义点击行为。每个可点击项有以下属性：

- `title` {type: string} {可选} {callback} {html}  
控制显示在可点击项顶部的文字。
- `display` {type: string} {required} {callback} {html}  
控制显示在可点击项主体的文字。
- `initialValue` {type: any} {可选}  
可点击项的初始值。默认是 `false`。
- `unlocked` {type: boolean} {可选} {callback}  
控制可点击项是否显示。
- `canClick` {type: boolean} {可选} {callback}  
控制可点击项是否可以被操作。
- `onClick` {type: void} {可选} {callback-only}  
在可点击项被触发时执行 `onClick(context)`。
- `onHold` {type: void} {可选} {callback-only}  
在可点击项被长按时执行 `onHold(context, interval)`。`interval` 是经过的秒数。
- `effect` {type: any} {可选} {callback-only}  
计算 `context.getClickableEffect(id)` 返回的效果。

在可点击项的回调中，`context.value` 以只读方式暴露当前数据。使用 `context.setValue(nextValue)` 来替换它。跨项操作使用 `context.getClickableState(id)` 和 `context.setClickableState(id, nextValue)`。

指针长按等待 250ms，然后每 50ms 重复一次。长按会抑制尾随点击。释放、取消、隐藏的界面、丧失资格、弹窗、移除控件的导航以及玩家状态替换都会停止长按。直接使用 `context.holdClickable(id, interval)` 会执行一次调用，并且不会创建计时器。

### 挑战challenges {type: Record<string， ChallengeDefinition>} {可选}

挑战在激活时会暂时改变游戏玩法并奖励完成任务。每层一次只能进入一个挑战，但`countsAs`可以让更多挑战进入激活。在游戏计算中使用`context.inChallenge(id)`，读取完成任务时使用`context.getChallengeCompletions(id)`。

- `title` {type: string} {可选} {callback} {html}
控制挑战顶部显示的文字。
- `description` {type: string} {required when : fullDisplay is omitted} {callback} {html}
描述挑战时的游戏限制。
- `goalDescription` {type: string} {required when : fullDisplay is missitted} {callback} {html}
描述完成目标。
- `rewardDescription` {type: string} {必要时：fullDisplay 被省略} {callback} {html}
描述奖励。
- `rewardDisplay` {type: string} {可选} {callback} {html}
显示当前奖励效果。默认为`""`。
- `fullDisplay` {type: string} {必要时：省略描述、目标描述或reward描述} {callback} {html}
取代了正常的标题和描述性内容。
- `goal` {type: DecimalSource} {省略时需要：canComplete} {callback}
完成阈值与`goalResource`的比较。必须是有限且非负的。
- `goalResource` {type: DecimalResource} {可选}
资源与`目标`进行检验。默认使用该层自身的货币。
- `canComplete` {type: 布尔值} {当目标被省略时必须} {回调}
确定完成资格，取代资源与目标的检验。
- `completionLimit` {type: number} {可选}
最大完成次数。默认为`1`。使用非负整数或`无限`表示无上限。
- `completionGain` {type: number} {可选} {callback}
每成功完成一次可获得的完成次数。默认为`1`。必须是非负整数。奖励上限为剩余的上限。
- `countsAs` {type: 字符串[]} {可选}
其他挑战ID在本挑战运行时被`inChallenge`视为激活。默认为`[]`。引用保持在此层内，直接应用，无需再经过`countsAs`链接。它们不授予奖励或完成。
- `unlocked` {type:布林值} {可选} {回拨}
控制可见性和交互。默认为`true`。
- `canEnter` {type: boolean} {可选} {callback}
额外参赛条件。默认为`true`。参赛总是检查没有挑战处于激活状态，且该挑战未完成其完成度。
- `canExit` {type: boolean} {可选} {callback}
控制当前挑战是否可以退出。默认为`true`。
- `effect` {type:任意} {可选} {仅回调}
计算`context.getChallengeEffect(id)`读取的奖励。完成后该挑战可获得。
- `onEnter` {type: void} {可选} {callback-only}
在挑战-进入重置和激活后，以`onEnter(context)`运行。
- `onComplete` {type: void} {可选} {仅回调}
完成次数记录后，运行为`onComplete(context， gained， total)`。`gained`是实际奖励，`total`是最终完成计数。
- `onExit` {type: void} {可选} {callback-only}
在完成最后一次尝试并清除当前挑战后，以`onExit(context)`形式运行，之后挑战出口会重置。
- `style` {type: StyleValue} {可选} {callback}
设置挑战的样式
- `class` {type: ClassValue} {可选} {callback}
将职业应用于挑战。
- `mark` {type:布尔 | 字符串} {可选} {callback}
覆盖完成标记。默认情况下，完成度超过`1`的挑战显示星级。用`false`来隐藏它。

进入和退出重置源层及其目标。源层的挑战完成历史独立于普通保留，能在两种操作中保持完整。

`context.completeChallenge(id)` 在保持挑战激活的同时奖励进度。默认的`完成`按钮调用`exitChallenge`，因此它也会退出和重置。

```js
challenges: {
    lowPower: {
        description: "挑战中点数减少",
        goalDescription: "到达100点数",
        rewardDescription: "解锁永久倍数。",
        goal: 100,
        effect: () => 2
    }
}
```

挑战声明中会显示目标和奖励价值。在你的收益计算中应用限制和奖励。



### 里程碑milestone {type: Record<string, MilestoneDefinition>} {可选}

里程碑会自动奖励持久进度。自动化之后，引擎会按声明顺序检查每个层的里程碑和成就，按行排序。锁定的层仍会被检查，停用的层则不会。

- `requirementDescription` {type: string} {必要} {回调} {html}  
解释如何获得该里程碑。
- `effectDescription` {type: string} {必要} {回调} {html}  
解释其奖励效果。
- `done` {type: boolean} {必要} {回调}  
决定何时授予尚未获得的里程碑。需要 `unlocked` 为 true 才能评估。
- `unlocked` {type: boolean} {可选} {回调}  
控制可见性和奖励资格。默认值为 true。
- `effect` {type: any} {可选} {仅回调}  
在里程碑获得后，通过 `context.getMilestoneEffect(id)` 获取奖励。
- `onComplete` {type: void} {可选} {仅回调}  
在记录所有权后、完成弹窗前以 `onComplete(context)` 运行。
- `toggles` {type: MilestoneToggleDefinition[]} {可选}  
控制已获得里程碑旁显示的开关。默认值为 `[]`。每个开关使用以下字段：
  - `label` {type: string} {必要} {回调}  
  开关旁的文本。
  - `value` {type: ValueBinding<boolean>} {必要}  
  将开关与支持状态连接：
    - `get` {type: boolean} {必要} {仅回调}  
    以 `get(context)` 读取当前设置。
    - `set` {type: void} {必要} {仅回调}  
    以 `set(context, value)` 设置新的值。请在 `startState` 中初始化支持状态，创建开关不会调用此 setter。
  - `style` {type: StyleValue} {可选} {回调}  
  设置里程碑样式。

使用 `context.hasMilestone(id)` 检查所有权。`context.toggleMilestone(id, index)` 使用从零开始的开关索引，检查当前资格和所有权，反转 getter 的结果，并调用 setter。


### 成就achievement {type: Record<string, AchievementDefinition>} {可选}

成就遵循与里程碑相同的进度检查。

- `title` {type: string} {required} {callback} {html}  
成就标题。
- `description` {type: string} {required} {callback} {html}  
成就说明。
- `done` {type: boolean} {required} {callback}  
决定未获得的成就是否被授予。
- `image` {type: string} {可选} {callback}  
成就显示的图片 URL。默认无图片。
- `unlocked` {type: boolean} {可选} {callback}  
控制可见性和奖励资格。默认值为 `true`。
- `effect` {type: any} {可选} {callback-only}  
在成就被获得后计算奖励，可由 `context.getAchievementEffect(id)` 读取。
- `onComplete` {type: void} {可选} {callback-only}  
在记录拥有权后、完成弹窗前作为 `onComplete(context)` 运行。
- `style` {type: StyleValue} {可选} {callback}  
设置成就样式。
- `class` {type: ClassValue} {可选} {callback}  
为成就应用类。
- `mark` {type: boolean | string} {可选} {callback}  
`true` 显示星标，URL 显示自定义图片，`false` 不显示标记。默认值为 `false`。

使用 `context.hasAchievement(id)` 检查是否拥有成就。


### 网格grid {type:网格定义} {可选}

定义层的网格。坐标从`1`开始。单元格的键是`row：column`，如`2：3`。单元回调暴露`context.row`、`context.column`、`context.key`和`context.data`。

- `row` {type: 编号} {必需} {回调}
当前行数。必须是从`0`到`1000`的整数。
- `columns` {type: number} {required} {callback}
当前列数。必须是从`0`到`1000`的整数。
- `startData` {type: any} {required} {仅回调}
以`startData(context)`形式运行，用于初始化单元有效载荷。其上下文提供坐标。
- `title` {type: string} {可选} {callback} {html}
正前往牢房。默认按键，比如`2:3`。
- `display` {type: string} {可选} {callback} {html}
单元格内的内容。默认为`""`。
- `tooltip` {type: string} {可选} {callback} {html}
单元格提示。默认为`""`。
- `unlock` {type:布林值} {可选} {回拨}
控制单元的可见性和交互。默认为`true`。隐藏单元仍然占用它们的空间。
- `canClick` {type:布尔值} {可选} {callback}
额外要求点击并长按操作。默认为`true`。
- `onClick` {type: void} {可选} {仅回调}
点击单元格时，运行为`onClick(context)`。网格没有默认点击操作。
- `onHold` {type: void} {可选} {callback-only}
按住时以`onHold(context， interval)`形式运行。`interval`衡量经过的秒数。可点击的暂停后进行计时和取消。
- `effect` {type:任意} {可选} {仅回调}
计算通过`context.getGridEffect(key)`或`context.getGridEffect(row， column)`读取的值。
- `style`  {type: StyleValue} {可选} {callback}
给格子格式

读取上下文保护`context.data`免受变异。在写钩中，嵌套单元数据可以直接更改。用`context.setGridData(context.key， value)`替换整个有效载荷。读取和显式设置器也接受坐标，如`context.getGridData(2, 3)`。

缩小维度可以隐藏单元格，但不会删除存储数据。显式设置器可以在显示尺寸之外设置单元格，在坐标边界`1`到`1000`之间。保存条目和保留使用单元键。


```js
grid: {
    rows: 3,
    columns: 3,
    startData: () => ({ clicks: 0 }),
    display: context => String(context.data.clicks),
    onClick: context => { context.data.clicks += 1; }
}
```



### 进度条bars {type: Record<string, BarDefinition>} {可选}

显示根据你的状态得出的进度。进度条本身没有单独保存的进度值。这些字段使用层的读取上下文。

- `direction` {type: "left" | "right" | "up" | "down"} {可选}  
填充方向。默认值为 `"right"`。
- `width` {type: number} {可选} {callback}  
宽度(像素)。必须是有限且非负数。默认值为 `180`。
- `height` {type: number} {可选} {callback}  
高度(像素)。必须是有限且非负数。默认值为 `24`。
- `progress` {type: number} {required} {callback}  
填充比例。必须是有限数值，范围在 `0` 到 `1` 之间。
- `display` {type: string} {可选} {callback} {html}  
显示在条上的文本。默认值为 `""`。
- `unlocked` {type: boolean} {可选} {callback}  
控制可见性。默认值为 `true`。
- `instant` {type: boolean} {可选}  
为 `true` 时禁用填充动画。默认值为 `false`。
- `style` {type: StyleValue} {可选} {callback}  
设置外部条的样式。
- `borderStyle` {type: StyleValue} {可选} {callback}  
设置边框样式。
- `baseStyle` {type: StyleValue} {可选} {callback}  
设置未填充区域的背景样式。
- `fillStyle` {type: StyleValue} {可选} {callback}  
设置已填充区域的样式。
- `textStyle` {type: StyleValue} {可选} {callback}  
设置覆盖文本的样式。










### 信息框infobox {type: Record<string, InfoboxDefinition>} {可选}

显示可折叠的信息。点击标题会在 `context.layerState.infoboxes[id]` 中切换保存的折叠状态。

- `title` {type: string} {必要} {回调} {html}  
折叠控件的标题。
- `body` {type: string} {必要} {回调} {html}  
盒子里的内容。
- `collapsed` {type: boolean} {可选}  
初始折叠状态。默认是 `false`。`startState.infoboxes` 可以覆盖它。
- `unlocked` {type: boolean} {可选} {回调}  
控制可见性和交互。默认是 `true`。
- `style` {type: StyleValue} {可选} {回调}  
设置外部盒子的样式。
- `titleStyle` {type: StyleValue} {可选} {回调}  
设置标题的样式。
- `bodyStyle` {type: StyleValue} {可选} {回调}  
设置内容部分的样式。

当前的折叠状态在重置时会保留。











### forms {type: Record<string, FormDefinition>} {可选}

添加可编辑控件。`defaultValue` 会存储在 `context.layerState.inputs[id]` 中。`value` 将控件连接到你自己的后端状态。这两种配置不能同时使用。

- `type` {type: "text" | "slider" | "dropdown"} {required}  
选择表单类型。`define.dropdown` 为下拉菜单提供此字段。下面章节描述了每种表单的设置。
- `label` {type: string} {required} {callback} {html}  
附加在表单上的标签。
- `placeholder` {type: string} {可选} {callback}  
空文本表单中显示的提示。默认值为 `""`。
- `unlocked` {type: boolean} {可选} {callback}  
控制可见性和交互。默认值为 `true`。
- `style` {type: StyleValue} {可选} {callback}  
设置表单包装器的样式。
- `onChange` {type: void} {可选} {callback-only}  
在成功写入后以 `onChange(context, value)` 形式运行，使用规范化的提交值。直接修改或读取后端状态不会触发它。












#### 表单值和绑定

以下标签描述了 `defaultValue`、绑定的 getter 和 setter 以及 `onChange` 使用的值：

- 文本值 {type: string}
- 滑块值 {type: number}
- 下拉值 {type: string | number | boolean | null}

数值必须是有限的。可以通过以下字段定义存储：

- `defaultValue` {type: FormValue} {required when: value is omitted}  
初始化存储的值。不能与 `value` 一起使用。
- `value` {type: ValueBinding<FormValue>} {required when: defaultValue is omitted}  
读取和写入后台状态。不能与 `defaultValue` 一起使用。
- `get` {type: FormValue} {required} {callback-only}  
通过 `get(context)` 读取当前控件的值。
- `set` {type: void} {required} {callback-only}  
通过 `set(context, value)` 更新后台状态。初始化和加载不会调用这个 setter。

`context.getInput(id)` 读取当前值。`context.setInput(id, value)` 会检查交互资格、规范化输入、写入存储或调用 setter，然后触发 `onChange`。绑定控件不会在 `inputs` 中创建条目。

#### 文本表单

文本输入使用 `type: "text"`。`""` 是一个有效的初始值。文本控件没有其他附加字段。




#### 滑块表单

使用 `type: "slider"` 创建一个范围控制：

- `min` {type: 数字} {可选} {回调}  
  下限。必须是有限数且不大于 `max`。默认值为 `0`。
- `max` {type: 数字} {可选} {回调}  
  上限。必须是有限数且不小于 `min`。默认值为 `100`。
- `step` {type: 数字} {可选} {回调}  
  输入步长。必须是有限且非负的。默认值为 `1`。

滑块展示会将写入值限制在当前边界内。命令写入不会四舍五入到 `step`，只有浏览器在输入步长时会使用它。




```js
setup: define => define({
    forms: {
        nickname: {
            type: "text",
            label: "Nickname",
            defaultValue: ""
        },
        volume: {
            type: "slider",
            label: "Volume",
            defaultValue: 50,
            min: 0,
            max: 100
        },
        notation: define.dropdown([
            { label: "Standard", value: "standard" },
            { label: "Scientific", value: "scientific" }
        ], {
            label: "Notation",
            defaultValue: "standard"
        })
    }
})
```




#### 下拉表单

使用 `define.dropdown(options, configuration)` 创建一个选项选择器。将返回的定义放在 `forms` 下的对应 ID。这个辅助函数会提供 `type: "dropdown"` 和 `options`，不要在 `configuration` 中包含这两个字段。

- `options` {type: DropdownOption[]} {必要} {回调}  
第一个参数。按显示顺序排列的选择项。回调以 `options(context)` 的方式运行，context 是只读的条目上下文。
- `label` {type: string} {必要}  
显示给用户的选项文本。
- `value` {type: FormValue} {必要}  
选择该选项时存储的值。
- `configuration` {type: DropdownConfiguration} {必要}  
第二个参数。提供上面通用的表单字段，包括 `label` 和 `defaultValue` 或 `value` 中的一个。

这些选项决定传递给 `value.set` 和 `onChange` 的推断值。

当前值必须使用 `===` 匹配某个选项。更改选项不会自动选择备用值。在更新动态选项列表时，保持当前值有效。

```js
setup: define => define({
forms: {
  nickname: {
    type: "text",
    label: "昵称",//译者注：好吧，我不知道这些中文字符会不会有什么影响
    defaultValue: ""
  },
  volume: {
    type: "slider",
    label: "音量",
    defaultValue: 50,
    min: 0,
    max: 100
  },
    notation: define.dropdown([
    { label: "标准", value: "standard" },
    { label: "科学", value: "scientific" }
      ], {
      label: "表示法",
      defaultValue: "standard"
    })
  }
})
```


## 设置：杂项

以下属性控制键盘输入和模拟。




### 快捷键 {type: HotkeyDefinition[]} {可选}

将按键绑定到全局游戏操作。默认为 `[]`。每个条目具有以下属性：

- `key` {type: string} {required}  
触发操作的按键，使用以下语法。
- `description` {type: string} {required} {callback}  
在信息面板中与快捷键一起显示。
- `unlocked` {type: boolean} {可选} {callback}  
控制快捷键是否显示和可用。默认为 `true`。
- `allowRepeat` {type: boolean} {可选}  
控制快捷键是否可以按住持续触发。默认为 `false`。
- `onPress` {type: void} {required} {callback-only}  
控制按下快捷键时会发生什么。

快捷键包含一个主键和修饰键(`shift`、`ctrl`、`alt` 或 `meta`)，用空格 ` ` 连接。按键使用浏览器的 `event.key`。匹配时忽略大小写、空格和修饰键顺序。使用 `space` 和 `plus` 表示这些字面按键。`ctrl s` 保留用于保存。








### 被动生成、更新与自动化

- `passiveGeneration` {type: DecimalSource} {可选} {回调}  
控制你每秒能获得的该层主要货币数。必须为非负数。实际获得的货币是此速率乘以内部 `delta`。
- `automate` {type: void} {可选} {仅回调}  
每个刻度运行一次，用于自动执行某些层操作。需要考虑时间增量的行为应使用 `update`。
- `update` {type: void} {可选} {仅回调}  
每个刻度以 `update(context, delta)` 形式运行，`delta` 以秒为单位。用于需要按刻度操作并考虑经过时间的情况。

被动生成、更新与自动化的共同点：

- 无论层是否解锁都会运行，但如果层被停用则停止。
- 离线时间计算时仅运行一次，将相关的大 `delta` 传递给 update，并将 passiveGeneration 的速率乘以它。

有关刻度顺序、离线时间和错误行为，请参见 [模拟](01/10)。