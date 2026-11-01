
# 页面与树

在移植游戏玩法时从默认的层页面开始。一旦功能正常运行，就用 `ui.page` 下的布局对象替换旧的 `tabFormat`。

## 替换 tabFormat

这个 2.x 布局：

```js
tabFormat: [
"main-display",
"prestige-button",
["display-text", () => "明智地使用你的点数！"],
"upgrades",
"buyables"
]
```

变成这个设置字段：

```js
ui: {
    page: [
        { type: "section", feature: "main" },
        { type: "text", text: "明智地使用你的点数！" },
        { type: "section", feature: "upgrades" },
        { type: "section", feature: "buyables" }
    ]
}
```


`main` 部分会把层的主要货币、重置控制、记录和效果描述分组。并不是每个旧的主显示子组件都有单独的内置布局项。

提供的 `page` 会替代默认布局。把你想显示的每个部分都加上。将旧的 `midsection` 的内容直接放到新页面里你希望的位置。

| 2.x 组件 | 3.x 布局 |
| --- | --- |
| `display-text`、`raw-html` | `{ type: "text", text: ... }` |
| `display-image` | `{ type: "image", src: ..., alt: ... }` |
| `blank` | `{ type: "spacer", size: ... }` |
| `row`、`column` | 类型名称相同，嵌套节点放在 `children` 中 |
| `upgrades`、`buyables` 及其他集合 | 对应 `feature` 的 `section` |
| 单个 upgrade 或 buyable | 带 `ids: ["11"]` 的集合 section |
| `bar`、`infobox` | 带选定 `ids` 的 `bars` 或 `infoboxes` section |
| Upgrade/buyable/clickable 树 | 带 `layout: "tree"` 和明确 `rows` 的 section |
| `text-input`、`slider`、`drop-down` | 声明 `forms`，通过 forms section 显示 |
| `toggle` | 带有 `binding` 的 toggle 节点 |
| `microtabs` 和命名的 `tabFormat` tabs | `tabs` 节点 |
| `layer-proxy` 和嵌入的层内容 | `peek` 嵌入 |

对于一个升级树，假设已经声明了这三个 ID：

对于升级树，假设三个 ID 已经声明：

```js
ui: {
page: [{
    type: "section",
    feature: "upgrades",
    layout: "tree",
    rows: [["11", "12"], ["21"]]
}]
}
```

只有升级、可购买和可点击的部分支持这种树形布局。其他部分则使用它们普通的布局和物品选择规则。

## 标签和微标签

标签现在可以无限嵌套，而且标签和微标签之间不再有区别。

为标签组和每个标签使用一个 ID：

```js
ui: {
    page: [{
        type: "tabs",
        id: "main-tabs",
        tabs: [
            {
            id: "main",
            title: "主要",
            page: [
                { type: "section", feature: "main" },
                { type: "section", feature: "upgrades" }
            ]
            },
            {
                id: "generators",
                title: "生成器",
                page: [{ type: "section", feature: "buyables" }]
            }
        ]
    }]
}
```

标签的 `shown` 取代了旧的可见性条件，而 `page` 取代了 `content`。在旧标签使用 `prestigeNotify` 的地方，请使用 `resetNotify`。标签的发光颜色来自层的树设置。

对于嵌入式层，`mode: "peek"` 使用 `layer: otherHandle` 在内联渲染另一个层。`mode: "normal"` 提供正常导航，而 `mode: "deep"` 会在目标旁边打开层并带有返回导航。更多关于嵌入和标签的信息，请参见 [defineLayer](01/01) 。

## 表单和切换按钮

在 setup 中声明表单控件，而不是将已保存字段的名称传给元组组件。表单可以通过 `defaultValue` 拥有自己的默认值，或者通过 `value.get` 和 `value.set` 绑定到 `startState` 中的字段。

对于下拉菜单，在 setup 中调用 `define.dropdown(options, configuration)`，然后把结果放入 `forms`。选项放在第一个参数，标签、存储或绑定，以及变更钩子放在第二个参数。这个辅助函数会提供 `type` 和 `options`，并从选项中推断回调值。示例请参见 [defineLayer](01/01)。

例如，如果层初始化时 `auto: false`，页面切换可以这样使用：

```js
ui: {
    page: [{
        type: "toggle",
        label: "自动声望",
        binding: {
        get: context => context.layerState.auto,
        set(context, value) { context.layerState.auto = value; }
        }
    }]
}
```

不要指望绑定的 setter 会创建初始状态。自己初始化支撑字段。引擎管理的表单会在层的 `inputs` 下保存数据。

## 移动树设置

层树的外观现在在 setup 里的 `tree` 对象中：

| 2.x 层字段 | 3.x |
| --- | --- |
| `displayRow` | `tree.row` |
| `position` | `tree.position` |
| `layerShown` | `tree.shown` |
| `branches` | `tree.connections`，使用 handles 或连接对象 |
| `nodeStyle` | `tree.style` |
| `image` | `tree.image` |
| `marked` | `tree.mark` |
| `tooltip`, `tooltipLocked` | 一个 `tree.tooltip` 回调函数来检查状态 |
| `glowColor` | `tree.actionGlowColor` |
| `prestigeNotify` | 设置 `resetNotify` |

如果想放在侧边位置，使用 `tree.row: "left"` 或 `"right"`。把层放在侧边不会自动获得旧的侧边层重置豁免，要想保留这个行为需要显式配置重置目标或保留选项。

树的可见性默认根据层是否解锁。位置默认按定义顺序，而不是按字母 ID 顺序。如果旧排序重要，记得加上明确的位置。

旧的 `treeLayout` 数组不能直接迁移。主树通过行、位置和连接来安排。嵌入的树使用新的嵌入字段，而不是复制旧节点 ID 的数组。

`addNode` 变成了 [defineNode](01/02)。它返回一个 handle，属于 mod 的 `nodes` 列表。外观字段在节点定义里，其回调使用 mod 上下文，因为它没有层状态。

## 样式、消息和引擎扩展

层 `style` 变成了 `ui.style`，而 `componentStyles` 变成了 `ui.componentStyles`。也请检查组件名称，旧的 CSS 选择器不会自动匹配新引擎的样式。有关支持的类和属性，请参见 [Styling](01/11)。

将弹出调用迁移到 `context.popup({ message, ... })`。将确认和提示流程迁移到 `context.confirm` 或 `context.prompt`。

带有 HTML 标记的字段接受已编写的 HTML，但不会编译 Vue 模板，也不会将 HTML 事件属性转换为上下文动作。对于互动游戏控制，请使用可点击元素和表单。

最后，在 [Saves and Release Checks](04/00/05) 中规划保存过渡。