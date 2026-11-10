# 动态 Quiz - Excel 配置模板 Schema

> 版本：v1.4
> 编写日期：2026-09-15
> v1.4 变更：**题目字段精简**（移除 `Questions.img_path`；新增 `Questions.correct_answer` 和 `Questions.content`，对齐现有 quiz 模板——`correct_answer` 是 1-based 索引，`content` 第 2 行填 article 介绍）；**Rules 拆为 Routing + ResultPages 两个 sheet**（4 → 5 sheet），消除原 11 列 3-in-1 的「必填/可选/留空」混乱矩阵——Routing 只管层间跳转（4 列），ResultPages 把「结果判定 + 结果页内容」合并为一张完整的「条件 → 渲染内容」表（6 列）
> v1.3 变更：**题目字段对齐现有 quiz**（`text` → `sub_title`、`options` → `question_options`、新增 `answer`）；**移除 `is_entry`**（约定首个 `layer_id` = 入口层，入口层恰好 1 个 group）；**移除 `bucket_min` / `bucket_max`**（路由只看 Rules.bucket）；**移除 `is_public`**（OptionTags 中无记录 = 公共题）
> v1.2 变更：**移除整个 Quiz sheet**（5 → 4 sheet）。文章 ID、标题从 Excel 文件名获取；status 由 CMS 控制；兜底结果页改在 Rules 表的 `result_page` 行用 `is_default` 列标识
> v1.1 变更：移除 `order` 相关列（`layer_order`、`group_order`、`Questions.order`、`Rules.order`），改为按表中行的上下顺序决定顺序（与现有 quiz 模板约定一致）
> 配套文档：
> - 需求规格：[`quiz-dynamic-requirements.md`](./quiz-dynamic-requirements.md) v1.2
> - 业务侧使用指南：[`quiz-dynamic-excel-user-guide.md`](./quiz-dynamic-excel-user-guide.md) v1.3
> - 实施方案：[`../design/quiz-dynamic-implementation-plan.md`](../design/quiz-dynamic-implementation-plan.md)
> - 配套模板：[`quiz-dynamic-template-v5.xlsx`](./quiz-dynamic-template-v5.xlsx)

---

## 0. 概述

### 0.1 用途

本文档定义**业务侧**配置一篇动态 Quiz 文章所需的 Excel 模板规范。
业务通过填充一个 `.xlsx` 文件（**5 个 sheet**）完成一篇文章的全部配置。

**文件名约定（v1.2 新增）**：

| 字段 | 来源 | 说明 |
|---|---|---|
| 文章 ID | Excel 文件名（去掉 `.xlsx` 后缀） | 例如 `quiz_pet.xlsx` → quiz_id=`quiz_pet`，全局唯一 |
| 文章标题 | Excel 文件名（去掉 `.xlsx` 后缀） | 默认与 ID 一致；CMS 后台可改名 |
| 状态 | CMS 后台控制 | Excel 不再维护 draft/published，由 CMS 切换 |
| 兜底结果页 | ResultPages 表的 `is_default=true` 行 | 全文必须有且仅有 1 行 `is_default=true` |

> **为什么要改文件名约定？**
> - 文章 ID 和标题在 Excel 文件被业务同事读到时已经一目了然，没必要重复填
> - status 与 CMS 的发布流绑定，不应该由 Excel 这种"数据文件"控制
> - 兜底结果页本质上属于"结果页集合"的一部分，放回 ResultPages 表更内聚

### 0.2 整体结构

```
quiz_<id>.xlsx          ← 文件名 = 文章 ID（去掉 .xlsx 后缀）；也是默认标题
┌─────────────────────────────────────────────────────────────────┐
│  Sheet 1  Structure     ← 层 + 题组（每行一个组，行序即顺序）    │
│  Sheet 2  Questions     ← 题目（选项用 &split& 拼接，行序即顺序）│
│  Sheet 3  OptionTags    ← 选项→标签映射（含标签元数据）         │
│  Sheet 4  Routing       ← 层间路由（每行 = 一条路由规则）        │
│  Sheet 5  ResultPages   ← 结果判定 + 结果页内容（每行 = 一个结果页）│
└─────────────────────────────────────────────────────────────────┘
```

例如 `quiz_pet.xlsx` 表示：
- `quiz_id` = `quiz_pet`
### 0.3 顺序约定

所有 sheet 内行的**上下顺序**决定业务含义上的顺序（与现有 quiz 模板的"无 order 列"约定一致）：
- `Structure` 行序 = 同层多组时的组顺序
- `Questions` 行序 = 同组多题时的题目顺序
- `OptionTags` 行序 = 无强语义（每行独立），但建议按"先 Q1 后 Q2"组织方便维护
- `Routing` 行序 = 路由规则优先级（首条命中原则）
- `ResultPages` 行序 = 结果规则优先级（首条命中原则）

### 0.4 入口层约定（v1.3 新增约定）

**入口层 = 第一个出现的 `layer_id`**（按 `Structure` 表的行序）。例如：

| 行 | layer_id | 含义 |
|---|---|---|
| 2 | L1 | L1 是入口层（第一个出现的 layer_id） |
| 4 | L2 | L2 是第 2 层 |

