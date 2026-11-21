# 存档和发布检查

在测试转换进度之前，先在一个全新的存档上让端口工作。这样可以把游戏代码的错误和转换器的错误分开。

从 2.x 存档迁移非常困难且繁琐。绝对不是必须的，也不被期望。不过，本页会说明类似操作是怎么实现的。

## migrateSave 能做（和不能做）的事

`migrateSave(state, fromVersion)` 用来升级已接受的 3.x 存档数据状态。引擎在调用它之前会检查数据的格式和模组身份。

一个原生 2.x 导出包含旧的玩家对象。它没有新格式，所以设置 `saveVersion: 2` 不会让旧导出触发你的回调函数。

:::note 引擎版本 vs formatVersion vs info.version vs saveVersion
这里涉及四个版本：引擎版本、formatVersion、info.version 和 saveVersion。引擎版本是公开的 TMT 版本，比如 3.x；formatVersion 是引擎的存档格式版本，3.x 新增，因此与公开版本无关；info.version 是游戏的公开/显示版本；saveVersion 是游戏的存档格式版本（只有在需要迁移时才增加）。
:::

在正常迁移回调之外转换旧的导出，然后通过游戏的存档控制导入生成的 3.x 存档。后续对该 3.x 状态的更改可以正常使用 `migrateSave`。

## 映射状态

| 2.x 状态 | 3.x 目标或处理方式 |
| --- | --- |
| 根 `points`、`timePlayed` | `state.player.points`、`state.player.timePlayed` |
| `player.p` | `state.layers.p`，如果你保留了层 ID `"p"` |
| 升级、里程碑和成就 ID 数组 | 记录，如 `{ "11": true }` |
| 可购买数量 | 在声明的字符串 ID 下的十进数量 |
| 挑战完成情况 | 在声明的字符串 ID 下的整数计数 |
| `activeChallenge` | 声明的字符串 ID 或 `null` |
| 网格键如 `101` | 键如 `"1:1"` |
| 全局 `player.infoboxes.p` | 层的 `infoboxes` 记录 |
| 来自 `addedPlayerData()` 的字段 | 选定层上的自定义字段 |
| 旧的绑定输入值 | 它们的新支撑字段，或在 `inputs` 中声明的条目 |
| `tab` | 为 `state.player.activeLayer` 选择一个有效包含的层 |
| `subtabs`、`navTab`、缓存通知、导航历史 | 忽略，新 UI 会初始化自己的状态 |
| 旧版本、时间和离线信息 | 映射到新格式或省略 |
| 旧引擎选项 | 将支持的设置映射到完整的 3.x `options` 记录 |

不要把整个旧玩家对象扩展到 `state.player`，它是不可变的。也不要把整个旧层对象扩展进去，旧引擎状态可能意外变成自定义保存状态。

只保留仍然存在的 ID，并为重命名的层和功能提供明确映射。检查挑战限制、可购买限制、下拉选择和网格坐标是否符合新定义。

十进数量也需要转换。新的编码表示为 `{ "__tmt_decimal__": "1e1000" }`。用 Decimal 初始化的自定义字段必须接收预期的 Decimal 值，而不是仅看起来像数字的普通字符串。

## 一个小型转换器示例

这个示例仅适用于本指南前面使用的小型声望模组。它会保留 点数、游戏时间、`"p"` 层的货币记录以及升级 `"11"`。它故意省略其他所有旧层和功能，重置终局标记，并使用默认引擎选项。

在将其用于更大游戏之前，请先扩展这些映射。目标模组的 `info.id: "my-tree-v3"`、`saveVersion: 1`，以及来自 [Layers and Resets](04/00/02) 的层。

将其放在一个独立的转换器模块中，该模块可以导入新的 SDK。它接收一个已解码的 2.x 玩家对象，并返回一个可导入的存档字符串。它不会写入 LocalStorage，也不会更改正在运行的游戏。


```js
import {Decimal} from "tmt";

function createDecimalTag(value) {
    if (typeof value !== "number" && typeof value !== "string") {
        throw new Error("Expected a legacy Decimal string or number");
    }
    if (typeof value === "string" && value.trim() === "") {
        throw new Error("A quantity cannot be blank");
    }
    const amount = new Decimal(value);
    if (!amount.isFinite()) throw new Error("A quantity must be finite");
    return {__tmt_decimal__: amount.toString()};
}

export function convertLegacyPlayer(legacy) {
    const old = legacy.p;
    if (!old) throw new Error("The legacy save has no prestige layer!");

    const owned = old.upgrades ?? [];
    if (!Array.isArray(owned)) throw new Error("Expected an upgrade ID list");

    const save = {
        formatVersion: 1,
        modId: "my-tree-v3",
        saveVersion: 1,
        savedAt: Date.now(),
        state: {
            player: {
                points: createDecimalTag(legacy.points),
                timePlayed: legacy.timePlayed ?? 0,
                won: false,
                keepGoing: false,
                activeLayer: "p"
            },
            layers: {
                p: {
                    unlocked: old.unlocked ?? true,
                    points: createDecimalTag(old.points),
                    best: createDecimalTag(old.best ?? old.points),
                    total: createDecimalTag(old.total ?? old.points),
                    resetTime: old.resetTime ?? 0,
                    upgrades: owned.some(id => String(id) === "11")
                        ? {"11": true}
                        : {}
                }
            }
        },
        options: {
            autosaveEnabled: true,
            autosaveInterval: 5000,
            offlineProgressEnabled: true,
            hotkeysEnabled: true,
            hideCompletedChallenges: false,
            confirmHardReset: true
        }
    };

    const bytes = new TextEncoder().encode(JSON.stringify(save));
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
}
```

在 2.x 引擎中使用 `JSON.parse(atob(exportText))` 来获取 `legacy`。

## 测试转换后的存档

至少使用一个早期存档、一个晚期存档，以及一个来自不寻常状态的存档，比如正在进行的挑战。每个存档都要：

1. 转换一个副本并导入到端口。
2. 检查余额、所有权、完成情况、自定义字段和自动化设置。
3. 购买一些东西，并执行影响该状态的每一次重置。
4. 保存、重新加载，然后再次检查状态。
5. 从 3.x 导出并确认导出的存档可以重新导入。

导入不会触发从导入时间点的离线进度，只有加载才会。离线行为需要单独测试，特别是如果旧的自动化依赖很多小更新。

成功测试后，请保留原始的旧版导出。示例转换器只会生成一个新字符串，所以在开发过程中没有理由替换原始文件。

## 发布前的游戏检查

对比你从旧游戏记录的检查点：

- 主增益、声望增益、固定成本和软上限。
- 每种用于支付的货币以及每个挑战目标。
- 默认购买与自定义支付、一次购到最大、出售和重置。
- 即将到来的重置、保留状态、基础资源清零以及挑战的进入/退出。
- 锁定和停用的层、自动化顺序以及离线进度。
- 标签页、快捷键和表单。
- 终局玩法、“继续进行”，以及胜利后保存的存档。

一旦移植和转换准备就绪，向玩家解释从旧游戏导出和导入到新游戏的方法。旧版本的发布应保留足够长时间，让玩家能取回他们的存档。