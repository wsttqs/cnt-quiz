# 动态 Quiz 文章模板 - 业务使用指南

> 版本：v1.3
> 编写日期：2026-09-15
> 适用模板：[`quiz-dynamic-template-v5.xlsx`](./quiz-dynamic-template-v5.xlsx)
> 配套技术 Schema：[`quiz-dynamic-excel-schema.md`](./quiz-dynamic-excel-schema.md) v1.4
> 本文档受众：**业务同事**（运营/内容），不涉及技术实现细节

> v1.3 变更：**5 sheet 结构**（v1.3 把原 11 列的 Rules 表拆为 Routing + ResultPages 两个 sheet）；**Questions 新增 `correct_answer`（1-based 索引，对齐现有 quiz）+ `content`（第 2 行 = article 介绍，对齐现有 quiz）**；移除 `Questions.img_path`；新增 OptionTags 的 `score` 和 `priority` 下拉
> v1.2 变更：题目字段对齐现有 quiz（`text` → `sub_title`、`options` → `question_options`、新增 `answer`）；移除 `is_entry`（约定首个 `layer_id` = 入口层）；移除 `bucket_min`/`bucket_max`（路由只看 Routing.bucket）；移除 `is_public`（OptionTags 中无记录 = 公共题）
> v1.1 变更：移除 Quiz sheet（5 → 4 sheet），新增 §2 文件名约定、§5.4 `is_default` 列说明

---

## 1. 这是什么？

动态 Quiz 是一种**根据用户答题路径，动态展示不同题目、最终推荐不同结果**的文章。

相比传统固定顺序的 Quiz，它能：

- **识别用户特征**（如「宠物毛发严重」vs「轻微灰尘」）
- **针对特征推送差异化题目**（严重场景追加问严重程度，轻微场景直接给方案）
- **匹配最合适的最终结果**（专业清洁 / DIY 方案 / 通用方案）

所有这些"动态判断"都通过 5 个 Excel sheet 配置，**不需要写代码、不需要前端配合**。

---

## 2. 文件命名约定（v1.2 新增）

**重要**：从 v1.2 起，Excel 文件名本身就是文章元数据。

```
quiz_<id>.xlsx
```

| 字段 | 来源 | 举例 |
|---|---|---|
| 文章 ID | 文件名（去掉 `.xlsx` 后缀） | `quiz_pet.xlsx` → `quiz_pet` |
| 文章标题 | 文件名（默认与 ID 一致） | `quiz_pet`（CMS 后台可改名） |
| 状态（draft / published） | **CMS 控制**，不在 Excel 里 | — |

**命名建议**：
- ✅ 用英文或拼音：`quiz_pet`、`quiz_cleaning`、`quiz_quiz_my_home`
- ✅ 简短、见名知意
- ❌ 不要有空格：`quiz pet.xlsx` ❌
- ❌ 不要带中文：`quiz_宠物.xlsx` ❌（不同系统兼容差）
- ❌ 不要用特殊字符：`quiz@pet.xlsx` ❌

---

## 3. 5 分钟上手（最小配置）

### 3.1 业务场景

> 一个最简单的 1 层 quiz，问 1 道题，根据答案直接出结果。

### 3.2 5 个 sheet 各填什么

| Sheet | 行数 | 关键内容 |
|---|---|---|
| **Structure** | 1 行 | 1 个层 L1 + 1 个入口组 G1 |
| **Questions** | 2 行 | 第 2 行 = article 介绍（仅 content 列填）；第 3 行 = 1 道题，2 个选项 |
| **OptionTags** | 2 行 | 每个选项绑定一个标签 + 加分 |
| **Routing** | 0 行 | 单层 quiz 没有层间跳转，不需要 routing |
| **ResultPages** | 2-3 行 | 1-2 张结果页（含 1 张兜底） |

### 3.3 最小配置示例

假设文件命名为 `quiz_simple.xlsx`（→ `quiz_id=quiz_simple`，`title=quiz_simple`）。