**入口层必须有且仅有 1 个 group**——因为入口层是用户进入漏斗的起点，业务上只可能有 1 个组。

> **为什么要去掉 `is_entry` 列？**
> - "第一个出现的 layer_id = 入口层" 是一个无歧义的约定，业务少填一列少一个下拉
> - 与"layer 级字段（layer_name、layer_default_tag）在同层多行重复填"的设计哲学一致——业务用"重复填"代替"额外的标识列"

### 0.5 与 DB 的对应关系

| Excel sheet | DB 表 | 备注 |
|---|---|---|
| `Structure` | `quiz_layers` + `quiz_groups` | 一行同时表达层和组的信息；导入时按 layer_id 分组展开 |
| `Questions` | `quiz_questions` + `quiz_options` | 一行表达题 + 选项；`question_options` 用 `&split&` 切分后展开为多条 option |
| `OptionTags` | `quiz_option_tags` | 一行 = 一条"选项→标签"映射 + 标签元数据 |
| `Routing` | `quiz_routing_rules` | 一行 = 一条路由规则 |
| `ResultPages` | `quiz_result_pages` | 一行 = 一个完整的结果页（包含判定条件 + 渲染内容） |

### 0.6 通用约定

- **Excel 文件名** = 文章 ID（如 `quiz_pet.xlsx` → `quiz_pet`）
- **题目选项**用 `&split&` 拼接（与现有 quiz 模板一致）
- **答案/正误**：v1.4 起 `correct_answer` 用 1-based 索引（与现有 quiz 模板对齐；`1` 表示第一个选项）
- **空值约定**：表头永远存在，数据行中"不需要填"的列留空即可，不要填 `null` 等字符串
- **ID 全局唯一**：`layer_id` / `group_id` / `question_id` 在各自作用域内唯一
- **跨 sheet 引用**：所有 ID 引用必须能在被引用 sheet 中找到对应行，否则导入失败
- **顺序 = 行序**：不要用 `order` 列

---
## 1. Sheet: `Structure`（漏斗层 + 题组）

### 1.1 用途

定义**漏斗层**和**题组**的层级关系。一行 = 一个组（同时属于某一层）。

为什么要把"层"和"组"放在一张表？因为它们的字段高度重叠，且在 Excel 里表达层级最简单的方式就是"同一 layer_id 重复出现"。Excel 没有子表概念，"一表打平"是约定。

### 1.2 字段详解

| 列 | 字段名 | 类型 | 必填 | 含义 / 作用 |
|---|---|---|---|---|
| **A** | `layer_id` | string | ✅ | 层唯一 ID（如 `L1`、`L2`）。同层多组时 layer_id 重复填 |
| **B** | `layer_name` | string | ✅ | 层展示名（如"入口层"、"程度与偏好"） |
| **C** | `layer_default_tag` | string | ✅ | 层无胜出时的兜底标签（业务定义，导入时会校验必须存在于 OptionTags） |
| **D** | `group_id` | string | ✅ | 题组唯一 ID（如 `G1`、`G_heavy_pet`），全局唯一 |
| **E** | `group_name` | string | — | 组展示名（可选）。导入后展示在前端引导语中 |

### 1.3 层的顺序

由 `layer_id` **第一次出现的行序**决定。例如：

| 行 | layer_id | ... |
|---|---|---|
| 2 | L1 | L1 是入口层 |
| 4 | L2 | L2 是第 2 层 |
| 6 | L3 | L3 是第 3 层 |

### 1.4 同层多个组的写法

同一 `layer_id` 在多行重复出现即可。例如 L2 有 2 个组（严重宠物 / 轻度宠物）：

| layer_id | layer_name | layer_default_tag | group_id | group_name |
|---|---|---|---|---|
| L2 | 程度与偏好 | L2.fallback | G_heavy_pet | 严重宠物 |
| L2 | 程度与偏好 | L2.fallback | G_light_pet | 轻度宠物 |

业务填 Excel 时只要重复填 `layer_id` / `layer_name` / `layer_default_tag` 即可（简单粗暴，零歧义）。

### 1.5 示例

| layer_id | layer_name | layer_default_tag | group_id | group_name |
|---|---|---|---|---|
| L1 | 入口层 | L1.fallback | G1 | 主问题 |
| L1 | 入口层 | L1.fallback | G2 | 公共信息 |
| L2 | 程度与偏好 | L2.fallback | G_heavy_pet | 严重宠物 |
| L2 | 程度与偏好 | L2.fallback | G_light_pet | 轻度宠物 |

### 1.6 校验规则

- `layer_id` 在所有行内唯一（按第一次出现的顺序）
- `group_id` 全局唯一
- 入口层（第一个 layer_id）必须恰好 1 个 group
- 所有非入口层**必须**填 `layer_default_tag`
- 同层多行的 `layer_id` / `layer_name` / `layer_default_tag` 必须一致

---
## 2. Sheet: `Questions`（题目）

### 2.1 用途

定义所有题目及其选项。一行 = 一道题。选项用 `&split&` 拼在一列里（沿用现有 quiz 模板的约定）。

