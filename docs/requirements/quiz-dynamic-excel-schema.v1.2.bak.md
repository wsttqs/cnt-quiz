# 动态 Quiz - Excel 配置模板 Schema

> 版本：v1.2
> 编写日期：2026-09-15
> v1.2 变更：**移除整个 Quiz sheet**（5 → 4 sheet）。文章 ID、标题从 Excel 文件名获取；status 由 CMS 控制；兜底结果页改在 Rules 表的 `result_page` 行用 `is_default` 列标识
> v1.1 变更：移除 `order` 相关列（`layer_order`、`group_order`、`Questions.order`、`Rules.order`），改为按表中行的上下顺序决定顺序（与现有 quiz 模板约定一致）
> 配套文档：
> - 需求规格：[`quiz-dynamic-requirements.md`](./quiz-dynamic-requirements.md) v1.2
> - 业务侧使用指南：[`quiz-dynamic-excel-user-guide.md`](./quiz-dynamic-excel-user-guide.md) v1.1
> - 实施方案：[`../design/quiz-dynamic-implementation-plan.md`](../design/quiz-dynamic-implementation-plan.md)
> - 配套模板：[`quiz-dynamic-template-v3.xlsx`](./quiz-dynamic-template-v3.xlsx)

---

## 0. 概述

### 0.1 用途

本文档定义**业务侧**配置一篇动态 Quiz 文章所需的 Excel 模板规范。
业务通过填充一个 `.xlsx` 文件（**4 个 sheet**）完成一篇文章的全部配置。

**文件名约定（v1.2 新增）**：

| 字段 | 来源 | 说明 |
|---|---|---|
| 文章 ID | Excel 文件名（去掉 `.xlsx` 后缀） | 例如 `quiz_pet.xlsx` → quiz_id=`quiz_pet`，全局唯一 |
| 文章标题 | Excel 文件名（去掉 `.xlsx` 后缀） | 默认与 ID 一致；CMS 后台可改名 |
| 状态 | CMS 后台控制 | Excel 不再维护 draft/published，由 CMS 切换 |
| 兜底结果页 | Rules 表的 `result_page` 行用 `is_default=true` 标识 | 全文必须有且仅有 1 行 `is_default=true` |

> **为什么要改文件名约定？**
> - 文章 ID 和标题在 Excel 文件被业务同事读到时已经一目了然，没必要重复填
> - status 与 CMS 的发布流绑定，不应该由 Excel 这种"数据文件"控制
> - 兜底结果页本质上属于"结果页集合"的一部分，放回 Rules 表更内聚

### 0.2 整体结构

```
quiz_<id>.xlsx          ← 文件名 = 文章 ID（去掉 .xlsx 后缀）；也是默认标题
┌─────────────────────────────────────────────────────────────┐
│  Sheet 1  Structure    ← 层 + 题组（每行一个组，行序即顺序）    │
│  Sheet 2  Questions    ← 题目（选项用 &split& 拼接，行序即顺序）│
│  Sheet 3  OptionTags   ← 选项→标签映射（含标签元数据）         │
│  Sheet 4  Rules        ← 路由 + 结果 + 结果页（行序即顺序）     │
└─────────────────────────────────────────────────────────────┘
```

例如 `quiz_pet.xlsx` 表示：
- `quiz_id` = `quiz_pet`
- `title` = `quiz_pet`（默认；可在 CMS 修改）
- 内容全部来自 4 个 sheet

### 0.3 顺序约定（v1.1 新增约定）

为了保持与现有 quiz 模板一致的简洁风格，**所有顺序由行在表中的上下位置决定**：

| 顺序概念 | 由谁决定 | 业务填写方式 |
|---|---|---|
| 层顺序（L1 → L2 → ...） | Structure 表中 `layer_id` 第一次出现的行序 | 把同一 `layer_id` 的所有组紧挨着填在一起 |
| 组顺序（层内 G1 → G2） | Structure 表中 `group_id` 在同 `layer_id` 下的行序 | 把同一层的组从上到下排好 |
| 题目顺序（组内 Q1 → Q2） | Questions 表中同一 `group_id` 下的行序 | 把同一组的题从上到下排好 |
| 路由匹配顺序 | Rules 表中 `rule_type=routing` 的行序 | 把最具体的规则放在最上面，兜底规则放最下面 |
| 结果匹配顺序 | Rules 表中 `rule_type=result` 的行序 | 把最具体的判定放最上面，`any:true` 兜底放最下面 |
| 结果页定义顺序 | Rules 表中 `rule_type=result_page` 的行序 | 任意，仅展示 |

> **不写 `order` 列的好处**：业务少填一列，系统少一个字段要校验；行拖拽即调整顺序，所见即所得。