#### Structure（5 列）
| layer_id | layer_name | layer_default_tag | group_id | group_name |
|---|---|---|---|---|
| L1 | 入口层 | fallback_tag | G1 | 主问题 |

> L1 是入口层（Structure 表中第一个出现的 layer_id），且入口层恰好 1 个 group G1。

#### Questions（7 列）
| question_id | group_id | sub_title | question_options | answer | correct_answer | content |
|---|---|---|---|---|---|---|
| | | | | | | 5 分钟测出你最适合的方案！花 1 分钟答完 1 道题。 |
| Q1 | G1 | 你喜欢什么颜色？ | 红色&split&蓝色 | | | |

> **第 2 行**（article 介绍行）：所有题目字段都留空，只在最后一列 `content` 填 article 介绍文本（对齐现有 quiz 模板）。
> **第 3 行起**：正常填题目字段。这里 `correct_answer` 留空（推荐类 quiz 不强制）。

#### OptionTags（6 列）
| question_id | option_index | tag | layer_id | score | priority |
|---|---|---|---|---|---|
| Q1 | 0 | red | L1 | 5 | 1 |
| Q1 | 1 | blue | L1 | 5 | 1 |

#### Routing（4 列）
（空——单层 quiz 无层间路由）

#### ResultPages（6 列）
| result_page_id | condition_expr | title | content | img_path | is_default |
|---|---|---|---|---|---|
| RP_red | {"L1":{"tag":"red"}} | 红色推荐 | 推荐红色的产品 | rp_red.jpg | false |
| RP_default | {"L1":{"any":true}} | 默认推荐 | 推荐通用产品 | rp_default.jpg | **true** |

**效果**：用户选「红色」→ RP_red；用户选「蓝色」→ 兜底 RP_default（也是 `is_default=true` 的那张）。

### 3.4 关键观察

- 没有 Quiz sheet：所有元数据都在文件名和 CMS 里
- 没有 `is_entry` / `is_public` 列：入口层由约定决定；公共题由 OptionTags 推断
- 第 2 行是 article 介绍行（与现有 quiz 模板约定一致）
- ResultPages 表有 2 行（含 1 张兜底 RP_default，`is_default=true`）
- 单层 quiz 的 Routing 表为空——只有多层漏斗才需要

---

## 4. 完整使用流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 下载模板    │ ──> │ 填充配置    │ ──> │ 上传系统    │ ──> │ 验证上线    │
│ v5.xlsx     │     │ 5 个 sheet  │     │ 后台导入    │     │ CMS 发布    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 步骤 1：下载模板

从 CMS 后台或文档库下载 [`quiz-dynamic-template-v5.xlsx`](./quiz-dynamic-template-v5.xlsx)。

### 步骤 2：填充配置

按本文档 §3 的最小配置示例 或 §5 的字段详解 填充 5 个 sheet。

### 步骤 3：上传系统

CMS 后台 → 动态 Quiz 上传入口 → 选择填好的 Excel 文件 → 系统自动校验。

### 步骤 4：验证上线

- 系统校验通过后，默认 `draft` 状态（不影响线上）
- CMS 后台预览答题流程，确认无误后手动 `published`
- 通常 < 5 秒生效

---

## 5. 字段详解

### 5.1 Sheet: `Structure`（5 列）

| 列 | 字段名 | 必填 | 一句话作用 |
|---|---|---|---|
| A | `layer_id` | ✅ | 层唯一 ID（如 `L1`、`L2`） |
| B | `layer_name` | — | 层展示名（如「入口层」「严重程度」） |
| C | `layer_default_tag` | — | 本层无胜出标签时的兜底标签 |
| D | `group_id` | ✅ | 题组唯一 ID（如 `G1`、`G_heavy_pet`） |
| E | `group_name` | — | 组展示名（如「主问题」） |

**v1.2 新约定**：**入口层 = Structure 表中第一个出现的 `layer_id`**（行序最上面的层）。