### 2.2 字段详解

| 列 | 字段名 | 类型 | 必填 | 含义 / 作用 |
|---|---|---|---|---|
| **A** | `question_id` | string | ✅ | 题目唯一标识（如 `Q1`、`Q2`），全局唯一 |
| **B** | `group_id` | string | ✅ | 这道题属于哪个组。必须在 Structure 表中存在 |
| **C** | `sub_title` | string | ✅ | 题干展示文字（v1.3 起对齐现有 quiz 模板字段名） |
| **D** | `question_options` | string | ✅ | 选项列表，用 `&split&` 分隔（v1.3 起对齐现有 quiz 模板字段名）。例如：`宠物毛发&split&灰尘&split&顽固污渍&split&其他` |
| **E** | `answer` | string | — | 题目解释文本（v1.3 新增，可选）。前端展示在题干下方，例如 "房屋面积影响清洁频率。" |
| **F** | `correct_answer` | int | — | **正确答案索引（v1.4 新增，对齐现有 quiz 模板）**。**1-based**：填 `1` 表示第一个选项，`2` 表示第二个，依此类推。动态 quiz 通常用于推荐而非考核，可留空 |
| **G** | `content` | TEXT | — | **v1.4 新增，对齐现有 quiz 模板**。**第 2 行（article 介绍行）的 `content` 是文章开头的介绍文本**。题目行（第 3 行起）的 `content` 通常留空 |

> v1.4 变更：
> - 移除 `img_path`——动态 quiz 主要靠文字和选项互动，题图暂未启用，后续按需再加
> - 新增 `correct_answer`（1-based 索引）——对齐现有 quiz 模板的字段约定。动态 quiz 通常用于推荐，不强制填
> - 新增 `content`——第 2 行的 `content` 字段填 article 介绍文本（与现有 quiz 模板第 2 行 = 文章介绍的约定对齐）。题目行此字段通常留空
> - 字段重排：`question_options` 从 F 列调到 D 列，`answer` 从 D 列调到 E 列，`correct_answer` 新增在 F 列，`content` 新增在 G 列（业务少记一列对齐规则：选项在 D 列开始连续）

> v1.3 变更：
> - `text` → `sub_title`，`options` → `question_options`（与现有 quiz 模板字段命名对齐）
> - 新增 `answer`（题干解释，可选）
> - 移除 `is_public` 字段——公共题概念改为"**OptionTags 中无记录的题 = 公共题**"（见 §2.5）

### 2.3 组内题目的顺序

由同一 `group_id` 下题目在表中的**行序**决定。例如：

```
第 3 行: Q1, G1, 你家最主要的问题是？, ...   ← G1 第 1 题
第 4 行: Q2, G1, 你家有宠物吗？, ...          ← G1 第 2 题
第 5 行: Q3, G2, ...                          ← G2 第 1 题
```

业务按从上到下的顺序填，就是用户看到的顺序。

### 2.4 选项索引约定（与 OptionTags 对接）

`question_options` 用 `&split&` 切分后得到一个数组，业务在 OptionTags 表中用 `option_index`（**0-based**）引用具体选项：

```
question_options = "宠物毛发&split&灰尘&split&顽固污渍&split&其他"
                   ─────────  ────  ──────  ────
                   index=0   index=1 index=2 index=3
```

填 OptionTags 时：
1. 先看这道题在 Questions 表有几项 `question_options` 切分后的选项
2. 在 OptionTags 表填写该选项要给哪些标签加分（`option_index=0` / `1` / `2` / ...）

> **注意区分 `option_index`（0-based） 和 `correct_answer`（1-based）**——这是 v1.4 起与现有 quiz 模板对齐后的约定。

### 2.5 关于"公共题"（v1.3 重定义）

v1.3 起**公共题不再用 `is_public` 列标记**，改为通过 OptionTags 表的**存在性**自动判定：

| 在 OptionTags 中的状态 | 题目性质 |
|---|---|
| 该题有至少 1 条 OptionTags 记录 | **评分题**（参与标签打分） |
| 该题在 OptionTags 表**没有任何记录** | **公共题**（不参与评分） |

公共题用于收集用户信息（房屋面积、是否有宠物等），但不参与评分、不计入任何标签。典型用途：
- 用于业务了解用户画像
- 用于某些结果页的个性化文案（如"50㎡以下的公寓推荐 XXX"）
- OptionTags 表中**不应**出现该题的选项记录

> **为什么要去掉 `is_public` 列？**
> - 一个字段既出现在 Questions 又要在 OptionTags 表中保持一致性，容易漏改导致 bug
> - "OptionTags 中无记录即公共题" 是一个无歧义的推断规则，业务少填一列
> - 与"评分题必有 OptionTags 记录"形成对称的校验约束

### 2.6 示例

