# TMT 参考

本节文档包含了关于使用 TMT 的所有内容，并进行了详细描述。

如果你是 TMT 新手，请先从 [入门指南](00) 开始。

## 定义你的游戏

- [defineMod()](01/00) 创建游戏并配置元数据、 点数生成、模拟以及保存迁移。
- [defineLayer()](01/01) 定义层、游戏玩法功能、重置和页面布局。
- [defineNode()](01/02) 创建非层级树按钮。
- [defineResource()](01/03) 将保存的数量与引擎操作连接。

## 计算与操作

- [Decimal](01/04) 处理大数及其运算。
- [Formatting](01/05) 解释了五种显示辅助。
- [Context](01/06) 列出回调属性、状态访问和游戏命令。
- [Popups and Modals](01/08) 涵盖弹窗、确认和提示。

## 引擎行为

- [Saves and Errors](01/09) 涵盖保存、加载、迁移、恢复和错误处理。
- [Simulation](01/10) 解释每一帧处理顺序及离线时间。
- [Styling](01/11) 列出 CSS 属性和 UI 行为。
- [SDK and Types](01/12) 涉及 SDK 导入、类型推断和导出类型。主要供高级用户使用。

## 阅读标签

- {type: type} 显示属性值或方法的返回值。对于仅回调字段，它显示回调的返回值。
- {required} 和 {optional} 显示字段是否必须提供。
- {required when: a condition applies} 显示条件要求。
- {callback} 表示该属性允许返回显示值的回调。
- {callback: type} 当回调的返回类型与直接值类型不同，它显示回调返回类型。
- {callback-only} 显示该属性必须使用回调而非直接值。
- {html} 显示该属性允许自定义 HTML。