- 入口层**恰好 1 个 group**（用户答题的起点）
- 入口层之外的层可以有任意多个 group
- 不需要任何 `is_entry` 标记——约定即定义

**填写示例**（2 层漏斗，每层 2 个组）：
```
layer_id | layer_name   | layer_default_tag | group_id      | group_name
---------|--------------|-------------------|---------------|-------------
L1       | 入口层       | L1.fallback       | G1            | 主问题       ← L1 是入口层（第 2 行首次出现）
L1       | 入口层       | L1.fallback       | G2            | 公共信息     ← 还在 L1
L2       | 程度与偏好   | L2.fallback       | G_heavy_pet   | 严重宠物     ← L2 是第 2 层（第 4 行首次出现）
L2       | 程度与偏好   | L2.fallback       | G_light_pet   | 轻度宠物
```

> **同层多个 group**：`layer_name` / `layer_default_tag` 必须每行重复填一遍。

### 5.2 Sheet: `Questions`（7 列）

| 列 | 字段名 | 必填 | 一句话作用 |
|---|---|---|---|
| A | `question_id` | ✅ | 题目唯一 ID |
| B | `group_id` | ✅ | 所属题组 |
| C | `sub_title` | ✅ | 题干文本（v1.2 起对齐现有 quiz） |
| D | `question_options` | ✅ | 选项 &split& 拼接（v1.2 起对齐现有 quiz） |
| E | `answer` | — | 题目解释文本（v1.2 新增，可选） |
| F | `correct_answer` | — | **正确答案索引（v1.3 新增，1-based）**。填 `1` = 第 1 个选项。动态 quiz 通常用于推荐，可留空 |
| G | `content` | — | **第 2 行 = article 介绍文本（v1.3 新增，对齐现有 quiz）**。题目行通常留空 |

> **重要：第 2 行是 article 介绍行**
>
> 第 2 行所有题目字段（A-F）**全部留空**，仅在 `content` 列填 article 介绍文本（如"花 1 分钟测出最适合你的方案"）。这与现有 quiz 模板第 2 行 = 文章介绍的约定一致。
>
> 第 3 行起才是真正的题目。

**v1.3 字段顺序变化**：
- `question_options` 从 F 列调到 **D 列**
- `answer` 从 D 列调到 **E 列**
- `correct_answer` 新增在 **F 列**
- `content` 新增在 **G 列**
- `img_path` **已移除**（动态 quiz 题图未启用）

**v1.2 新约定**：**公共题不再用列标记**，改为通过 OptionTags 表的存在性自动判定：

| 在 OptionTags 中的状态 | 题目性质 |
|---|---|
| 该题有至少 1 条 OptionTags 记录 | **评分题** |
| 该题在 OptionTags 表**无任何记录** | **公共题**（不参与评分） |

**填写示例**：
```
question_id | group_id     | sub_title                  | question_options                          | answer                    | correct_answer | content
------------|--------------|----------------------------|-------------------------------------------|---------------------------|----------------|-------
            |              |                            |                                           |                           |                | 宠物清洁问题的朋友，欢迎来到我们的方案推荐 quiz。
Q1          | G1           | 你家最主要的问题是？        | 宠物毛发&split&灰尘&split&顽固污渍&split&其他 |                           |                |
Q2          | G2           | 你的房屋面积是多少？        | 小于 50㎡&split&50-100㎡&split&大于 100㎡   | 房屋面积影响清洁频率。     |                |
Q3          | G_heavy_pet  | 严重程度如何？              | 非常严重&split&比较严重                    |                           |                |
```

> **第 2 行**（article 介绍行）：仅 `content` 列填介绍文本，其他列全部留空。
> **Q2 是公共题**（在 OptionTags 表中无 Q2 记录）。`answer` 字段填写了题干解释，会展示在题干下方。
> 如果 Q3 是考核型题目，`correct_answer` 可填 `1`（表示第一个选项"非常严重"）——注意 1-based。