| question_id | group_id | sub_title | question_options | answer | correct_answer | content |
|---|---|---|---|---|---|---|
| | | | | | | 宠物清洁问题的朋友，欢迎来到我们的方案推荐 quiz。花 1 分钟回答几道题，我们会根据你的具体情况推荐最合适的清洁方案。 |
| Q1 | G1 | 你家最主要的问题是？ | 宠物毛发&split&灰尘&split&顽固污渍&split&其他 | | | |
| Q2 | G2 | 你的房屋面积是多少？ | 小于 50㎡&split&50-100㎡&split&大于 100㎡ | 房屋面积影响清洁频率。 | | |
| Q3 | G_heavy_pet | 严重程度如何？ | 非常严重&split&比较严重 | | | |
| Q4 | G_heavy_pet | 想自己处理还是找专业？ | 专业服务&split&自己动手 | | | |

> 第 2 行：`question_id` / `group_id` / `sub_title` / `question_options` / `answer` / `correct_answer` 全留空，仅 `content` 填 article 介绍（与现有 quiz 模板一致）
> Q1 的 `question_options` 切分后是 4 项：["宠物毛发", "灰尘", "顽固污渍", "其他"]
> OptionTags 中 Q1 的 `option_index` 取值 0/1/2/3（注意 0-based）
> 如果 Q1 是考核型题目，`correct_answer` 可填 `1`（表示第一个选项"宠物毛发"）
> Q2 是公共题——OptionTags 表中没有 Q2 的任何记录
> Q3/Q4 是评分题——OptionTags 表中各有 2 条记录

### 2.7 校验规则

- `question_id` 全局唯一
- 第 2 行的 `question_id` / `group_id` / `sub_title` / `question_options` 应留空（仅 `content` 填 article 介绍），业务漏填会报错
- 第 3 行起的 `question_id` / `group_id` / `sub_title` / `question_options` 必填
- `group_id` 必须存在于 Structure 表
- `question_options` 用 `&split&` 切分后非空
- `correct_answer` 必须在 `1` ~ 选项总数 之间（如果填了）；0 或超出范围报错
- **评分题**（在 OptionTags 表有记录）的选项必须完整覆盖所有 `option_index`
- 公共题（OptionTags 中无记录）的选项索引范围由前端限制（业务无需关心）

---
## 3. Sheet: `OptionTags`（选项 → 标签 + 标签元数据）

### 3.1 用途

把"选项"映射到"标签 + 分值 + 优先级"。一行 = 一条"当用户选了某选项时，标签 X 累加 N 分，优先级 P"的规则。

这里的"标签"是漏斗的核心——它决定了用户的胜出方向。多个标签在同一层中累积分值后取胜出者（详见 §3.3）。

### 3.2 字段详解

| 列 | 字段名 | 类型 | 必填 | 含义 / 作用 |
|---|---|---|---|---|
| **A** | `question_id` | string | ✅ | 引用 Questions 表的 `question_id` |
| **B** | `option_index` | int | ✅ | 引用该题的哪个选项（**0-based**）。Excel 下拉 `0`-`9` |
| **C** | `tag` | string | ✅ | 标签名。同一选项可映射到多个标签（多行） |
| **D** | `layer_id` | string | ✅ | 标签所属层（**决定该标签在哪一层参与打分**）。引用 Structure 表的 `layer_id` |
| **E** | `score` | int | ✅ | 该选项给该标签加的分数。**正整数**。Excel 下拉 `1`-`10`（业务可自由填其他值） |
| **F** | `priority` | int | ✅ | 同分时的决胜优先级（**1 = 最高优先级**）。Excel 下拉 `1`-`5`（业务可自由填其他值） |

### 3.3 关于分桶（score buckets）

业务侧在 OptionTags 表里只填**绝对分值**，`bucket`（分桶）由 Routing 表的 `bucket` 字段决定。这样做的目的：
- OptionTags 的分值只表示"严重程度"，不强制绑定到某个 bucket
- 业务可以在 Routing 表用 bucket 把同一标签的不同严重程度分流到不同下一层组

**示例**：

| question_id | option_index | tag | layer_id | score | priority |
|---|---|---|---|---|---|
| Q1 | 0 | pet_hair | L1 | 5 | 1 |
| Q1 | 1 | dust | L1 | 5 | 1 |

→ Q1 选项 0 选 pet_hair 标签 5 分（严重）；选项 1 选 dust 标签 5 分（同样严重）

然后在 Routing 表配置：
- `(tag=pet_hair, bucket=heavy) → G_heavy_pet`
- `(tag=dust, bucket=heavy) → G_light_pet`

→ "严重程度"由 score 决定（5 分 = heavy），bucket 是路由时的二级分类维度。

### 3.4 bucket 命名约定

业务可自由定义 bucket 名（如 `heavy` / `light` / `medium`），但建议：
- **跨题组保持一致**：同一标签在不同题组的 bucket 名应保持一致，否则路由规则会乱
- **特殊 bucket `(DEFAULT)` 和 `(ANY)` 是系统关键字**，业务不要用作实际 bucket 名

### 3.5 示例