### 0.4 与 DB 的对应关系

| Sheet | DB 表 | 说明 |
|---|---|---|
| Structure | `quiz_structures` | 层 + 题组合并存储（一行 = 一个 group） |
| Questions | `quiz_questions` | 题目 + 选项合并存储（options 用 `&split&` 拼接） |
| OptionTags | `quiz_option_tags` | 选项-标签映射 + 标签元数据 |
| Rules | `quiz_rules` | 路由 / 结果 / 结果页合并（`rule_type` 列区分） |
| （文件级） | `quiz_templates` | 文章元数据（quiz_id / title / status），从文件名 + CMS 注入 |

### 0.5 通用约定

- **ID 命名**：snake_case 英文（如 `L1`、`Q1`、`G1`、`RP_pro_pet`），与现有 quiz 一致
- **数组拼接**：用 `&split&` 分隔多个值（沿用现有约定），例如 `选项A&split&选项B&split&选项C`
- **跨 sheet 引用**：字符串 ID + Excel 数据验证下拉（保证拼写正确）
- **行索引**：从第 2 行开始（第 1 行是表头），导入报错时按业务看到的行号反馈
- **空值处理**：未填的列视为空字符串 / null，不强制填 0
- **覆盖语义**：同一 `quiz_id` 重新上传时先清后写（v1.2 已确认）

---

## 1. Sheet: `Structure`（漏斗层 + 题组）

### 1.1 用途

定义这篇 quiz 的**漏斗层结构**和**题组**。每一行是一个**题组**（即用户在某一层会看到的一组题）。

为什么层和组合在同一张表？因为层的信息（名称、默认标签）必须随它的所有组一起出现，拆成两张表会让业务填两层，繁琐且容易漏填。

### 1.2 字段详解

| 列 | 字段名 | 类型 | 必填 | 含义 / 作用 |
|---|---|---|---|---|
| **A** | `layer_id` | string | ✅ | 层唯一标识（如 `L1`、`L2`），同一 quiz 内唯一。命名建议：`L1`、`L2`... |
| **B** | `layer_name` | string | — | 层的中文展示名（如「入口层」「严重程度」），可空，主要用于后台阅读 |
| **C** | `layer_default_tag` | string | — | 本层**无胜出标签时**（所有标签得分都是 0、或所有标签平局无法决出）使用的兜底标签。必须存在于 OptionTags（同一 layer） |
| **D** | `group_id` | string | ✅ | 题组唯一标识（如 `G1`、`G_heavy_pet`），全局唯一。命名建议：`G1`、`G2`...或带语义 `G_heavy_pet` |
| **E** | `group_name` | string | — | 组的中文展示名（如「主问题」「验证题」），可空 |
| **F** | `is_entry` | bool | ✅ | 是否是入口组。**第一层**必须且只能有 **1 个** `true`（用户答题的起点）。其他层必须全是 `false`。Excel 下拉 `true`/`false` |

### 1.3 层的顺序

由 `layer_id` 在表中的**第一次出现行序**决定。例如：

```
第 2 行: L1, 入口层, ..., G1, ...     ← L1 出现在第 2 行，是第 1 层
第 3 行: L1, 入口层, ..., G2, ...     ← 还是 L1，同层
第 4 行: L2, 程度与偏好, ..., G_heavy_pet, ...  ← L2 第一次出现在第 4 行，是第 2 层
```

### 1.4 同层多个组的写法

同一个 `layer_id` 有多个组时，**layer 级字段（layer_name、layer_default_tag）必须在每行重复填一遍**。这样虽然有点冗余，但能让"层"和它的"组"始终绑在一起查看，不会出现漏配。

### 1.5 示例

| layer_id | layer_name | layer_default_tag | group_id | group_name | is_entry |
|---|---|---|---|---|---|
| L1 | 入口层 | L1.fallback | G1 | 主问题 | true |
| L1 | 入口层 | L1.fallback | G2 | 验证题 | false |
| L2 | 程度与偏好 | L2.fallback | G_heavy_pet | 严重宠物 | false |
| L2 | 程度与偏好 | L2.fallback | G_light_pet | 轻度宠物 | false |

> L1 有 2 个组（G1、G2），层字段重复填了两次。G1 是入口（is_entry=true）。
> L2 有 2 个组，层字段也重复填了 2 次。

### 1.6 校验规则

- 每个 `layer_id` 必须配齐 `layer_name`（可空）、`layer_default_tag`（可空但建议填）
- 同一 `layer_id` 的所有行的 layer 级字段必须一致（导入时校验）
- `is_entry=true` 在**第 1 层**必须恰好 1 个，其他层必须 0 个
- `layer_default_tag` 必须在 OptionTags 表中存在（同 layer）
- `group_id` 全局唯一

