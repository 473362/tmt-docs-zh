# 格式化

TMT 提供了五个用来显示数量和经过时间的辅助工具。

本页使用的共享类型：

- `DecimalSource` {type: Decimal | ReadonlyDecimal | number | string} 
用于 Decimal 值字段和运算的输入。更多信息请参见 [Decimal](01/04)。

## 共享参数

- `value` {type: DecimalSource} {必填} 
要格式化的数量。
- `precision` {type: number} {可选} 
如可能，显示的分数精度。必须是 0 到 99 之间的整数。默认值取决于具体的辅助工具。有些记法会使用自己的精度，详见下文。

无效的数字字符串会按照 Decimal 解析，可以显示 `"NaN"`。下面所有辅助工具都会返回显示文本。


## format(value, precision) {type: string}

通用格式化器。`precision` 默认为 `2`。负数会带上前导负号，零会按照指定的精度显示。

不同的数值会使用不同的表示法。下表列出了使用的表示法：

:::note 区间
如果你不熟悉区间表示法（如下表所示）：(x, y) 表示从 x 到 y 之间的值，不包括 x 和 y，而 \[x, y] 表示从 x 到 y，包括 x 和 y。
:::

| 起始值 | 显示 |
| --- | --- |
| (0, 0.0001) | 倒数后格式化，后跟 `⁻¹` |
| [0.0001, 1000) | 原样显示 |
| [1000, 1,000,000) | 用逗号分隔显示 |
| [1e6, 1e10000) | 指数表示法 |
| [1e10000, 1e1000000) | 指数表示法，无精度 |
| [`1e1000000`, eeee1000) | 仅显示指数 |
| [`eeee1000`, ∞) | 使用 F 表示法，基于超级对数 |

F 表示法在 `F` 前保留三位小数，`F` 后显示整个超级对数。一旦超级对数达到 `1e6`，显示格式变为 `F` 后跟格式化后的整个超级对数。

使用 `format(value, 0)` 可以显示整数。这仍然允许使用指数和倒数表示法。

四舍五入不会重新选择表示法。这就是为什么一个略小于 `1000` 的数值可能显示为 `1000.00` 而没有逗号。

## exponentialFormat(value, precision, showMantissa) {type: string}

显示尾数和指数。`precision` 默认值为 `2`。

- `showMantissa` {type: boolean} {可选}  
控制是否显示 `e` 前面的部分。默认值为 `true`。

| 调用 | 结果 |
| --- | --- |
| `exponentialFormat(0)` | `"0.00e0"` |
| `exponentialFormat(0, 2, false)` | `"e0"` |
| `exponentialFormat(9999.9, 2)` | `"1.00e4"` |
| `exponentialFormat(12345, 2, false)` | `"e4"` |
| `exponentialFormat("1e10000")` | `"1.00e10,000"` |
| `exponentialFormat("1e1000000")` | `"1.00e1.000e6"` |

## commaFormat(value, precision) {type: string}

显示带逗号分隔的数值。`precision` 默认是 `0`。小于 `0.001` 的数值会按照指定精度显示为 0。

如果 Decimal 在转成字符串后用了其他表示法，这个辅助函数会保持原样，而不会在这个表示法内部加逗号。

| 调用 | 结果 |
| --- | --- |
| `commaFormat(12345.678)` | `"12,346"` |
| `commaFormat(12345.678, 2)` | `"12,345.68"` |
| `commaFormat(-12345.6, 1)` | `"-12,345.6"` |
| `commaFormat(0.0001)` | `"0"` |
| `commaFormat("1e100")` | `"1e100"` |

## simpleFormat(value, precision) {type: string}

以自身的形式显示一个值，并使用请求的精度。`precision` 默认为 `2`。小于 `0.0001` 的数值显示为零。

| 调用 | 结果 |
| --- | --- |
| `simpleFormat(1234.567)` | `"1234.57"` |
| `simpleFormat(0.01234)` | `"0.0123"` |
| `simpleFormat(0.01234, 0)` | `"0"` |
| `simpleFormat(0.00001)` | `"0.00"` |

## timeFormat(seconds) {type: string}

使用秒、分钟、小时、天和年显示经过的时间。

- `seconds` {type: DecimalSource} {必填}  
经过的时间（秒）。负值显示为零。单位分隔前四舍五入到百分位。

一年按 `365` 天计算。四舍五入可能会影响到下一个分钟、小时、天或年。没有精度参数。

| 调用 | 结果 |
| --- | --- |
| `timeFormat(-1)` | `"0.00s"` |
| `timeFormat(59.999)` | `"1m 0.00s"` |
| `timeFormat(3661.25)` | `"1h 1m 1.25s"` |
| `timeFormat(86400)` | `"1d 0h 0m 0.00s"` |
| `timeFormat(31536000)` | `"1y 0d 0h 0m 0.00s"` |
| `timeFormat(Infinity)` | `"Infinity"` |
| `timeFormat(-Infinity)` | `"0.00s"` |