| question_id | option_index | tag | layer_id | score | priority |
|---|---|---|---|---|---|
| Q1 | 0 | pet_hair | L1 | 5 | 1 |
| Q1 | 1 | dust | L1 | 5 | 1 |
| Q1 | 2 | grease | L1 | 5 | 1 |
| Q1 | 3 | other | L1 | 1 | 3 |
| Q3 | 0 | wants_pro | L2 | 3 | 1 |
| Q3 | 1 | wants_diy | L2 | 2 | 2 |
| Q4 | 0 | wants_pro | L2 | 5 | 1 |
| Q4 | 1 | wants_diy | L2 | 5 | 1 |

### 3.6 校验规则

- `question_id` 必须存在于 Questions 表
- `layer_id` 必须存在于 Structure 表
- `option_index` 必须 ≤ 对应题目的 `question_options` 切分后长度
- `score` 必填，正整数
- `priority` 必填，正整数；建议同一层同一选项的多个标签用不同 priority 表示决胜顺序

---
## 4. Sheet: `Routing`（层间路由）

### 4.1 用途

定义**层间路由规则**：用户在某一层胜出标签后，跳转到下一层的哪个组。

一行 = 一条路由规则。**首条命中原则**：从第一行开始扫描，第一条匹配的规则生效。具体规则放前面，兜底规则放最后。

### 4.2 字段详解

| 列 | 字段名 | 类型 | 必填 | 含义 / 作用 |
|---|---|---|---|---|
| **A** | `from_layer_id` | string | ✅ | 从哪一层出发。引用 Structure 表的 `layer_id` |
| **B** | `tag` | string | ✅ | 上一层胜出的标签。引用 OptionTags（业务命名匹配）。写 `(DEFAULT)` 表示**兜底**（任意标签都匹配） |
| **C** | `bucket` | string | ✅ | 标签的分桶名。写 `(ANY)` 表示**不区分 bucket**。Excel 下拉 `(ANY)` / `heavy` / `light` / `medium` |
| **D** | `target_group_id` | string | ✅ | 跳转到哪个组。引用 Structure 表的 `group_id` |

### 4.3 路由匹配语义

```
对于 routing 行 R：
  if (上一层胜出标签 == R.tag || R.tag == "(DEFAULT)")
     && (上一层 bucket == R.bucket || R.bucket == "(ANY)")
     → 跳转到 R.target_group_id
```

### 4.4 兜底规则（必配）

每篇 quiz 的每一层（除最后一层外）**必须**配 1 条兜底 routing：

| from_layer_id | tag | bucket | target_group_id |
|---|---|---|---|
| L1 | (DEFAULT) | (ANY) | G_fallback | ← 任意标签/任意 bucket 都跳到兜底组 |

### 4.5 示例

| from_layer_id | tag | bucket | target_group_id |
|---|---|---|---|
| L1 | pet_hair | heavy | G_heavy_pet |
| L1 | dust | heavy | G_light_pet |
| L1 | grease | heavy | G_light_pet |
| L1 | (DEFAULT) | (ANY) | G_light_pet | ← 兜底：任意标签/任意 bucket 都跳到 G_light_pet

### 4.6 校验规则

- `from_layer_id` 必须存在于 Structure 表
- `target_group_id` 必须存在于 Structure 表
- 入口层**不应该**有 routing 规则（入口层是固定起点）
- **必须**为每个非最后一层配置 1 条 `(DEFAULT) + (ANY)` 兜底规则
- 具体规则放在兜底规则之前（首条命中原则）

---

## 5. Sheet: `ResultPages`（结果判定 + 结果页内容）

### 5.1 用途

把"结果判定"和"结果页内容"**合并**到一张表——一行 = 一个完整的结果页（包含判定条件 + 渲染内容）。

为什么要合并？v1.3 的 Rules 表把 3 种规则（routing / result / result_page）塞在 11 列里，业务要查"某个结果页的判定条件"时要在同一张表里反复跳行。v1.4 拆 Routing 后，剩下 result + result_page 字段集高度重叠（都需要 condition_expr / result_page_id / title / content），合并反而更清晰。

**首条命中原则**：从第一行开始扫描，第一条 condition_expr 匹配的行生效，渲染该行的 title / content / img_path。

### 5.2 字段详解

| 列 | 字段名 | 类型 | 必填 | 含义 / 作用 |
|---|---|---|---|---|
| **A** | `result_page_id` | string | ✅ | 结果页唯一 ID（如 `RP_pro_pet`） |
| **B** | `condition_expr` | JSON string | ✅ | 跨层条件表达式（JSON 格式），表达"各层需要满足什么条件才命中此结果页"。详见 §5.3 |
| **C** | `title` | string | ✅ | 结果页标题（如"专业宠物清洁"） |
| **D** | `content` | TEXT | ✅ | 结果页正文（支持 HTML/Markdown，由前端模板渲染） |
| **E** | `img_path` | string | — | 结果页图片路径（可选） |
| **F** | `is_default` | bool | ✅ | 是否兜底结果页。全文**必须且仅有 1 行** `true`。Excel 下拉 `true` / `false` |

### 5.3 condition_expr 格式

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

### 5.4 兜底结果页（必配）

每篇 quiz **必须**配 1 条 `is_default=true` 的兜底行，通常放在最后：

| result_page_id | condition_expr | title | content | img_path | is_default |
|---|---|---|---|---|---|
| RP_default | `{"L1":{"any":true}}` | 推荐通用方案 | 通用清洁方案介绍。 | rp3.jpg | true |