### 5.3 Sheet: `OptionTags`（6 列）

| 列 | 字段名 | 必填 | 一句话作用 |
|---|---|---|---|
| A | `question_id` | ✅ | 引用 Questions 表的 `question_id` |
| B | `option_index` | ✅ | 选项索引（**0-based**，下拉 0-9） |
| C | `tag` | ✅ | 标签名 |
| D | `layer_id` | ✅ | 标签所属层 |
| E | `score` | ✅ | 加分数值（正整数，下拉 1-10） |
| F | `priority` | ✅ | 平局优先级（越小越优先，下拉 1-5） |

**v1.2 新约定**：**bucket 信息完全由 Routing 表维护**——OptionTags 表不再有 `bucket_min` / `bucket_max`。

**填写示例**：
```
question_id | option_index | tag       | layer_id | score | priority
------------|--------------|-----------|----------|-------|----------
Q1          | 0            | pet_hair  | L1       | 5     | 1
Q1          | 1            | dust      | L1       | 5     | 1
Q1          | 2            | grease    | L1       | 5     | 1
```

> **bucket 怎么用？** 在 Routing 表的 routing 行写 `(tag, bucket)` → `target_group_id` 的映射即可（见 §5.4）。
> **score 和 priority 下拉是建议值**——业务可自由填其他正整数，下拉仅作提示。

### 5.4 Sheet: `Routing`（4 列，v1.3 拆分自 Rules 表）

> **v1.3 变更**：原 11 列 Rules 表拆为 Routing + ResultPages 两个 sheet，本表专门管"层间跳转"。

| 列 | 字段名 | 必填 | 一句话作用 |
|---|---|---|---|
| A | `from_layer_id` | ✅ | 从哪一层出发 |
| B | `tag` | ✅ | 上一层胜出标签；(DEFAULT) 表示兜底 |
| C | `bucket` | ✅ | bucket 名（**下拉 (ANY)/heavy/light/medium**，业务可自由填其他值） |
| D | `target_group_id` | ✅ | 跳转到哪个组 |

**单层 quiz 的 Routing 表为空**——单层没有"层间跳转"的概念。

**多层的填写示例**：
```
from_layer_id | tag       | bucket | target_group_id
--------------|-----------|--------|---------------
L1            | pet_hair  | heavy  | G_heavy_pet        ← 具体规则
L1            | dust      | heavy  | G_light_pet        ← 具体规则
L1            | (DEFAULT) | (ANY)  | G_light_pet        ← 兜底：任意标签都跳这里
```

> **首条命中原则**：从第一行开始扫描，第一条匹配的规则生效。具体规则放前面，兜底放最后。
> **(DEFAULT) + (ANY)** 表示"任意标签 + 任意 bucket"，是兜底路由的标准写法。

### 5.5 Sheet: `ResultPages`（6 列，v1.3 拆分自 Rules 表）

> **v1.3 变更**：原 Rules 表的 `result` + `result_page` 合并到一张表——一行 = 一个完整的结果页（含判定条件 + 渲染内容）。

| 列 | 字段名 | 必填 | 一句话作用 |
|---|---|---|---|
| A | `result_page_id` | ✅ | 结果页唯一 ID（如 `RP_pro_pet`） |
| B | `condition_expr` | ✅ | 跨层判定 JSON |
| C | `title` | ✅ | 结果页标题 |
| D | `content` | ✅ | 结果页正文（富文本） |
| E | `img_path` | — | 结果页图片 |
| F | `is_default` | ✅ | 是否兜底结果页（**下拉 true/false**，全文恰好 1 行 true） |

**condition_expr 格式**：
```json
{"L1": {"tag": "pet_hair", "bucket": "heavy"}}   ← L1 必须是宠物毛发严重
{"L1": {"any": true}}                            ← L1 任意结果（通常用作兜底）
{"L1": {"tag": "pet_hair"}}                      ← L1 是宠物毛发（不限制 bucket）
```