---

## 2. Sheet: `Questions`（题目）

### 2.1 用途

定义所有题目及其选项。一行 = 一道题。选项用 `&split&` 拼在一列里（沿用现有 quiz 模板的约定）。

### 2.2 字段详解

| 列 | 字段名 | 类型 | 必填 | 含义 / 作用 |
|---|---|---|---|---|
| **A** | `question_id` | string | ✅ | 题目唯一标识（如 `Q1`、`Q2`），全局唯一 |
| **B** | `group_id` | string | ✅ | 这道题属于哪个组。必须在 Structure 表中存在 |
| **C** | `text` | string | ✅ | 题干展示文字 |
| **D** | `is_public` | bool | ✅ | 是否是**公共题**：`true` = 公共题（不参与评分、不计入标签），`false` = 评分题。Excel 下拉 |
| **E** | `img_path` | string | — | 题图路径（可选），如 `q1.jpg`。CDN/相对路径由系统配置决定 |
| **F** | `options` | string | ✅ | 选项列表，用 `&split&` 分隔。例如：`宠物毛发&split&灰尘&split&顽固污渍&split&其他` |

### 2.3 组内题目的顺序

由同一 `group_id` 下题目在表中的**行序**决定。例如：

```
第 2 行: Q1, G1, 你家最主要的问题是？, ...   ← G1 第 1 题
第 3 行: Q2, G1, 你家有宠物吗？, ...          ← G1 第 2 题
第 4 行: Q3, G2, ...                          ← G2 第 1 题
```

业务按从上到下的顺序填，就是用户看到的顺序。

### 2.4 选项索引约定（与 OptionTags 对接）

OptionTags 表用 `(question_id, option_index)` 定位具体选项：

| option_index | 含义 |
|---|---|
| 0 | options 列 `&split&` 切分后的第 1 个选项 |
| 1 | 第 2 个选项 |
| 2 | 第 3 个选项 |
| ... | ... |

**业务填写 OptionTags 时**：
1. 打开 Questions 表，对照 `question_id` 行的 `options` 列
2. 从左到右数，第 1 个选项对应 `option_index=0`
3. 在 OptionTags 表填写该选项要给哪些标签加分

### 2.5 关于 `is_public`

公共题用于收集用户信息（房屋面积、是否有宠物等），但不参与评分、不计入任何标签。典型用途：
- 用于业务了解用户画像
- 用于某些结果页的个性化文案（如"50㎡以下的公寓推荐 XXX"）
- **不能** 在 OptionTags 表中出现对应的选项记录

### 2.6 示例

| question_id | group_id | text | is_public | img_path | options |
|---|---|---|---|---|---|
| Q1 | G1 | 你家最主要的问题是？ | false | q1.jpg | 宠物毛发&split&灰尘&split&顽固污渍&split&其他 |
| Q2 | G1 | 你家有宠物吗？ | true | q2.jpg | 有&split&没有 |
| Q3 | G_heavy_pet | 严重程度如何？ | false | q3.jpg | 非常严重&split&比较严重 |

> Q1 的 options 切分后是 4 项：["宠物毛发", "灰尘", "顽固污渍", "其他"]
> OptionTags 中 Q1 的 option_index 取值 0/1/2/3
> Q2 是公共题（is_public=true），不参与评分

### 2.7 校验规则

- `question_id` 全局唯一
- `group_id` 必须存在于 Structure 表
- `options` 用 `&split&` 切分后非空
- `is_public` 仅允许 `true` / `false`
- 公共题（`is_public=true`）的选项**不能**在 OptionTags 表中出现

---

## 3. Sheet: `OptionTags`（选项 → 标签 + 标签元数据）

### 3.1 用途

定义**每个选项会给哪些标签加分**，以及这些标签的属性（分值、优先级、分桶阈值）。

一张表合并了两个职责：
- **选项-标签映射**：哪道题的哪个选项给哪个标签加分
- **标签元数据**：这个标签的 priority（平局优先级）和 bucket 区间（分桶阈值）

为什么合并？因为同一个标签会出现在多道题里，标签属性（priority、bucket 区间）必须保持一致；拆成两张表会让业务维护两份，繁琐且容易不一致。

### 3.2 字段详解

