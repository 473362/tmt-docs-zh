# 使用控制台

游戏启动后，浏览器控制台会暴露一个“tmt”接口和“十进制”构造函数。

`tmt.layers` 包含已注册的图层句柄。
`tmt.resources` 包含按资源名称键入的资源句柄。重复的名称会被编号为后缀。
`tmt.snapshot()` 返回一个分离、只读的 `{ player, layers }` 对象，包含当前状态的完整副本。

### tmt.edit

`tmt.edit` 可用于直接修改状态值。它的功能与其他引擎回调相同，并接收可写入的 [mod 上下文](01/06)。

```js
tmt.edit(context => context.stateOf(tmt.layers.p).points = new Decimal(1));

tmt.edit(context => {
context.player.points = new Decimal("1e100");
context.grantLayerPoints(tmt.layers.b, 1000);
context.reset(tmt.layers.b);
});
```

抛出错误、无效参数或无效状态会进入正常的[致命状态](01/09)。API在此状态下无法工作。