**填写示例**：
```
result_page_id | condition_expr                                       | title       | content                | img_path   | is_default
---------------|------------------------------------------------------|-------------|------------------------|------------|------------
RP_pro_pet     | {"L1":{"tag":"pet_hair","bucket":"heavy"}}            | 专业宠物清洁 | 推荐专业清洁服务...     | rp1.jpg    | false
RP_default     | {"L1":{"any":true}}                                   | 推荐通用方案 | 通用清洁方案介绍...     | rp3.jpg    | true
```

> **`is_default` 全文恰好 1 行 `true`**——是兜底结果页，业务规则都没命中时渲染这张。
> **`is_default=true` 的行仍然要填 `condition_expr`**——通常是 `{"L1":{"any":true}}`（任意 L1 结果都匹配）。

---
## 6. 典型场景配置示例

### 场景 1：单层 2 选题（最简配置）

> 问 1 道题，根据答案直接出结果。

#### Structure（5 列）
| layer_id | layer_name | layer_default_tag | group_id | group_name |
|---|---|---|---|---|
| L1 | 入口层 | fallback_tag | G1 | 主问题 |

#### Questions（7 列）
| question_id | group_id | sub_title | question_options | answer | correct_answer | content |
|---|---|---|---|---|---|---|
| | | | | | | 5 分钟测出你最适合的方案！花 1 分钟答完 1 道题。 |
| Q1 | G1 | 你喜欢什么颜色？ | 红色&split&蓝色 | | | |

#### OptionTags（6 列）
| question_id | option_index | tag | layer_id | score | priority |
|---|---|---|---|---|---|
| Q1 | 0 | red | L1 | 5 | 1 |
| Q1 | 1 | blue | L1 | 5 | 1 |

#### Routing（4 列）
（空——单层无层间路由）

#### ResultPages（6 列）
| result_page_id | condition_expr | title | content | img_path | is_default |
|---|---|---|---|---|---|
| RP_red | {"L1":{"tag":"red"}} | 红色推荐 | 推荐红色的产品 | rp_red.jpg | false |
| RP_default | {"L1":{"any":true}} | 默认推荐 | 推荐通用产品 | rp_default.jpg | true |

### 场景 2：2 层漏斗（按问题严重程度分流）

> 入口层问问题类型，根据标签分流到不同的严重程度层。

#### Structure（5 列）
| layer_id | layer_name | layer_default_tag | group_id | group_name |
|---|---|---|---|---|
| L1 | 入口层 | L1.fallback | G1 | 主问题 |
| L2 | 严重程度 | L2.fallback | G_heavy_pet | 严重宠物 |
| L2 | 严重程度 | L2.fallback | G_light_pet | 轻度宠物 |

#### Questions（7 列）
| question_id | group_id | sub_title | question_options | answer | correct_answer | content |
|---|---|---|---|---|---|---|
| | | | | | | 宠物清洁方案推荐 quiz。花 1 分钟回答几道题，我们会根据你的具体情况推荐最合适的清洁方案。 |
| Q1 | G1 | 你家最主要的问题是？ | 宠物毛发&split&灰尘&split&其他 | | | |
| Q2 | G_heavy_pet | 严重程度如何？ | 非常严重&split&比较严重 | | | |
| Q3 | G_light_pet | 严重程度如何？ | 轻微&split&一般 | | | |

#### OptionTags（6 列）
| question_id | option_index | tag | layer_id | score | priority |
|---|---|---|---|---|---|
| Q1 | 0 | pet_hair | L1 | 5 | 1 |
| Q1 | 1 | dust | L1 | 5 | 1 |
| Q1 | 2 | other | L1 | 1 | 3 |
| Q2 | 0 | wants_pro | L2 | 3 | 1 |
| Q2 | 1 | wants_diy | L2 | 2 | 2 |