| 列 | 字段名 | 类型 | 必填 | 含义 / 作用 |
|---|---|---|---|---|
| **A** | `question_id` | string | ✅ | 引用 Questions 表的 `question_id` |
| **B** | `option_index` | int | ✅ | 选项在 options 切分后的位置（**0-based**）。Excel 下拉 0-9 |
| **C** | `tag` | string | ✅ | 标签名，业务命名（如 `pet_hair`、`wants_pro`）。同 layer 内唯一 |
| **D** | `layer_id` | string | ✅ | 这个标签属于哪一层。引用 Structure 表的 `layer_id` |
| **E** | `score` | int | ✅ | 该选项对该标签的加分（可负，0 表示不加分）。可表示严重程度：分数越高问题越严重 |
| **F** | `priority` | int | ✅ | 平局优先级，整数越小越优先。当多个标签得分相同时，priority 最小的标签胜出 |
| **G** | `bucket_min` | int | — | 分桶下界（含）。与 `bucket_max` 一起定义该标签在哪个分桶 |
| **H** | `bucket_max` | int | — | 分桶上界（含） |

### 3.3 关于分桶（score buckets）

**为什么需要分桶？** 同一标签下，不同分数段可能需要走不同的下一层路径。例如宠物毛发问题：轻微 → 走 DIY 路线，严重 → 走专业服务。

**分桶怎么用？** 把标签按分数区间切成几个桶，每个桶对应一个 bucket 名（如 `heavy` / `light`），然后在 Rules 表的 `bucket` 列引用。

**业务填写方式**：把每个标签的不同分桶**展开为多条 OptionTags 行**，每行通过 `bucket_min` / `bucket_max` 表达落在哪个桶。

**示例**：把 `pet_hair` 标签分为两桶：

| question_id | option_index | tag | layer_id | score | priority | bucket_min | bucket_max |
|---|---|---|---|---|---|---|---|
| Q1 | 0 | pet_hair | L1 | 3 | 1 | 0 | 3 | ← 加 3 分时落在 light 桶
| Q1 | 0 | pet_hair | L1 | 4 | 1 | 4 | 10 | ← 加 4 分时落在 heavy 桶 |

**业务实操**：用户在 Q1 选了「宠物毛发」（option_index=0）：
- 如果只触发这一项：+3 分，落在 light 桶
- 如果还触发了其他项累加到 5 分：落在 heavy 桶

### 3.4 关于 `bucket` 命名

- `bucket_min` / `bucket_max` 是 OptionTags 表的**辅助参考字段**（业务填着方便）
- 实际路由时使用 Rules 表（`rule_type=routing`）的 `bucket` 字段，业务**自由命名**（如 `heavy` / `light` / `medium` / `urgent`）
- 两者**不必严格对应**，业务可按需自由定义。例如 OptionTags 里可以完全留空 bucket_min/max，只在 Rules 里决定 bucket

### 3.5 示例

| question_id | option_index | tag | layer_id | score | priority | bucket_min | bucket_max |
|---|---|---|---|---|---|---|---|
| Q1 | 0 | pet_hair | L1 | 5 | 1 | 4 | 10 |
| Q1 | 1 | dust | L1 | 5 | 1 | 4 | 10 |
| Q1 | 2 | grease | L1 | 5 | 1 | 4 | 10 |
| Q1 | 3 | other | L1 | 1 | 3 | 0 | 10 |
| Q3 | 0 | wants_pro | L2 | 3 | 1 | 4 | 10 |
| Q3 | 1 | wants_diy | L2 | 2 | 2 | 0 | 3 |
| Q4 | 0 | wants_pro | L2 | 5 | 1 | 0 | 10 |
| Q4 | 1 | wants_diy | L2 | 5 | 1 | 0 | 10 |

### 3.6 校验规则

- `(question_id, option_index, tag)` 组合唯一
- `question_id` 必须存在于 Questions 表
- `layer_id` 必须存在于 Structure 表
- `tag` 同 layer 内唯一（不同 layer 的标签互不冲突）
- `score` 整数；`priority` 整数（最小优先）
- `bucket_min <= bucket_max`；二者要么都填要么都空

---

## 4. Sheet: `Rules`（路由 + 结果判定 + 结果页）

### 4.1 用途

**三种规则合在一张表**，用 `rule_type` 列区分：

| rule_type | 作用 |
|---|---|
| `routing` | 层间路由：用户在某一层胜出标签后，跳转到下一层的哪个组 |
| `result` | 结果判定：所有层完成后，根据各层标签组合匹配到哪个结果页 |
| `result_page` | 结果页内容：定义一张结果页的标题、正文、图片 |

为什么合并？因为它们的字段集高度重叠（都需要 result_page_id / target_group_id 等），拆成 3 张表会让业务在多张表间反复跳转填写。

### 4.2 字段详解

