# 样式

查看 [defineMod](01/00) 和 [defineLayer](01/01) 了解可以自定义样式的属性。

## 样式和类值

- `StyleValue` {type:Record<string, string | number | undefined>}
将 CSS 属性名映射到对应的值。支持普通 CSS 以及自定义属性，比如 `"--tmt-layer-color"`。
- `ClassValue` {type:string | string[] | Record<string, boolean>}
直接提供类名，可以是列表，也可以是映射，通过 `true` 启用类，`false` 禁用类。

```js
style: context => ({
borderColor: context.layerState.energy.gte(100) ? "gold" : "gray",
padding: "12px"
}),
class: context => ({ charged: context.layerState.energy.gte(100) })
```

## 样式适用范围

- `defineMod.ui.backgroundStyle` 使用 mod 上下文为外部游戏包装器设置样式。
- `layer.ui.style` 使用层上下文为层页面设置样式。
- `layer.ui.componentStyles` 使用层上下文为命名组件设置样式。
- 一个功能的 `style` 和 `class` 使用它自己的回调作用域。
- 布局节点和显示子部件的样式字段在 [defineLayer](01/01) 中有文档说明。

在同时有组件样式和本地样式的元素上，本地属性优先。容器继承、内联样式和外部样式表仍然遵循普通的 CSS 层叠规则。

### 组件名称

| 键 | 目标 |
| --- | --- |
| `main` | 主层信息 |
| `reset-button` | 荣誉按钮 |
| `tree-node` | 该层的树按钮 |
| `upgrade`, `buyable`, `clickable` | 对应物品 |
| `challenge`, `milestone`, `achievement` | 对应物品 |
| `bar`, `infobox`, `form` | 对应物品 |
| `grid`, `grid-cell` | 网格和网格单元 |
| `respec-button` | 可购买的重置按钮 |

## CSS 变量

根元素 `#tmt` 定义了：

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `--tmt-background` | `#0f0f0f` | 主背景颜色 |
| `--tmt-foreground` | `#dfdfdf` | 主前景颜色 |
| `--tmt-panel` | `#202020` | 面板颜色 |
| `--tmt-locked` | `#bf8f8f` | 锁定/未完成颜色 |
| `--tmt-complete` | `#77bf5f` | 已完成颜色 |
| `--tmt-border` | `#ffffff30` | 浅边框颜色 |
| `--tmt-border-dark` | `#00000020` | 深边框颜色 |

图层页面设置 `--tmt-layer-color`，通知设置 `--tmt-notification-color`。

```css
#tmt {
--tmt-background: #101826;
--tmt-foreground: #e8eef7;
--tmt-panel: #19253a;
}
```

所有引擎样式都限定在 `#tmt` 下。

## 目标内容

| 属性 | 元素及其值 |
| --- | --- |
| `data-tmt-layer` | 图层页面、预览以及图层树按钮。基于图层 ID |
| `data-tmt-node` | 树按钮。基于图层或节点 ID |
| `data-tmt-tab` | 标签页按钮。基于标签页 ID |
| `data-tmt-item` | 功能按钮。基于项目 ID 或网格键 |
| `data-tmt-section` | 集合和项目树部分。基于项目/功能名称 |
| `data-tmt-popup` | 弹出窗口。基于弹出类型名称 |

这些属性可以用来控制选中的项目：

```css
#tmt .tmt-layer-page[data-tmt-layer="prestige"]
.tmt-upgrade[data-tmt-item="doubleGain"] {
    border: 3px solid gold;
}
```

### 类索引

| 区域 | 类 |
| --- | --- |
| 外壳 | `tmt-game`, `tmt-navigation`, `tmt-split`, `tmt-deep`, `tmt-header`, `tmt-panel-buttons`, `tmt-info-button`, `tmt-version`, `tmt-points`, `tmt-point-gain` |
| 图层 | `tmt-layer-page`, `tmt-main`, `tmt-reset-button`, `tmt-back`, `tmt-feature-section`, `tmt-section-title` |
| 购买和操作 | `tmt-upgrade`, `tmt-buyable-group`, `tmt-buyable`, `tmt-buyable-actions`, `tmt-respec-button`, `tmt-clickable` |
| 进展 | `tmt-challenge`, `tmt-milestone`, `tmt-achievement` |
| 网格和表单 | `tmt-grid`, `tmt-grid-row`, `tmt-grid-cell`, `tmt-grid-empty`, `tmt-form` |
| 显示 | `tmt-bar`, `tmt-bar-base`, `tmt-bar-fill`, `tmt-bar-text`, `tmt-infobox`, `tmt-infobox-title`, `tmt-infobox-body`, `tmt-marker` |
| 布局 | `tmt-layout-node`, `tmt-layout-section`, `tmt-layout-text`, `tmt-layout-image`, `tmt-layout-spacer`, `tmt-layout-toggle`, `tmt-layout-row`, `tmt-layout-column`, `tmt-layout-tabs`, `tmt-layout-embed`, `tmt-tabs`, `tmt-tab-panel`, `tmt-peek`, `tmt-embed-blocked`, `tmt-spacer`, `tmt-toggle` |
| 树 | `tmt-tree-viewport`, `tmt-tree`, `tmt-compact-tree`, `tmt-tree-center`, `tmt-tree-row`, `tmt-tree-rail`, `tmt-tree-left`, `tmt-tree-right`, `tmt-tree-slot`, `tmt-tree-node`, `tmt-item-tree`, `tmt-item-tree-content`, `tmt-item-tree-row`, `tmt-branch-container`, `tmt-branches` |
| 反馈 | `tmt-popup-stack`, `tmt-popup`, `tmt-modal`, `tmt-modal-actions`, `tmt-tooltip-anchor`, `tmt-tooltip`, `tmt-tooltip-layer` |
| 面板和恢复 | `tmt-options-panel`, `tmt-info-panel`, `tmt-save-controls`, `tmt-save-error`, `tmt-form-error`, `tmt-recovery`, `tmt-endgame`, `tmt-raw-export`, `tmt-hidden` |

### 状态类

| 类别 | 含义 |
| --- | --- |
| `tmt-is-available` | 可购买、可点击、可在网格或树中操作、可参与或完成挑战，或可重置 |
| `tmt-is-locked` | 不可操作，或未获得的里程碑/成就 |
| `tmt-is-bought` | 已购买的升级 |
| `tmt-is-active` | 活跃挑战或选中的标签页 |
| `tmt-is-complete` | 已获得的里程碑/成就，或有完成次数的挑战 |
| `tmt-is-maxed` | 挑战已达到完成上限 |
| `tmt-is-ghost` | 隐藏的保留树节点位置 |
| `tmt-is-instant` | 填充过渡已禁用的进度条 |
| `tmt-notify-action`, `tmt-notify-reset` | 树或标签页控件的操作或重置高亮 |