#### Routing（4 列）
| from_layer_id | tag | bucket | target_group_id |
|---|---|---|---|
| L1 | pet_hair | heavy | G_heavy_pet |
| L1 | dust | heavy | G_light_pet |
| L1 | (DEFAULT) | (ANY) | G_light_pet |

#### ResultPages（6 列）
| result_page_id | condition_expr | title | content | img_path | is_default |
|---|---|---|---|---|---|
| RP_pro_pet | {"L1":{"tag":"pet_hair","bucket":"heavy"}} | 专业宠物清洁 | 推荐专业清洁服务 | rp1.jpg | false |
| RP_default | {"L1":{"any":true}} | 推荐通用方案 | 通用清洁方案介绍 | rp3.jpg | true |

---

## 7. 字段速查表（cheat sheet）

| Sheet | 列 | 字段名 | 必填 | 一句话作用 |
|---|---|---|---|---|
| Structure | A | layer_id | ✅ | 层唯一 ID |
| Structure | B | layer_name | — | 层展示名 |
| Structure | C | layer_default_tag | — | 层无胜出时的兜底标签 |
| Structure | D | group_id | ✅ | 题组唯一 ID |
| Structure | E | group_name | — | 组展示名 |
| Questions | A | question_id | ✅ | 题目唯一 ID |
| Questions | B | group_id | ✅ | 所属题组 |
| Questions | C | sub_title | ✅ | 题干文本（v1.2 起对齐现有 quiz） |
| Questions | D | question_options | ✅ | 选项 &split& 拼接（v1.2 起对齐现有 quiz） |
| Questions | E | answer | — | 题目解释文本（v1.2 新增，可选） |
| Questions | F | correct_answer | — | **正确答案 1-based 索引（v1.3 新增）** |
| Questions | G | content | — | **第 2 行 = article 介绍（v1.3 新增）** |
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

> v1.3 移除字段：
> - `Questions.img_path`（题图未启用，按需再加）
> - 旧 Rules 表的 11 列（rule_type / from_layer_id / tag / bucket / target_group_id / condition_expr / result_page_id / is_default / title / content / img_path）已拆分到 Routing（4 列）+ ResultPages（6 列）
>
> v1.2 移除字段：
> - `Structure.is_entry`（入口层由约定决定）
> - `Questions.is_public`（公共题由 OptionTags 存在性推断）
> - `OptionTags.bucket_min` / `bucket_max`（路由只看 Routing.bucket）

---

## 8. 常见问题 FAQ

### Q1：业务填错 ID 怎么办？

上传后系统会报错，例如：
```
[Structure] 第 3 行：D 列 group_id="G_typo" 在 Structure 表中不存在
```
按提示去对应 sheet 对应行修正即可。

### Q2：文章标题在哪里改？

**两种方式**：
1. 改文件名：把 `quiz_pet.xlsx` 改成 `quiz_pet_cleaning.xlsx`（**注意 ID 也变了**）
2. 在 CMS 后台导入后改名（推荐，保持文件 ID 不变）

### Q3：状态（published / draft）在哪里控制？

**Excel 不维护 status**，完全由 CMS 控制。导入后默认 draft，CMS 后台手动发布。

### Q4：怎么改默认结果页？

在 ResultPages 表里找一行，把 `is_default` 改成 `true`，其他改成 `false` 即可。**全文必须有且仅有 1 行 `is_default=true`**，否则上传报错。

### Q5：一道题能不能既评分又是公共题？

不能。`OptionTags` 中**有记录** = 评分题；**无记录** = 公共题。如果想"既收集信息又参与评分"，拆成两道题。

### Q6：同选项能绑多个标签吗？

可以。一行一个 (question, option, tag) 组合，例如选项 0 同时绑 `pet_hair` 和 `dust`：

| question_id | option_index | tag | layer_id | score | priority |
|---|---|---|---|---|---|
| Q1 | 0 | pet_hair | L1 | 5 | 1 |
| Q1 | 0 | dust | L1 | 1 | 2 |

### Q7：怎么调换层/组/题的顺序？