| 列 | 字段名 | 类型 | 必填 | 含义 / 作用 |
|---|---|---|---|---|
| **A** | `rule_type` | enum | ✅ | 规则类型：`routing` / `result` / `result_page`。Excel 下拉 |
| **B** | `from_layer_id` | string | * | **routing 用**：从哪一层出发，引用 Structure 表的 `layer_id` |
| **C** | `tag` | string | * | **routing 用**：上一层的胜出标签。引用 OptionTags（业务命名匹配）。写 `(DEFAULT)` 表示**兜底**（任意标签都匹配） |
| **D** | `bucket` | string | * | **routing 用**：标签的分桶名。写 `(ANY)` 表示**不区分 bucket** |
| **E** | `target_group_id` | string | * | **routing 用**：跳转到哪个组，引用 Structure 表的 `group_id` |
| **F** | `condition_expr` | JSON string | * | **result 用**：跨层条件表达式（JSON 格式），表达"各层需要满足什么条件才命中此结果" |
| **G** | `result_page_id` | string | * | **result 用** 或 **result_page 用**：结果页 ID。result 行引用本表 type=result_page 的 ID；result_page 行定义自身 ID |
| **H** | `is_default` | bool | * | **result_page 用**（v1.2 新增）：是否兜底结果页。全文**必须且仅有 1 行** `true`。Excel 下拉 `true`/`false`。其他两种 rule_type 此列留空 |
| **I** | `title` | string | * | **result_page 用**：结果页标题 |
| **J** | `content` | TEXT | * | **result_page 用**：结果页正文（支持 HTML/Markdown，由前端模板渲染） |
| **K** | `img_path` | string | * | **result_page 用**：结果页图片路径（可选） |

> * = 取决于 rule_type，详见下表

### 4.3 三种 rule_type 的字段启用矩阵

| rule_type | 必填字段 | 可选字段 | 必须留空 |
|---|---|---|---|
| **routing** | `from_layer_id`, `target_group_id` | `tag`（默认 `(DEFAULT)`）, `bucket`（默认 `(ANY)`） | `condition_expr`, `result_page_id`, `is_default`, `title`, `content`, `img_path` |
| **result** | `condition_expr`, `result_page_id` | — | `from_layer_id`, `tag`, `bucket`, `target_group_id`, `is_default`, `title`, `content`, `img_path` |
| **result_page** | `result_page_id`, `title`, `content`, `is_default` | `img_path` | `from_layer_id`, `tag`, `bucket`, `target_group_id`, `condition_expr` |

### 4.4 路由（routing）的顺序

由 `rule_type=routing` 的行在表中的**行序**决定。匹配规则：**从第一行开始扫描，第一条匹配的规则生效**。因此业务需要把**具体的规则放在前面，兜底规则放在最后**。

#### 4.4.1 路由匹配语义

```
对于 routing 行 R：if (上一层胜出标签 == R.tag || R.tag == "(DEFAULT)")
                   && (上一层 bucket == R.bucket || R.bucket == "(ANY)")
                   → 跳转到 R.target_group_id
```

#### 4.4.2 兜底规则（必配）

每篇 quiz 的每一层（除最后一层外）**必须**配 1 条兜底 routing：
```
from_layer_id = L<n>     ← 当前层
tag           = (DEFAULT)
bucket        = (ANY)
target_group_id = G_xxx  ← 任意兜底组（建议配一个通用组）
```

### 4.5 结果判定（result）的顺序

由 `rule_type=result` 的行在表中的**行序**决定。同样是**首条命中原则**。

#### 4.5.1 condition_expr 格式

```json
{
  "L1": { "tag": "pet_hair", "bucket": "heavy" },
  "L2": { "any": true }
}
```

| 表达式 | 含义 |
|---|---|
| `{"tag": "X", "bucket": "Y"}` | 该层胜出标签必须是 X 且分桶必须是 Y |
| `{"any": true}` | 该层任意结果都匹配（**通常用于兜底**） |
| `{"tag": "X"}` | 简写，bucket 不限制 |

#### 4.5.2 兜底结果（必配）

每篇 quiz **必须**配 1 条 `any:true` 兜底 result，通常放在最后：
```json
{"L1": {"any": true}}    ← 只要 L1 任意结果就匹配
```
或更严格的：
```json
{"L1": {"any": true}, "L2": {"any": true}}   ← 所有层都任意
```

### 4.6 结果页（result_page）

定义一张可被 result 引用的结果页。内容字段：
- `title`：简短标题（如「专业宠物清洁」）
- `content`：富文本正文（HTML 或 Markdown），由前端模板渲染
- `img_path`：可选图片路径
- **`is_default`（v1.2 新增）**：是否兜底结果页。全文必须且仅有 1 行 `true`

**v1.2 为什么要新增 `is_default` 列？**

原来 v1.1 的设计是：Quiz sheet 里有个 `default_result_page_id` 列指向兜底页。
v1.2 移除了 Quiz sheet 后，兜底页 ID 没地方放——单独为它恢复一个 sheet 不划算，最自然的方式是在 Rules 表的 `result_page` 行直接用一个布尔字段标识。

