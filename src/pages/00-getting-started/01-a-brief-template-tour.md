# 模板简要导览

模板应包含以下内容：

```text
main.js
index.html
tsconfig.json
src/
    prestige.js
assets/
    tmt.png
scripts/
    run/
    update/
tmt/
    engine/
    runtime/
    updater/
```

你大部分时间会在 `main.js` 和 `src` 中工作。其他文件用来加载、运行或编辑你的游戏。

## main.js

这是你游戏的入口文件。它从 `"tmt"` 导入 `defineMod`，导入声望层，并调用 `defineMod` 来启动游戏。

传给 `defineMod` 的对象用来配置你的游戏。

## src/prestige.js

此文件定义模板的声望层，并将其导出为 `prestige`。

随着游戏的增长，可以在 `src` 中放入更多层文件。每个文件都可以导出自己的 handle，然后 `main.js` 导入并包含到游戏中。

## index.html

这是浏览器加载的页面。它创建 `#tmt` 元素，加载 `main.js`，并链接引擎的样式表。

它的 import map 让 `"tmt"` 指向 `/tmt/engine/dist/tmt.js`，所以你的 JavaScript 可以用短路径导入，而不用写引擎文件夹的完整路径！

## tsconfig.json

它配置了编辑器的 JavaScript 检查，并告诉编辑器在何处找到 TMT 的声明。即使文件后缀是 `.js`，编辑器也可以用这个配置来提供属性建议并指出错误。

你可以保持默认设置。tsconfig 专门为 JS 用户设计，让你无成本享受到 TS 的好处。

## assets

这是存放你自己图片的方便位置。模板里包含 `tmt.png`，`index.html` 将它用作浏览器标签图标。

你以后可以根据需要替换图标。

## scripts

`run` 脚本启动本地服务器。`update` 脚本通过 Git 获取引擎和运行时更新。

你在 [创建游戏](00/00) 中已经使用过这两个脚本。稍后在 [完成](00/06) 中我们会讲更新内容。

## tmt

:::danger 这里是危险区
无论如何都不应修改这些文件，也不要向此文件夹或其子文件夹添加文件。这些是你之前看到的 TMT 子模块的本地副本。更新程序会管理它们，并且如果本地有更改，它会拒绝更新子模块！
:::

这些文件夹是 Git 子模块：

- `engine` 包含引擎，包括 `dist/tmt.js`、样式表和声明文件。
- `runtime` 包含用来服务项目的程序。
- `updater` 包含更新脚本。

准备好让模板成为你自己的了吗？继续阅读 [配置游戏](00/02)。