直接调整行的上下位置即可，**不需要改任何字段**。

### Q8：分数可以负数吗？

可以。负分表示"扣分"，例如"其他"选项扣 1 分，让它更难胜出。

### Q9：怎么定义 bucket（分桶）？

**v1.2 起 bucket 完全由 Routing 表维护**。在 Routing 表写 routing 时，`bucket` 字段填业务自由命名的字符串（如 `heavy` / `light` / `medium` / `urgent`），OptionTags 表不再维护 bucket 阈值。

例如想让 `pet_hair` 分数 ≥ 4 算 heavy、< 4 算 light：
```
Routing 表 routing 行：
  L1, pet_hair, heavy, → G_heavy_pet
  L1, pet_hair, light, → G_light_pet
  L1, (DEFAULT), (ANY), → G_default
```

### Q10：业务想新增一个分桶怎么办？

直接加一条 routing 行即可：
```
Routing 行：L1, pet_hair, urgent, G_xxx
```
不需要改 OptionTags。

### Q11：能不能配置多层复合判定（跨层 AND/OR）？

可以。`condition_expr` 支持任意层组合，例如：
```json
{"L1": {"tag": "pet_hair", "bucket": "heavy"}, "L2": {"tag": "wants_pro"}}
```
表示"L1 是宠物毛发严重 AND L2 想找专业服务"。

### Q12：上传后多久生效？

通常 < 5 秒。系统校验通过后，CMS 后台手动发布（或保持 draft）。

### Q13：配置错了影响线上用户吗？

- `draft` 状态：完全不影响
- `published` 状态：覆盖语义是先清后写，会有**短暂的 1-2 秒数据空窗**（业务尽量在低峰期修改已发布的 quiz）

### Q14：怎么标记入口层？

**v1.2 起不需要标记**——Structure 表中第一个出现的 `layer_id` 就是入口层，且入口层恰好 1 个 group。

例如：
```
Structure 第 2 行：L1, ..., G1, ...   ← L1 是入口层（第 2 行首次出现）
Structure 第 3 行：L1, ..., G2, ...
Structure 第 4 行：L2, ..., G_xxx, ...   ← L2 是第 2 层
```

只要 L1 是入口层，L1 行下只有 G1 是"主问题"，其他组（如 G2 公共信息）虽然属于 L1 层但**不是入口组**——用户实际进入的是 G1。

### Q15：`correct_answer` 字段什么时候需要填？（v1.3 新增）

**通常留空**——动态 quiz 主要用于"推荐"，不是"考核"，对错无关紧要。

**需要填的场景**：
- 该题作为"考核型"题目（前端展示对错反馈）
- 数据埋点需要追踪"用户答对了多少题"

**填法**：填 `1` 表示第一个选项，`2` 表示第二个，**依此类推**（**1-based**，与现有 quiz 模板对齐）。

---

## 9. 校验规则速查

### 上传前自查清单（业务侧）

- [ ] 文件名以 `quiz_` 开头（不带路径、不带空格），后缀是 `.xlsx`
- [ ] Structure 表第 1 个 `layer_id`（入口层）恰好 1 个 group
- [ ] 每个非最后一层都有 1 条 `(DEFAULT) + (ANY)` 兜底 routing
- [ ] ResultPages 表至少有 1 行，其中**恰好 1 行** `is_default=true`
- [ ] 所有跨 sheet 引用 ID 都存在（建议上传后看系统校验结果）
- [ ] 评分题（OptionTags 中有记录）**不应**与公共题混淆
- [ ] 公共题（OptionTags 中无记录）不应在 OptionTags 里出现对应记录
- [ ] Questions 第 2 行的 `content` 列填了 article 介绍（其他列留空）

### 系统自动校验的错误格式

