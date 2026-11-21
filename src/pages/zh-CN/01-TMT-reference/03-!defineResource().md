# defineResource()

`defineResource` 可以把自定义数量连接到引擎的货币操作中。返回的句柄可以用来处理升级和可购买成本、挑战目标、重置资源，以及上下文资源方法。

资源本身不会生成保存状态，它依赖于你的基础状态。

本页使用的共享类型：

- `DecimalSource` {type: Decimal | ReadonlyDecimal | 数字 | 字符串}  
接受 Decimal 类型字段和操作的输入。更多信息请参见 [Decimal](01/04)。
- `Decimal` {type: 对象}  
一个带有自定义算术和比较方法的数量。更多信息请参见 [Decimal](01/04)。
- `LayerHandle` {type: 层身份}  
由 [defineLayer](01/01) 返回。只暴露该层的 `id` 和 `points` 资源，通过上下文访问其状态。

## 属性

- `name` {type: string} {必填}  
资源的名称。
- `owner` {type: LayerHandle} {可选}  
拥有该资源的层。
- `get` {type: DecimalSource} {必填} {仅回调}  
以 `get(context)` 运行以读取余额。
- `set` {type: void} {必填} {仅回调}  
以 `set(context, value)` 运行以更改余额。

资源句柄只会暴露 `name` 和 `owner`。请保留并使用原始句柄。

所有者不能决定值的存储位置，也不能在层被锁定时阻止访问。获取或设置值必须使用 `context.stateOf(handle)` 来访问层状态。

## 内置资源

### points {type: DecimalResource}

TMT 导出的主要资源。读写 `context.player.points`。它没有拥有者，句柄名称总是 `"points"`。

### layer.points {type: DecimalResource}

每个层的句柄都会暴露它的资源。它的拥有者是该层，名称来自该层的 `resource`。读写该层的 `points` 状态。

物品花费和挑战目标默认使用当前层的货币。普通和静态重置通过 `reset.resource` 选择它们的基础货币。

## 资源操作

使用 `context.getResource(handle)` 来读取余额，使用可写上下文的 `setResource`、`addResource` 和 `spendResource` 方法来更改余额。有关签名和行为，请参阅 [读取状态和资源](01/06?s=reading-state-and-resources) 和 [更改资源](01/06?s=changing-resources)。

:::tip 跟踪货币
直接向 `layer.points` 写入资源不会更新 `best` 或 `total`。当收益应该计入这些记录时，请使用 `grantLayerPoints`。
:::

## 例子

```js
const prestige = defineLayer({
    id: "prestige",
    name: "Prestige",
    symbol: "P",
    color: "#22f54c",
    row: 0,
    resource: "声望点数",
    startState: () => ({ energy: new Decimal(0) })
});

const energy = defineResource({
    name: "能量",
    owner: prestige,
    get: context => context.stateOf(prestige).energy,
    set(context, value) {
        context.stateOf(prestige).energy = value;
    }
});
```