**注意**：
- `condition_expr` 和 `is_default` 不冲突：兜底行**必须** `is_default=true`，但 `condition_expr` 仍然可以是 `{"any":true}`（表示任意层结果都匹配）
- 兜底行的语义是"业务规则都没命中时"渲染——前端会优先按 `condition_expr` 匹配，没命中再渲染 `is_default=true` 的行

### 5.5 示例

| result_page_id | condition_expr | title | content | img_path | is_default |
|---|---|---|---|---|---|
| RP_pro_pet | `{"L1":{"tag":"pet_hair","bucket":"heavy"}}` | 专业宠物清洁 | 推荐专业清洁服务，深度处理宠物毛发。 | rp1.jpg | false |
| RP_default | `{"L1":{"any":true}}` | 推荐通用方案 | 通用清洁方案介绍。 | rp3.jpg | true |

### 5.6 校验规则

- `result_page_id` 全局唯一
- `condition_expr` 必须是合法 JSON
- `title`、`content` 必填
- `is_default` 必填（`true` / `false`）
- 至少 1 行
- 全文 `is_default=true` 必须**恰好 1 条**

---
## 6. 数据验证规则汇总

### 6.1 Excel 数据验证（下拉）

| Sheet | 字段 | 下拉选项 |
|---|---|---|
| OptionTags | option_index | `0`-`9` |
| OptionTags | score | `1`-`10`（业务可自由填其他值） |
| OptionTags | priority | `1`-`5`（业务可自由填其他值） |
| Routing | bucket | `(ANY)` / `heavy` / `light` / `medium`（业务可自由填其他 bucket 名） |
| Routing | tag | `(DEFAULT)`（routing 行 B 列，业务可自由填具体 tag 名） |
| ResultPages | is_default | `true` / `false` |

> v1.4 变更：
> - Rules 表的下拉全部移除，分别移到 Routing 和 ResultPages 表对应字段
> - 新增 OptionTags.score 和 OptionTags.priority 下拉（业务可自由填其他值）
>
> v1.3 变更：移除 `Structure.is_entry` 和 `Questions.is_public` 两个下拉（字段已移除）。

### 6.2 跨 sheet 引用（数据验证下拉）

| 引用方 | 字段 | 被引用方 |
|---|---|---|
| Structure | layer_default_tag | OptionTags (同 layer).tag |
| Questions | group_id | Structure.group_id |
| OptionTags | question_id | Questions.question_id |
| OptionTags | layer_id | Structure.layer_id |
| Routing | from_layer_id | Structure.layer_id |
| Routing | target_group_id | Structure.group_id |

### 6.3 业务逻辑校验（导入时检查）

- 入口层（第 1 个 layer_id）恰好 1 个 group
- 每个非最后一层都有兜底 routing：`(DEFAULT)` + `(ANY)` → 兜底 group
- 每个非入口层都有 `layer_default_tag`
- 至少有 1 行 ResultPages（兜底行必须存在）
- ResultPages 表中**恰好 1 行** `is_default=true`
- 所有跨 sheet 引用 ID 都存在
- 每个 group 至少有 1 道题
- 每道评分题（在 OptionTags 表有记录）必须至少 1 条 OptionTags 记录
- 公共题（OptionTags 中无记录）**不应**在 OptionTags 中出现对应记录
- Routing 规则覆盖合理（每个 (tag, bucket) 都应能找到归属，否则会落到兜底）

---

## 7. 错误反馈示例

业务上传 Excel 后看到的错误格式：

```
✗ 导入失败，共 4 处错误：

[Structure] 第 3 行：A 列 layer_id="L3" 但同层其他行的 layer_id="L1"，layer 级字段不一致
[Questions] 第 5 行：B 列 group_id="G_typo" 在 Structure 表中不存在
[OptionTags] 第 8 行：A 列 question_id="Q99" 在 Questions 表中不存在
[ResultPages] 第 12 行：B 列 condition_expr 不是合法 JSON: "缺少右括号"
[Logic] 第 1 层 L1 有 2 个 group（入口层必须恰好 1 个 group）
[Logic] ResultPages 表中没有 is_default=true 的行（必须恰好 1 行）
```

错误格式：`[<Sheet名>] 第 <行号> 行：<列名> <错误描述>` 或 `[Logic] <业务规则描述>`

---

## 8. 完整业务示例

### 8.1 场景设定

**主题**：宠物清洁方案推荐（2 层漏斗）

- L1：识别用户问题（宠物毛发 / 灰尘 / 顽固污渍）
- L2：评估严重程度 + 用户偏好（找专业 / 自助）
- 2 个结果页（专业宠物清洁 / 推荐通用方案）

**文件命名**：`quiz_pet.xlsx` → `quiz_id=quiz_pet`，`title=quiz_pet`（CMS 可改名）

### 8.2 完整 Excel 数据