**使用方式**：
1. 业务在 Rules 表填几张 `result_page` 行，其中**正好 1 行**的 H 列填 `true`，其他填 `false`（或留空）
2. 导入时校验：`is_default=true` 的行必须恰好 1 条，否则报错
3. 运行时：`result` 规则都没匹配上时（即落到 `any:true` 那条），找到 `is_default=true` 的结果页渲染

注意：`is_default` 列只对 `rule_type=result_page` 行有效；`routing` 和 `result` 行的 H 列必须留空。

### 4.7 校验规则

#### 通用
- `rule_type` 仅允许 `routing` / `result` / `result_page`
- 所有跨 sheet 引用 ID 都必须存在

#### routing 行
- `from_layer_id` 必须存在于 Structure 表
- `target_group_id` 必须存在于 Structure 表
- 第 1 层**不应该**有 routing 规则（第 1 层是固定入口）
- **必须**为每个非最后一层配置 1 条 `(DEFAULT) + (ANY)` 兜底规则
- `is_default` 必须留空

#### result 行
- `result_page_id` 必须在本表 type=result_page 行存在
- `condition_expr` 必须是合法 JSON
- **必须**配置至少 1 条 `any:true` 兜底规则
- `is_default` 必须留空

#### result_page 行
- `result_page_id` 全局唯一
- `title`、`content` 必填
- `is_default` 必填（`true` / `false`）
- 至少有 1 张 result_page 行
- 全文 `is_default=true` 必须**恰好 1 条**

---

## 5. 数据验证规则汇总

### 5.1 Excel 数据验证（下拉）

| Sheet | 字段 | 下拉选项 |
|---|---|---|
| Structure | is_entry | `true` / `false` |
| Questions | is_public | `true` / `false` |
| OptionTags | option_index | `0`-`9` |
| Rules | rule_type | `routing` / `result` / `result_page` |
| Rules | bucket | `(ANY)` / `heavy` / `light` / `medium`（routing 行） |
| Rules | tag | `(DEFAULT)`（routing 行 C 列，业务可自由填具体 tag 名） |
| Rules | is_default | `true` / `false`（仅 result_page 行） |

### 5.2 跨 sheet 引用（数据验证下拉）

| 引用方 | 字段 | 被引用方 |
|---|---|---|
| Structure | layer_default_tag | OptionTags (同 layer).tag |
| Questions | group_id | Structure.group_id |
| OptionTags | question_id | Questions.question_id |
| OptionTags | layer_id | Structure.layer_id |
| Rules (routing) | from_layer_id | Structure.layer_id |
| Rules (routing) | target_group_id | Structure.group_id |
| Rules (result) | result_page_id | Rules (type=result_page).result_page_id |

### 5.3 业务逻辑校验（导入时检查）

- 第 1 层有且仅有 1 个 `is_entry=true` 的 group
- 每层（非最后一层）都有兜底 routing：`(DEFAULT)` + `(ANY)` → 兜底 group
- 每层都有 `layer_default_tag`
- 至少有 1 条 `any:true` 兜底 result 规则
- Rules 表的 result_page 行中**恰好 1 行** `is_default=true`
- 所有跨 sheet 引用 ID 都存在
- 每个 group 至少有 1 道题
- 每道非公共题在 OptionTags 至少有 1 条记录
- 公共题（is_public=true）在 OptionTags 中无记录
- Routing 规则覆盖合理（每个 (tag, bucket) 都应能找到归属，否则会落到兜底）

---

## 6. 错误反馈示例

业务上传 Excel 后看到的错误格式：

```
✗ 导入失败，共 4 处错误：

[Structure] 第 3 行：A 列 layer_id="L3" 但同层其他行的 layer_id="L1"，layer 级字段不一致
[Questions] 第 5 行：B 列 group_id="G_typo" 在 Structure 表中不存在
[OptionTags] 第 8 行：A 列 question_id="Q99" 在 Questions 表中不存在
[Rules] 第 12 行：F 列 condition_expr 不是合法 JSON: "缺少右括号"
[Logic] 第 1 层 L1 没有 is_entry=true 的 group（必须配置入口题组）
[Logic] Rules 表的 result_page 行中没有 is_default=true 的行（必须恰好 1 行）
```

错误格式：`[<Sheet名>] 第 <行号> 行：<列名> <错误描述>` 或 `[Logic] <业务规则描述>`

---

## 7. 完整业务示例

### 7.1 场景设定

**主题**：宠物清洁方案推荐（2 层漏斗）

