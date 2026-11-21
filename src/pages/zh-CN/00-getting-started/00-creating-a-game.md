# 创建游戏

本页将带你了解如何创建、下载和运行一款新的TMT游戏！

## 你需要什么

TMT 唯一的外部依赖是 Git。打开终端（Windows上的 PowerShell 或命令提示符），并执行：

```sh
git --version
```

如果它能打印出一个版本，那你就准备好了。否则，先安装[Git](https://git-scm.com/install)。Windows版Git也安装了Git Bash，你可以用它来执行下面的命令。

[有没有人帮我找个镜像]:#


:::warning 使用终端进行设置
GitHub Desktop 是 Windows 上使用基础 Git 和 GitHub 功能的常用解决方案。不幸的是，TMT 使用了 Git 子模块，而 GitHub Desktop 对此的支持有限。在终端中使用 Git 起初可能让人感到害怕，但这个教程会一步步带你完成。

别想太多，也许你会发现Git其实并不可怕，然后就待在终端里。如果不行，你仍然可以用GitHub Desktop提交并推送游戏更改。
:::

## 创建你的仓库

1. 在GitHub上打开[TMT模板](https://github.com/TheModdingTree/tmt-template)。
2. 点击`Use this template`按钮创建您自己的仓库！
3. 给它一个名字，然后点击`Code`并复制它的HTTPS链接。

在你想存放游戏的文件夹里打开一个终端。在Windows上，你可以使用Git Bash。执行以下命令，将示例URL替换为你复制的URL：

```sh
git clone --recurse-submodules https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
```

`--recurse-submodules`这段是会下载引擎、运行时和更新器以及你自己的文件。这些文件分别存在不同的仓库，但Git会帮你把它们放到模板的`tmt`文件夹里。

如果你已经克隆了游戏，没有这个选项，可以在下载的游戏文件夹里打开终端并运行：

```sh
git submodule update --init --recursive
```

在编辑器里打开整个游戏文件夹。你应该能看到`main.js`、`index.html`、`src`、`scripts`和`tmt`。

## 更新 TMT

在第一次运行游戏之前，先运行更新程序。克隆会下载模板记录的引擎和运行时版本，模板可能落后于最新版本。

打开你平台对应的启动器。对于终端命令，从你的游戏文件夹里运行：

|平台 |启动器 |
|--- |--- |
|Windows |`scripts/update/update-windows.bat` |
|macOS |`scripts/update/update-macos.command` |
|macOS 或 Linux 终端 |`bash scripts/update/update-unix.sh` |

选择“1”来更新当前版本分支，然后按照提示操作。等更新器完成后再继续。如果系统报告所有内容都已更新，那你就可以开始了！

## 运行你的游戏

### Windows

打开`scripts/run/run-windows.bat`。工作时保持终端窗口开启。

### macOS

打开`scripts/run/run-macos.command`。工作时保持终端窗口开启。

:::note 熟悉该终端的人士
如果你是已经知道终端工作原理，或者至少懂得如何在IDE内置终端里运行命令的用户，你完全可以在终端里运行相关脚本。macOS上，直接用“run-unix.sh”来执行终端。
:::

### Linux

在项目文件夹中打开终端并运行：

```sh
bash scripts/run/run-unix.sh
```


## 试试模板

你的浏览器应该在 `http://localhost:8080/` 处打开。如果没有，你自己去查看。你应该会看到点数增加和一个绿色的“P”节点。

编辑时保持运行时运行。先把文件保存到编辑器里，然后刷新浏览器查看更改。运行时会提供文件，但不会自动刷新页面。要停止它，请在终端按Ctrl+C。

## 如果出了差错

- 如果启动器要求克隆子模块：从项目文件夹中运行`git submodule update --init --recursive`。
- 如果你打开`index.html`但游戏没有启动：请使用启动器。直接运行HTML文件无法使用。
- 如果浏览器无法连接：检查运行时是否仍在运行，并且你使用的URL是否正确。
- 如果启动器报告该地址已被使用：停止运行时的另一个副本，或使用8080端口的另一个程序，然后再次启动。
- 如果编辑后游戏出现错误：检查报告的文件或属性，修正代码并刷新。

如需更多关于加载错误、存档或游戏体验问题的帮助，请参见[故障排除](03)。

接下来，[简单参观项目](00/01)。