```
✗ 导入失败，共 4 处错误：

[Structure] 第 3 行：A 列 layer_id="L3" 但同层其他行的 layer_id="L1"
[Questions] 第 5 行：B 列 group_id="G_typo" 在 Structure 表中不存在
[OptionTags] 第 8 行：A 列 question_id="Q99" 在 Questions 表中不存在
[ResultPages] 第 12 行：B 列 condition_expr 不是合法 JSON
[ResultPages] is_default=true 的数量 = 0（必须恰好 1 行）
[Logic] 第 1 层 L1 有 2 个 group（入口层必须恰好 1 个 group）
```

格式：`[<Sheet名>] 第 <行号> 行：<列名> <错误描述>` 或 `[Logic] <业务规则描述>`

---

## 10. 版本日志

- v1.0（2026-09-15）：初版
  - 与 Schema v1.1 对齐（无 `order` 列，行序决定顺序）
  - 5 分钟上手、完整使用流程、字段详解、典型场景、FAQ
- v1.1（2026-09-15）：
  - **移除整个 Quiz sheet**（5 → 4 sheet），与 Schema v1.2 对齐
  - **新增 §2 文件名约定**：文章 ID、标题从 Excel 文件名自动获取
  - **新增 §5.4 `is_default` 列说明**：兜底结果页改在 Rules 表用 `is_default=true` 标识
  - **新增 FAQ Q2/Q3/Q4**：标题改名、status 控制、默认结果页修改
  - **删除原 §4.1 Quiz 字段详解整节**
- v1.2（2026-09-15）：
  - **题目字段对齐现有 quiz**：`Questions.text` → `sub_title`，`Questions.options` → `question_options`
  - **新增 `Questions.answer`**：题干解释文本（可选），前端展示在题干下方
  - **移除 `Structure.is_entry`**：约定首个 `layer_id` = 入口层（且入口层恰好 1 个 group），少一列少一个下拉
  - **移除 `OptionTags.bucket_min` / `bucket_max`**：分桶完全由 Rules 表的 `bucket` 字段表达，单一事实源
  - **移除 `Questions.is_public`**：公共题改为"OptionTags 中无记录即公共题"自动判定
  - 新增 §5.1 入口层约定、§5.2 公共题重定义、§5.3 bucket 简化说明
  - **新增 FAQ Q14**：怎么标记入口层（答：无需标记，按约定）
  - 更新字段速查表、版本号引用（v4 模板、Schema v1.3）
- v1.3（2026-09-15）：
  - **Rules 拆为 Routing + ResultPages 两个 sheet**（4 → 5 sheet）：
    - Routing 只管层间路由（4 列）：`from_layer_id` / `tag` / `bucket` / `target_group_id`
    - ResultPages 把"结果判定 + 结果页内容"合并为一行（6 列）：`result_page_id` / `condition_expr` / `title` / `content` / `img_path` / `is_default`
    - 业务不用再在 11 列 3-in-1 的矩阵里反复确认"这个字段必填还是可选还是留空"
  - **移除 `Questions.img_path`**：动态 quiz 主要靠文字和选项互动，题图暂未启用
  - **新增 `Questions.correct_answer`**：**1-based 索引**，对齐现有 quiz 模板（`1` = 第一个选项）。动态 quiz 通常用于推荐，可留空
  - **新增 `Questions.content`**：第 2 行（article 介绍行）的 `content` 填 article 介绍文本，对齐现有 quiz 模板"第 2 行 = 文章介绍"约定
  - **Questions 字段重排**：`question_options` 调到 D 列，`answer` 调到 E 列，`correct_answer` 在 F 列，`content` 在 G 列
  - **新增 OptionTags.score / priority 下拉**（1-10 / 1-5），业务可自由填其他值
  - 新增 §3.4 第 2 行 = article 介绍行的说明、§5.2 `correct_answer` 字段说明、§5.5 ResultPages 字段说明
  - **新增 FAQ Q15**：`correct_answer` 什么时候需要填
  - 更新 §3 最小配置示例（5 sheet + 第 2 行介绍）、§6 典型场景（5 sheet 示例）、§7 字段速查表、§9 校验清单