#### Sheet: Structure（5 列）
| layer_id | layer_name | layer_default_tag | group_id | group_name |
|---|---|---|---|---|
| L1 | 入口层 | L1.fallback | G1 | 主问题 |
| L1 | 入口层 | L1.fallback | G2 | 公共信息 |
| L2 | 程度与偏好 | L2.fallback | G_heavy_pet | 严重宠物 |
| L2 | 程度与偏好 | L2.fallback | G_light_pet | 轻度宠物 |

> L1 第一次出现在第 2 行 → L1 是入口层（约定首个 layer_id = 入口层）
> L2 第一次出现在第 4 行 → L2 是第 2 层

#### Sheet: Questions（7 列）
| question_id | group_id | sub_title | question_options | answer | correct_answer | content |
|---|---|---|---|---|---|---|
| | | | | | | 宠物清洁问题的朋友，欢迎来到我们的方案推荐 quiz。花 1 分钟回答几道题，我们会根据你的具体情况推荐最合适的清洁方案。 |
| Q1 | G1 | 你家最主要的问题是？ | 宠物毛发&split&灰尘&split&顽固污渍&split&其他 | | | |
| Q2 | G2 | 你的房屋面积是多少？ | 小于 50㎡&split&50-100㎡&split&大于 100㎡ | 房屋面积影响清洁频率。 | | |
| Q3 | G_heavy_pet | 严重程度如何？ | 非常严重&split&比较严重 | | | |
| Q4 | G_heavy_pet | 想自己处理还是找专业？ | 专业服务&split&自己动手 | | | |

> Q1/Q3/Q4 是评分题——OptionTags 表中有这些题的记录
> Q2 是公共题——OptionTags 表中没有 Q2 的任何记录（自动判定）

#### Sheet: OptionTags（6 列）
| question_id | option_index | tag | layer_id | score | priority |
|---|---|---|---|---|---|
| Q1 | 0 | pet_hair | L1 | 5 | 1 |
| Q1 | 1 | dust | L1 | 5 | 1 |
| Q1 | 2 | grease | L1 | 5 | 1 |
| Q1 | 3 | other | L1 | 1 | 3 |
| Q3 | 0 | wants_pro | L2 | 3 | 1 |
| Q3 | 1 | wants_diy | L2 | 2 | 2 |
| Q4 | 0 | wants_pro | L2 | 5 | 1 |
| Q4 | 1 | wants_diy | L2 | 5 | 1 |

#### Sheet: Routing（4 列）
| from_layer_id | tag | bucket | target_group_id |
|---|---|---|---|
| L1 | pet_hair | heavy | G_heavy_pet |
| L1 | dust | heavy | G_light_pet |
| L1 | grease | heavy | G_light_pet |
| L1 | (DEFAULT) | (ANY) | G_light_pet |

#### Sheet: ResultPages（6 列）
| result_page_id | condition_expr | title | content | img_path | is_default |
|---|---|---|---|---|---|
| RP_pro_pet | `{"L1":{"tag":"pet_hair","bucket":"heavy"}}` | 专业宠物清洁 | 推荐专业清洁服务，深度处理宠物毛发。 | rp1.jpg | false |
| RP_default | `{"L1":{"any":true}}` | 推荐通用方案 | 通用清洁方案介绍。 | rp3.jpg | true |

### 8.3 业务流程走查

**用户 L1 选了 Q1 选项 0（宠物毛发）**：
1. 系统累加：`pet_hair` (L1) +5 分
2. L1 胜出：`pet_hair`（假设是唯一标签，bucket=heavy）
3. 查 Routing 表：匹配第 2 行 `(L1, pet_hair, heavy) → G_heavy_pet`，跳转 G_heavy_pet 组

**用户在 G_heavy_pet 选了 Q3 选项 0（非常严重）+ Q4 选项 0（专业服务）**：
1. L2 累加：`wants_pro` +3 (Q3) +5 (Q4) = 8 分
2. L2 胜出：`wants_pro`，bucket=heavy

**所有层完成后查 ResultPages**：
1. 查 condition_expr：第 1 行 `{"L1":{"tag":"pet_hair","bucket":"heavy"}}` 匹配（但 L2 没指定，所以任意 L2 都匹配）→ 命中第 1 行
2. 渲染 RP_pro_pet 结果页（title="专业宠物清洁"，content="推荐专业清洁服务..."）

**用户没匹配到任何 ResultPages 行时**：
→ 渲染 RP_default（is_default=true 那行）

---

## 9. 与现有固定 Quiz 的兼容

- **共存不破坏**：新 quiz 走新 5-sheet 模板，老 quiz 仍走原单 sheet 模板
- **导入入口**：可以是同一个上传页面，根据 Excel **文件名后缀或前缀**自动分流（例如 `quiz_xxx.xlsx` 走动态模板，`fixed_xxx.xlsx` 走老模板；或单独提供动态 quiz 上传入口）
- **DB 隔离**：新 quiz 走 `quiz_templates.quiz_type='dynamic'`，老 quiz 走 `'fixed'`

---

## 10. 字段速查表（cheat sheet）

