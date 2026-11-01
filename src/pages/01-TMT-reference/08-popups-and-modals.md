# 弹窗与模态框

临时信息用弹窗，遇到需要玩家回复的情况用模态框。

## popup(request) {type:void}

队列弹窗，包含以下字段：

- `message` {type:string} {必填} {html}  
  弹窗的主要内容。
- `title` {type:string} {可选} {html}  
  消息上方的标题。默认为`""`。
- `type` {type:"info" | "milestone" | "achievement" | "challenge"} {可选}  
  选择默认弹窗样式。默认为`"info"`。
- `color` {type:string} {可选}  
  覆盖弹窗背景颜色。默认为类型的默认样式。自动完成的弹窗使用图层的颜色。
- `durationMs` {type:number} {可选}  
  弹窗显示时间，以毫秒为单位。必须是1到2147483647的整数。默认值是`defineMod`的`ui.notifications.durationMs`，默认为3000。

里程碑、成就和挑战完成的弹窗会在成功完成后自动排队。

点击弹窗，或者聚焦并按回车或空格键即可关闭。

```js
onClick(context) {
  context.popup({
    title: "收集的能量",
    message: "你获得了<strong>10点能量</strong>!",
    color: "#009696",
    durationMs: 2000
  });
}
```

## 共享模态选项

警报、确认和提示使用以下字段：

- `message` {type: string} {必填} {html}  
主要模态内容。
- `title` {type: string} {可选} {html}  
模态标题。对于相应方法，默认值为 `"Alert"`、`"Confirm"` 或 `"Prompt"`。

## alert(options, onClose) {type: void}

显示带有关闭操作的消息。

- `onClose` {type: void} {可选} {仅回调}  
当玩家关闭警报时作为 `onClose(context)` 运行。默认为无操作。

## confirm(options, onResult) {type: void}

要求玩家接受或取消操作。

- `onResult` {type: void} {必填} {仅回调}  
作为 `onResult(context, confirmed)` 运行。`confirmed` 为 `true` 表示接受，`false` 表示取消。

```js
onClick(context) {
  context.confirm({
    title: "重置此层？",
    message: "这将重置该层啊！"
  }, (current, confirmed) => {
    if (confirmed) current.forceReset({ resetSource: true });
  });
}
```

在结果回调中使用 `current`。玩家做出响应时，原始 `context` 已经过期。

## prompt(options, onResult) {type: void}

使用共享的模态选项加上以下字段请求文本输入：

- `initialValue` {type: string} {可选}  
初始文本。默认值为 `""`。
- `multiline` {type: boolean} {可选}  
使用多行文本框而不是单行输入。默认值为 `false`。
- `readonly` {type: boolean} {可选}  
禁止编辑，适合复制生成的文本。默认值为 `false`。
- `validate` {type: true | string} {可选} {仅回调}  
在文本提交时以 `validate(context, text)` 运行。返回 `true` 表示接受，返回错误信息则保持同一个提示框打开。默认值为接受任何文本。

结果回调是第二个参数：

- `onResult` {type: void} {必填} {仅回调}  
`prompt` 的第二个参数，而不是 `options` 内的字段。以 `onResult(context, text)` 运行，text 是接受的文本，取消时为 `null`。

```js
onClick(context) {
  context.prompt({
    title: "给你的宠物起名字",
    message: "选择一个名字！",
    initialValue: context.layerState.petName,
    validate: (current, text) => text.trim() !== "" || "请选择一个名字！"
  }, (current, text) => {
    if (text !== null) current.layerState.petName = text.trim();
  });
}
```