- L1：识别用户问题（宠物毛发 / 灰尘 / 顽固污渍）
- L2：评估严重程度 + 用户偏好（找专业 / 自助）
- 2 个结果页（专业宠物清洁 / 推荐通用方案）

**文件命名**：`quiz_pet.xlsx` → `quiz_id=quiz_pet`，`title=quiz_pet`（CMS 可改名）

### 7.2 完整 Excel 数据

#### Sheet: Structure
| layer_id | layer_name | layer_default_tag | group_id | group_name | is_entry |
|---|---|---|---|---|---|
| L1 | 入口层 | L1.fallback | G1 | 主问题 | true |
| L1 | 入口层 | L1.fallback | G2 | 公共信息 | false |
| L2 | 程度与偏好 | L2.fallback | G_heavy_pet | 严重宠物 | false |
| L2 | 程度与偏好 | L2.fallback | G_light_pet | 轻度宠物 | false |

> L1 第一次出现在第 2 行 → L1 是第 1 层
> L2 第一次出现在第 4 行 → L2 是第 2 层
> G1 是 L1 的入口组（is_entry=true）

#### Sheet: Questions
| question_id | group_id | text | is_public | img_path | options |
|---|---|---|---|---|---|
| Q1 | G1 | 你家最主要的问题是？ | false | q1.jpg | 宠物毛发&split&灰尘&split&顽固污渍&split&其他 |
| Q2 | G2 | 你的房屋面积是多少？ | true | q2.jpg | 小于 50㎡&split&50-100㎡&split&大于 100㎡ |
| Q3 | G_heavy_pet | 严重程度如何？ | false | q3.jpg | 非常严重&split&比较严重 |
| Q4 | G_heavy_pet | 想自己处理还是找专业？ | false | q4.jpg | 专业服务&split&自己动手 |

> G1 组内只有 Q1，Q2 属于 G2（公共信息组），Q3/Q4 属于 G_heavy_pet 组

#### Sheet: OptionTags
| question_id | option_index | tag | layer_id | score | priority | bucket_min | bucket_max |
|---|---|---|---|---|---|---|---|
| Q1 | 0 | pet_hair | L1 | 5 | 1 | 4 | 10 |
| Q1 | 1 | dust | L1 | 5 | 1 | 4 | 10 |
| Q1 | 2 | grease | L1 | 5 | 1 | 4 | 10 |
| Q1 | 3 | other | L1 | 1 | 3 | 0 | 10 |
| Q3 | 0 | wants_pro | L2 | 3 | 1 | 4 | 10 |
| Q3 | 1 | wants_diy | L2 | 2 | 2 | 0 | 3 |
| Q4 | 0 | wants_pro | L2 | 5 | 1 | 0 | 10 |
| Q4 | 1 | wants_diy | L2 | 5 | 1 | 0 | 10 |

#### Sheet: Rules
| rule_type | from_layer_id | tag | bucket | target_group_id | condition_expr | result_page_id | is_default | title | content | img_path |
|---|---|---|---|---|---|---|---|---|---|---|
| routing | L1 | pet_hair | heavy | G_heavy_pet | | | | | | |
| routing | L1 | dust | heavy | G_default | | | | | | |
| routing | L1 | grease | heavy | G_default | | | | | | |
| routing | L1 | (DEFAULT) | (ANY) | G_default | | | | | | |
| result | | | | | {"L1":{"tag":"pet_hair","bucket":"heavy"}} | RP_pro_pet | | | | |
| result | | | | | {"L1":{"any":true}} | RP_default | | | | |
| result_page | | | | | | RP_pro_pet | true | 专业宠物清洁 | 推荐专业清洁服务，深度处理宠物毛发。 | rp1.jpg |
| result_page | | | | | | RP_default | false | 推荐通用方案 | 通用清洁方案介绍。 | rp3.jpg |

> 路由前 3 条是具体规则：L1 胜出标签 + bucket → 跳对应组
> 路由第 4 条是兜底：(DEFAULT) + (ANY) → G_default
> 结果第 1 条：L1 标签是 pet_hair 且 bucket 是 heavy → 推到 RP_pro_pet
> 结果第 2 条是兜底：L1 任意结果 → RP_default
> 结果页 RP_pro_pet 行 H 列 `is_default=true`，标识兜底结果页

### 7.3 业务流程走查

假设用户回答：

1. Q1 选项 0（宠物毛发）→ OptionTags 加 5 分给 pet_hair
2. Q2 选项 0（小于 50㎡）→ 公共题，不评分

L1 评分：
- pet_hair: 5 分（priority=1）
- 胜出标签：pet_hair, 分数=5, 落入 heavy 桶（bucket_min=4, bucket_max=10）