| Sheet | 列 | 字段名 | 必填 | 一句话作用 |
|---|---|---|---|---|
| Structure | A | layer_id | ✅ | 层唯一 ID |
| Structure | B | layer_name | — | 层展示名 |
| Structure | C | layer_default_tag | — | 层无胜出时的兜底标签 |
| Structure | D | group_id | ✅ | 题组唯一 ID |
| Structure | E | group_name | — | 组展示名 |
| Questions | A | question_id | ✅ | 题目唯一 ID |
| Questions | B | group_id | ✅ | 所属题组 |
| Questions | C | sub_title | ✅ | 题干文本（v1.3 起对齐现有 quiz） |
| Questions | D | question_options | ✅ | 选项 &split& 拼接（v1.3 起对齐现有 quiz） |
| Questions | E | answer | — | 题目解释文本（v1.3 新增，可选） |
| Questions | F | correct_answer | — | **正确答案 1-based 索引（v1.4 新增）** |
| Questions | G | content | — | **第 2 行 = article 介绍（v1.4 新增）** |
| OptionTags | A | question_id | ✅ | 引用题目 |
| OptionTags | B | option_index | ✅ | 选项索引（**0-based**） |
| OptionTags | C | tag | ✅ | 标签名 |
| OptionTags | D | layer_id | ✅ | 标签所属层 |
| OptionTags | E | score | ✅ | 加分数值 |
| OptionTags | F | priority | ✅ | 平局优先级（越小越优先） |
| Routing | A | from_layer_id | ✅ | 从哪一层出发 |
| Routing | B | tag | ✅ | 上一层胜出标签；(DEFAULT) 表示兜底 |
| Routing | C | bucket | ✅ | bucket 名；(ANY) 表示不区分 |
| Routing | D | target_group_id | ✅ | 跳转到哪个组 |
| ResultPages | A | result_page_id | ✅ | 结果页唯一 ID |
| ResultPages | B | condition_expr | ✅ | 跨层判定 JSON |
| ResultPages | C | title | ✅ | 结果页标题 |
| ResultPages | D | content | ✅ | 结果页正文（富文本）|
| ResultPages | E | img_path | — | 结果页图片 |
| ResultPages | F | is_default | ✅ | 是否兜底结果页（全文恰好 1 行 true） |

> v1.4 移除字段：
> - `Questions.img_path`（题图未启用，按需再加）
> - 旧 Rules 表的 `rule_type` / `from_layer_id` / `tag` / `bucket` / `target_group_id` / `condition_expr` / `result_page_id` / `is_default` / `title` / `content` / `img_path` 等 11 列已拆分到 Routing（4 列）+ ResultPages（6 列）
>
> v1.3 移除字段：
> - `Structure.is_entry`（入口层由约定决定）
> - `Questions.is_public`（公共题由 OptionTags 存在性推断）
> - `OptionTags.bucket_min` / `bucket_max`（路由只看 Rules.bucket；v1.4 起看 Routing.bucket）

---

## 11. 版本日志

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
- v1.3（2026-09-15）：
  - **题目字段对齐现有 quiz**：`Questions.text` → `sub_title`，`Questions.options` → `question_options`（与现有 quiz 模板字段命名一致，业务少一次认知切换）
  - **新增 `Questions.answer`**：题干解释文本（可选），前端展示在题干下方
  - **移除 `Structure.is_entry`**：约定首个 `layer_id` = 入口层（且入口层恰好 1 个 group），少一列少一个下拉
  - **移除 `OptionTags.bucket_min` / `bucket_max`**：分桶完全由 Rules 表的 `bucket` 字段表达，单一事实源，少两列
  - **移除 `Questions.is_public`**：公共题改为"OptionTags 中无记录即公共题"自动判定，少一列少一个下拉
  - 新增 §0.4 入口层约定、§2.5 公共题重定义、§3.3 分桶简化说明
  - 更新 §5.1 数据验证汇总、§7 完整示例、§9 字段速查表
- v1.4（2026-09-15）：
  - **移除 `Questions.img_path`**：动态 quiz 主要靠文字和选项互动，题图暂未启用，按需再加
  - **新增 `Questions.correct_answer`**：**1-based 索引**，对齐现有 quiz 模板（`1` = 第一个选项）。动态 quiz 通常用于推荐，可留空
  - **新增 `Questions.content`**：第 2 行（article 介绍行）的 `content` 填 article 介绍文本，对齐现有 quiz 模板"第 2 行 = 文章介绍"约定
  - **Questions 字段重排**：`question_options` 调到 D 列，`answer` 调到 E 列，`correct_answer` 在 F 列，`content` 在 G 列
  - **Rules 拆为 Routing + ResultPages 两个 sheet**（4 → 5 sheet）：
    - Routing 只管层间路由（4 列）：`from_layer_id` / `tag` / `bucket` / `target_group_id`
    - ResultPages 把"结果判定 + 结果页内容"合并为一行（6 列）：`result_page_id` / `condition_expr` / `title` / `content` / `img_path` / `is_default`
    - 业务不用再在 11 列 3-in-1 的矩阵里反复确认"这个字段必填还是可选还是留空"
  - 新增 §4 Routing、§5 ResultPages，更新 §0.2 结构图、§6.1 数据验证汇总、§8 完整示例、§10 字段速查表、§11 版本日志