# 项目与模组设置

创建一个独立于当前模板的项目。[创建游戏](00/00) 涵盖克隆其子模块并在本地运行。

保留新模板的`index.html`、启动器和`tmt`文件夹。转换时带上你的游戏代码和资源。

## 替换mod.js全球

3.x 从`main.js`开始。它导入层句柄并调用一次`defineMod`：

```js
import { defineMod } from "tmt";
import { prestige } from "./src/prestige.js";

defineMod({
    info: {
        id: "my-tree-v3",
        name: "我的树",
        author: "填你名字",
        version: "3.0.0",
        pointsName: "points",
        initialPoints: 10,
        startLayer: prestige,
        offlineLimitHours: 1
    },

    layers: [prestige],

    pointGain(context) {
        let gain = context.stateOf(prestige).points.add(1);
        if (context.hasUpgrade("11", prestige)) gain = gain.mul(2);
        return gain;
    }
});
```

这个例子假设`prestige.js`导出一个升级为“11”的层。你可以在[层与重置](04/00/02)中使用该层，同时操作指南。

从`tmt`导入引擎助手，然后按路径导入其他文件。你不需要导出“defineMod”的结果。

## 配置名称

| 2.x | 3.x |
| --- | --- |
| `modInfo.id`、`name`、`author`、`pointsName` | `info` 中的对应字段 |
| `VERSION.num` | 用于显示的 `info.version` |
| `modInfo.initialStartPoints` | 新起点使用的 `info.initialPoints` |
| `modInfo.offlineLimit` | `info.offlineLimitHours` |
| `modInfo.modFiles` | 在 `main.js` 和你的层文件中的导入 |
| `layoutInfo.startTab` | 使用层句柄的 `info.startLayer` |
| `layoutInfo.showTree` | `ui.mode: "tree"` 或 "single" |
| `getPointGen()` | `pointGain(context)` |
| `canGenPoints()` | `canGeneratePoints(context)` |
| `isEndgame()` | `endgame(context)` |
| 全局 `winText` | 在 mod 定义中的 `winText` |
| 全局 `backgroundStyle` | `ui.backgroundStyle` |
| `maxTickLength()` | `simulation.maxTickSeconds` |
| `addedPlayerData()` | 层的 `startState` 中的自定义字段 |
| `fixOldSave(oldVersion)` | 用于兼容 3.x 存档的 `migrateSave(state, fromVersion)` |

提供示例中所有必要的“信息”字段。每个层的句柄在“层”中包含一次，并在“节点”中包含独立节点句柄。

提供示例中显示的每个必填 `info` 字段。在 `layers` 中每个层句柄只出现一次，并在 `nodes` 中包含独立的节点句柄。

`simulation.maxTickSeconds` 使用的是秒。Stock 2.x 代码也将其限制应用到以秒为单位的 `diff`，尽管一些旧文档将该值称为毫秒。在更改单位之前请检查你的旧实现。新的刻度间隔 `simulation.intervalMs` 是以毫秒为单位的单独设置。

没有匹配 `VERSION.name`、`changelog`、Discord 链接或 `displayThings` 的 mod 字段。将这些内容放到作者页面文本、信息框或合适的额外层中。不要在新定义中保留旧键。

## 移动你的助手功能

3.x 不接受层或特征定义内的任意额外函数。将共享计算迁移到普通模块函数中，然后从支持的回调中调用。

`doNotCallTheseFunctionsEveryTick`列表完全消失了。助手程序在你的代码调用时运行，引擎只评估其声明字段和回调。

定义是在启动时编译的。之后更改定义对象不会重新配置游戏。对于依赖当前状态的值使用回调，编辑项目后重新加载。

:::note 查看“回调”标签
并非所有属性都接受回调。引用为回调支持赋予了独立的标签，与值类型分开。在2.x字段中被接受的函数可能需要迁移到其他地方。
:::

## 首次创业

从一层开始，并存一个新存档。在添加更多系统之前，先修正定义错误。拒绝未知字段和明确的`undefined`值，省略未使用的属性。

接下来，替换[上下文与状态](04/00/01)中的旧状态访问模式。