L1 路由（按行顺序扫描）：
- 第 2 行：`(L1, pet_hair, heavy) → G_heavy_pet` ✓ 命中

进入 L2 (G_heavy_pet)，继续答题 Q3/Q4 → L2 评分 → ...

所有层完成后：
- 查 result 表：第 6 行 `{"L1":{"tag":"pet_hair","bucket":"heavy"}}` → 命中 → RP_pro_pet

渲染结果页 RP_pro_pet → 「专业宠物清洁」。

如果所有 result 规则都不匹配（理论上不应发生，因为 `any:true` 兜底存在）：
- 找 Rules 表 `is_default=true` 的行 → 渲染 RP_pro_pet（即 `is_default=true` 标记的那张）

---

## 8. 与现有固定 Quiz 的兼容

- **共存不破坏**：新 quiz 走新 4-sheet 模板，老 quiz 仍走原单 sheet 模板
- **导入入口**：可以是同一个上传页面，根据 Excel **文件名后缀或前缀**自动分流（例如 `quiz_xxx.xlsx` 走动态模板，`fixed_xxx.xlsx` 走老模板；或单独提供动态 quiz 上传入口）
- **DB 隔离**：新 quiz 走 `quiz_templates.quiz_type='dynamic'`，老 quiz 走 `'fixed'`

---

## 9. 字段速查表（cheat sheet）

| Sheet | 列 | 字段名 | 必填 | 一句话作用 |
|---|---|---|---|---|
| Structure | A | layer_id | ✅ | 层唯一 ID |
| Structure | B | layer_name | — | 层展示名 |
| Structure | C | layer_default_tag | — | 层无胜出时的兜底标签 |
| Structure | D | group_id | ✅ | 题组唯一 ID |
| Structure | E | group_name | — | 组展示名 |
| Structure | F | is_entry | ✅ | 是否为入口组（第 1 层必须恰好 1 个 true） |
| Questions | A | question_id | ✅ | 题目唯一 ID |
| Questions | B | group_id | ✅ | 所属题组 |
| Questions | C | text | ✅ | 题干文本 |
| Questions | D | is_public | ✅ | 是否公共题（不评分） |
| Questions | E | img_path | — | 题图路径 |
| Questions | F | options | ✅ | 选项 &split& 拼接 |
| OptionTags | A | question_id | ✅ | 引用题目 |
| OptionTags | B | option_index | ✅ | 选项索引（0-based） |
| OptionTags | C | tag | ✅ | 标签名 |
| OptionTags | D | layer_id | ✅ | 标签所属层 |
| OptionTags | E | score | ✅ | 加分数值 |
| OptionTags | F | priority | ✅ | 平局优先级（越小越优先） |
| OptionTags | G | bucket_min | — | 分桶下界 |
| OptionTags | H | bucket_max | — | 分桶上界 |
| Rules | A | rule_type | ✅ | routing / result / result_page |
| Rules | B | from_layer_id | * | routing：从哪一层出发 |
| Rules | C | tag | * | routing：上一层胜出标签；(DEFAULT) 表示兜底 |
| Rules | D | bucket | * | routing：bucket 名；(ANY) 表示不区分 |
| Rules | E | target_group_id | * | routing：跳转到哪个组 |
| Rules | F | condition_expr | * | result：跨层判定 JSON |
| Rules | G | result_page_id | * | result / result_page：结果页 ID |
| Rules | H | is_default | * | **result_page**：是否兜底结果页（v1.2 新增） |
| Rules | I | title | * | result_page：结果页标题 |
| Rules | J | content | * | result_page：结果页正文（富文本） |
| Rules | K | img_path | * | result_page：结果页图片 |

---

## 10. 版本日志

- v1.0（2026-09-14）：初版，5 sheet 精简方案
- v1.1（2026-09-15）：
  - **移除所有 `order` 列**：`layer_order`、`group_order`、`Questions.order`、`Rules.order`，改为按表中行的上下顺序决定顺序（与现有 quiz 模板约定一致）
  - 每个字段增加"含义 / 作用"详细说明
  - 新增 §0.3 顺序约定、§10 字段速查表
  - 数据验证下拉增加 `OptionTags.option_index`（0-9）
- v1.2（2026-09-15）：
  - **移除整个 Quiz sheet**（5 → 4 sheet）
  - 文章 ID、标题改从 **Excel 文件名**获取（去掉 `.xlsx` 后缀），减少业务重复填写
  - status 改为由 **CMS 控制**（Excel 不再维护）
  - 兜底结果页改在 Rules 表的 `result_page` 行用 **`is_default` 列（v1.2 新增）** 标识，替代原 `Quiz.default_result_page_id`
  - 新增 §0.1 文件名约定、§4.6 `is_default` 设计动机

