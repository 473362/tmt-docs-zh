# Decimal

TMT 使用 `break_eternity.js` 的 Decimal 类来表示引擎数量。它支持远超 JavaScript 数字范围的数值。

看完这一页后，你可能会想去看看 [格式化](01/05) 来了解 TMT 的显示辅助工具，以及 [定义资源](01/03) 来学习如何将数量用作货币。

## 值

- `DecimalSource` {type: Decimal | ReadonlyDecimal | number | string}  
  接受用于 Decimal 值引擎字段和操作的输入。
- `Decimal` {type: 对象}  
  具有自定义算术和比较方法的数量。使用 `new Decimal(value)` 来构造。
- `ReadonlyDecimal` {type: 受保护的 Decimal}  
  通过只读上下文或受保护结果暴露的 Decimal。支持计算，但不能修改自身。

:::tip 大数值请用字符串
对于超过普通数值精度的数量，请使用文本。传递给 `new Decimal()` 的大于 `Number.MAX_VALUE` 的值等同于 `new Decimal(Infinity)`。

```js
const amount = new Decimal("1e1000");
const doubled = amount.mul(2);
const affordable = doubled.gte("1e999");
```
:::

JavaScript 的运算符如 `+`、`*` 和 `>` 会将值强制转换为数字或字符串。请改用 `.add`、`.mul` 和 `.gt`。

计算在数值巨大的情况下可能会进行四舍五入。

## 常用方法

这些调用以 `value` 作为接收者，它们返回结果而不是改变 `value`。

| 调用 | 结果 | 含义 |
| --- | --- | --- |
| `value.add(other)`, `value.plus(other)` | {type: Decimal} | 加法 |
| `value.sub(other)`, `value.minus(other)` | {type: Decimal} | 减法 |
| `value.mul(other)`, `value.times(other)` | {type: Decimal} | 乘法 |
| `value.div(other)` | {type: Decimal} | 除法 |
| `value.mod(other)` | {type: Decimal} | 取模（取余） |
| `value.pow(other)` | {type: Decimal} | 幂运算 |
| `value.root(other)` | {type: Decimal} | 任意次数方根 |
| `value.sqr()`, `value.sqrt()`| {type: Decimal} | 平方和平方根 |
| `value.cube()`, `value.cbrt()` | {type: Decimal} | 立方和立方根 |
| `value.abs()`, `value.neg()`, `value.recip()` | {type: Decimal} | 绝对值、取反和取倒数 |
| `value.floor()`, `value.ceil()`, `value.round()` | {type: Decimal} | 向下取整、向上取整和四舍五入 |
| `value.trunc()` | {type: Decimal} | 去掉小数部分 |
| `value.min(other)`, `value.max(other)` | {type: Decimal} | 返回最小值或最大值 |
| `value.clamp(minimum, maximum)` | {type: Decimal} | 限制取值范围 |
| `value.log10()`, `value.log2()`, `value.ln()` | {type: Decimal} | 常用底数对数 |
| `value.log(base)` | {type: Decimal} | 任意底数对数 |
| `value.eq(other)`, `value.neq(other)` | {type: boolean} | 是否相等 |
| `value.lt(other)`, `value.lte(other)` | {type: boolean} | 小于（可包含等于） |
| `value.gt(other)`, `value.gte(other)` | {type: boolean} | 大于（可包含等于） |
| `value.isFinite()` | {type: boolean} | 值是否有限 |
| `value.isNan()` | {type: boolean} | 值是否为 NaN |
| `value.toNumber()` | {type: number} | 将 Decimal 转换为数字 |

大多数操作也有静态形式，比如 `Decimal.add(left, right)` 和 `Decimal.max(left, right)`。静态 NaN 是 `Decimal.isNaN`，而实例方法是 `isNan`。

## 写入数量

在更新状态时分配结果：

```js
update(context, delta) {
const state = context.layerState;
state.energy = state.energy.add(new Decimal(5).mul(delta));
}
```

这个片段假设 `energy` 不是一个 [Resource](01/03)。对于被跟踪的层级货币收益，使用 `context.grantLayerPoints(handle, amount)`，这样 `best` 和 `total` 也会被更新。

## 表示和转换

十进制值是通过几个数字字段编码的。不建议直接编辑这些字段。相反，可以使用静态的 `fromNumber`、`fromString`、`fromDecimal`、`fromValue`、`fromMantissaExponent` 和 `fromComponents` 来构建十进制值。

## 十进制 API 表

下面的表格汇总了剩余相关的 Decimal 方法。

| 分类 | 方法 | 注释 |
| --- | --- | --- |
| 算术别名 | `subtract`（减法）, `multiply`（乘法）, `divide`（除法）, `divideBy`, `dividedBy`, `negate`（取负）, `negated`, `reciprocal`（倒数）, `reciprocate`, `modulo`（取模）, `modular` | |
| 符号和大小比较 | 静态方法 `sign`（符号）, `sgn`, `cmpabs`（比较绝对值）, `compare`（比较）, `minabs`（最小绝对值）, `maxabs`（最大绝对值）, `clampMin`（最小截断）, `clampMax`（最大截断） |  |
| 比较别名 | `equals`（等于）, `notEquals`（不等于）, `lessThan`（小于）, `lessThanOrEqualTo`（小于等于）, `greaterThan`（大于）, `greaterThanOrEqualTo`（大于等于） |
| 近似比较 | `cmp_tolerance`, `compare_tolerance`, `eq_tolerance`, `equals_tolerance`, `neq_tolerance`, `notEquals_tolerance`, `lt_tolerance`, `lte_tolerance`, `gt_tolerance`, `gte_tolerance` |
| 指数和对数 | `pLog10`, `absLog10`, `logarithm`（对数）, `pow10`, `pow_base`, `exp`（指数） |
| 阶乘和伽玛 | `factorial`（阶乘）, `gamma`（伽玛函数）, `lngamma` （伽玛对数） |
| 高阶运算 | `tetrate`, `iteratedexp`, `iteratedlog`, `slog`, `slog_internal`, `layeradd10`, `layeradd`, `lambertw`, `ssqrt`, `linear_sroot`, `pentate`, `penta_log`, `linear_penta_root` | slog几乎是最慢的方法，它在在数值<15的时候最卡 |
| 三角函数 | `sin`（正弦）, `cos`（余弦）, `tan`（正切）, `asin`（反正弦）, `acos`（反余弦）, `atan`（反正切）, `sinh`（双曲正弦）, `cosh`（双曲余弦）, `tanh`（双曲正切）, `asinh`, `acosh`, `atanh` | 在数值很大的时候是随机生成的 |
| 算术和几何成本 | 静态方法 `affordArithmeticSeries`, `sumArithmeticSeries`, 静态方法 `affordGeometricSeries`, `sumGeometricSeries` |
| 取倒数 | 静态方法 `increasingInverse` |

算术和几何数列的辅助方法对实现你自己的 buymax 功能特别有用。

最后，Decimal 还包括以下常量：`dZero`（零）, `dOne`（一）, `dNegOne`（负一）, `dTwo`（二）, `dTen`（十）, `dNaN`（非数字）, `dInf`（正无穷）, `dNegInf`（负无穷）, `dNumberMax`（最大数字）, `dNumberMin`（最小数字）, `dLayerSafeMax`, `dLayerSafeMin`, `dLayerMax`, 和 `dLayerMin`。

