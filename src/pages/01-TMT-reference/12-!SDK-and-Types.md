# SDK 与类型

TMT 的 SDK 提供了用于编写游戏所需的函数、句柄和声明。JavaScript、已检查的 JavaScript 和 TypeScript 都使用相同的运行时。

使用模板，你所需的所有内容都可以通过别名“tmt”导入。

这里的大部分文档对大多数创作者来说并不相关。

## 运行时导出

| 导出 | 作用 | 参考 |
| --- | --- | --- |
| `defineMod` | 定义并启动游戏 | [defineMod](01/00) |
| `defineLayer` | 创建一个层 | [defineLayer](01/01) |
| `defineNode` | 创建一个节点 | [defineNode](01/02) |
| `defineResource` | 将状态连接到引擎资源 | [defineResource](01/03) |
| `points` | 主要货币资源句柄 | [defineResource](01/03) |
| `Decimal` | 构造和计算大数量 | [Decimal](01/04) |
| `format`, `timeFormat`, `exponentialFormat`, `commaFormat`, `simpleFormat` | 显示数量和时间 | [Formatting](01/05) |

## 共享类型

- `Computable<Value, Context>` {type: Value | ((context: Context) => Value)}  
通过回调标签表示的值或回调。
- `DeepReadonly<Value>` {type: Value 的受保护视图}  
递归保护状态，包括 Decimal 更改器。运行时上下文遵守相同的访问限制。
- `LayerHandle<State>` {type: 图层身份}  
包含 `id`、`points` 以及编辑器推断所需的自定义状态关系。`State` 描述图层的自定义保存字段。
- `AnyLayerHandle` {type: LayerHandle<object>}  
没有自定义字段信息的图层句柄，适用于通用的目标列表。
- `NodeHandle` {type: 节点身份}  
暴露节点的 `id`。
- `TreeNodeHandle` {type: AnyLayerHandle | NodeHandle}  
树的任意端点。
- `DecimalResource` {type: 资源身份}  
暴露 `name` 和 `owner`。getter/setter 行为属于 `defineResource` 创建的资源。
- `LayerState<State>` {type: LayerCoreState 与自定义 State 的组合}  
实际的图层状态。引擎字段在名称重叠时保持各自规则。
- `LayerInitialState` {type: 初始引擎字段}  
由 `startState` 接受的引擎字段覆盖。
- `Shown` {type: boolean | "ghost"}  
树的可见性行为。
- `TreeRow` {type: number | "left" | "right"}  
可视化树的位置。
- `ValueBinding<Value, ReadContext, WriteContext>` {type: 对象}  
通过以下回调将输入连接到备份状态：
- `get` {type: Value} {必需} {仅回调}  
通过 `get(context)` 读取当前值。
- `set` {type: void} {必需} {仅回调}  
通过 `set(context, value)` 写入值。初始化时不会调用它来创建状态。

## 类型导出索引

这些名称可以在 TypeScript 中使用 `import type` 导入。泛型 `State` 参数描述自定义层的状态。

| 导出的类型 | 参考 |
| --- | --- |
| `Decimal`, `DecimalSource`, `ReadonlyDecimal` | [Decimal](01/04) |
| `PlayerState` | [主玩家上下文](01/06?s=main-player-context) |
| `LayerCoreState`, `LayerInitialState`, `LayerState` | [defineLayer 的 startState](01/01?s=2) |
| `StyleValue`, `ClassValue` | [样式](01/11) |
| `Computable`, `DeepReadonly`, `LayerHandle`, `AnyLayerHandle`, `NodeHandle`, `TreeNodeHandle`, `DecimalResource`, `Shown`, `TreeRow`, `ValueBinding` | 上述共享类型 |
| `ModDefinition`, `ModInfo`, `ModUiDefinition`, `SimulationDefinition` | [defineMod](01/00) |
| `ResourceDefinition` | [defineResource](01/03) |
| `NodeDefinition` | [defineNode](01/02) |
| `TreeNodeOptions<Context>`, `TreeConnection`, `TreeConnectionDefinition`, `HotkeyDefinition<State>`, `LayerUiDefinition<State>` | [defineLayer](01/01) |
| `ModReadContext`, `ModWriteContext`, `LayerReadContext<State>`, `LayerWriteContext<State>`, `ItemReadContext<State>`, `ItemWriteContext<State>` | [上下文](01/06) |
| `ClickableReadContext<State, Value>`, `ClickableWriteContext<State, Value>`, `GridCellReadContext<State, Data>`, `GridCellWriteContext<State, Data>` | [上下文](01/06) |
| `ResetCause`, `ResetReadContext<State>`, `ResetContext<State>` | [上下文](01/06) |
| `UpgradeDefinition<State>`, `BuyableDefinition<State>`, `BuyableRespecDefinition<State>`, `ClickableDefinition<State, Value>`, `ItemBranchDefinition` | [defineLayer](01/01) |
| `ChallengeDefinition<State>`, `MilestoneDefinition<State>`, `MilestoneToggleDefinition<State>`, `AchievementDefinition<State>` | [defineLayer](01/01) |
| `GridDefinition<State, Data>`, `BarDefinition<State>`, `InfoboxDefinition<State>` | [defineLayer](01/01) |
| `FormValue`, `DropdownOption<Value>`, `DropdownConfiguration<State, Value>`, `FormDefinition<State, Value>`, `TextFormDefinition<State>`, `SliderFormDefinition<State>`, `DropdownFormDefinition<State, Value>` | [defineLayer](01/01) |
| `ResetDefinition<State>`, `NoResetDefinition`, `NormalResetDefinition<State>`, `StaticResetDefinition<State>`, `CustomResetDefinition<State>`, `ResetTargetRules`, `RetentionDefinition<State>`, `RetentionSelection` | [defineLayer](01/01) |
| `FeatureSection`, `LayoutNode<State>`, `SectionLayoutNode<State>`, `TextLayoutNode<State>`, `ImageLayoutNode<State>`, `SpacerLayoutNode<State>`, `ToggleLayoutNode<State>`, `RowLayoutNode<State>`, `ColumnLayoutNode<State>`, `TabsLayoutNode<State>`, `TabDefinition<State>`, `EmbedLayoutNode<State>`, `EmbedSource` | [defineLayer](01/01) |
| `PopupType`, `PopupRequest`, `NotificationDefinition`, `ModalOptions`, `PromptOptions<ReadContext>` | [弹窗和模态](01/08) |