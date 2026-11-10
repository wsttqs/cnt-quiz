# 动态 Quiz 文章配置指南（业务侧）

> 版本：v1.2
> 编写日期：2026-09-15
> 配套文档：
> - [Schema 参考（技术字段定义）](./quiz-dynamic-excel-schema.md) v1.3
> - [需求规格](./quiz-dynamic-requirements.md) v1.2
> - [Excel 模板](./quiz-dynamic-template-v4.xlsx)

> **v1.2 变更**：题目字段对齐现有 quiz（`text` → `sub_title`、`options` → `question_options`、新增 `answer`）；移除 `is_entry`（约定首个 layer_id = 入口层）；移除 `bucket_min` / `bucket_max`（路由只看 Rules.bucket）；移除 `is_public`（OptionTags 中无记录 = 公共题）。少填 4 列，配置更快。
> **v1.1 变更**：移除整个 Quiz sheet（5 → 4 sheet）。文章 ID、标题改为从 Excel 文件名自动获取；status 由 CMS 控制；兜底结果页改在 Rules 表用 `is_default=true` 标识。

本文档面向**业务运营 / 内容编辑**，讲解如何用 Excel 配置一篇动态 Quiz 文章。不涉及技术实现细节。

---

## 1. 这是什么？

动态 Quiz 是一种**根据用户答题路径，动态展示不同题目、最终推荐不同结果**的文章。
相比传统固定顺序的 Quiz，它能：

- **识别用户特征**（如「宠物毛发严重」vs「轻微灰尘」）
- **针对特征推送差异化题目**（严重场景追加问严重程度，轻微场景直接给方案）
- **匹配最合适的最终结果**（专业清洁 / DIY 方案 / 通用方案）

所有这些"动态判断"都通过 4 个 Excel sheet 配置，**不需要写代码、不需要前端配合**。

---

## 2. 文件命名约定（v1.2 新增）

**重要**：从 v1.2 起，Excel 文件名本身就是文章元数据。

把模板保存为：`quiz_<id>.xlsx`（例如 `quiz_pet.xlsx`）

系统会自动从文件名提取：

| 字段 | 来源 | 说明 |
|---|---|---|
| `quiz_id` | `quiz_<id>.xlsx` | 去掉 `.xlsx` 后缀，全局唯一 |
| `title` | 默认同 `quiz_id` | 导入后可在 CMS 后台改名 |
| `status` | CMS 控制 | Excel 不需要填，系统默认为 draft，CMS 发布后变 published |

> **举例**：`quiz_pet.xlsx` → `quiz_id=quiz_pet`，`title=quiz_pet`

> **常见错误**：
> - ❌ 把文件命名为 `宠物清洁指南.xlsx` → 系统期望 `quiz_xxx.xlsx` 格式，请改成 `quiz_pet_cleaning.xlsx` 之类
> - ❌ 不同文章使用同名 → `quiz_id` 会冲突，请保证全局唯一

---

## 3. 5 分钟上手（最小配置）

### 3.1 业务场景

> 一个最简单的 1 层 quiz，问 1 道题，根据答案直接出结果。

### 3.2 4 个 sheet 各填什么

| Sheet | 行数 | 关键内容 |
|---|---|---|
| **Structure** | 1 行 | 1 个层 L1 + 1 个入口组 G1 |
| **Questions** | 1 行 | 1 道题，2 个选项 |
| **OptionTags** | 2 行 | 每个选项绑定一个标签 + 加分 |
| **Rules** | 4 行 | 2 张结果页（含 1 张兜底）+ 2 条 result 判定 |

### 3.3 最小配置示例

假设文件命名为 `quiz_simple.xlsx`（→ `quiz_id=quiz_simple`，`title=quiz_simple`）。

#### Structure（5 列）
| layer_id | layer_name | layer_default_tag | group_id | group_name |
|---|---|---|---|---|
| L1 | 入口层 | fallback_tag | G1 | 主问题 |

> L1 是入口层（Structure 表中第一个出现的 layer_id），且入口层恰好 1 个 group G1。

#### Questions（6 列）
| question_id | group_id | sub_title | answer | img_path | question_options |
|---|---|---|---|---|---|
| Q1 | G1 | 你喜欢什么颜色？ | | q1.jpg | 红色&split&蓝色 |

#### OptionTags（6 列）
| question_id | option_index | tag | layer_id | score | priority |
|---|---|---|---|---|---|
| Q1 | 0 | red | L1 | 5 | 1 |
| Q1 | 1 | blue | L1 | 5 | 1 |

#### Rules（11 列）
| rule_type | from_layer_id | tag | bucket | target_group_id | condition_expr | result_page_id | is_default | title | content | img_path |
|---|---|---|---|---|---|---|---|---|---|---|
| result | | | | | {"L1":{"tag":"red"}} | RP_red | | | | |
| result | | | | | {"L1":{"any":true}} | RP_default | | | | |
| result_page | | | | | | RP_red | false | 红色推荐 | 推荐红色的产品 | rp_red.jpg |
| result_page | | | | | | RP_default | **true** | 默认推荐 | 推荐通用产品 | rp_default.jpg |

**效果**：用户选「红色」→ RP_red；用户选「蓝色」→ 兜底 RP_default（也是 `is_default=true` 的那张）。

### 3.4 关键观察

- 没有 Quiz sheet：所有元数据都在文件名和 CMS 里
- 没有 `is_entry` / `is_public` 列：入口层由约定决定；公共题由 OptionTags 推断
- Rules 表有 4 行，混合了 `result`（判定）和 `result_page`（页面）两种类型
- `result_page` 行中**恰好 1 行**的 `is_default=true`（这里 RP_default 是兜底页）

---
## 4. 完整使用流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 1. 下载模板 │ ──> │ 2. 填充配置 │ ──> │ 3. 上传系统 │ ──> │ 4. 验证上线 │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 步骤 1：下载模板

从内部系统下载 `quiz-dynamic-template-v4.xlsx`（**注意是 v4 这个最新版**）。

### 步骤 2：填充配置

按照下面 §5「字段详解」的说明填 4 个 sheet：

1. **Structure 表**：从入口层开始填，把同一层的所有 group 紧挨着填在一起
2. **Questions 表**：每个 group 下依次填题目
3. **OptionTags 表**：每个评分选项绑定标签和分数
4. **Rules 表**：配置路由规则（routing）、结果判定（result）、结果页（result_page）

### 步骤 3：上传系统

把填好的 Excel 文件重命名为 `quiz_<id>.xlsx`，上传到内容系统后台。

系统会自动：
1. 解析文件名 → 提取 `quiz_id` 和默认 `title`
2. 校验 4 个 sheet 的数据合法性
3. 写入数据库（先清后写）

### 步骤 4：验证上线

- **校验通过**：在 CMS 后台查看文章是否已生成（默认 `status=draft`）
- **校验失败**：按错误提示修正 Excel，重新上传
- **预览**：CMS 后台有"预览"按钮，可以模拟用户答题路径
- **发布**：CMS 后台点击"发布"，`status` 变为 `published`

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

### 5.2 Sheet: `Questions`（6 列）

| 列 | 字段名 | 必填 | 一句话作用 |
|---|---|---|---|
| A | `question_id` | ✅ | 题目唯一 ID |
| B | `group_id` | ✅ | 所属题组 |
| C | `sub_title` | ✅ | 题干文本（v1.2 起对齐现有 quiz） |
| D | `answer` | — | 题目解释文本（v1.2 新增，可选） |
| E | `img_path` | — | 题图路径 |
| F | `question_options` | ✅ | 选项 &split& 拼接 |

**v1.2 新约定**：**公共题不再用列标记**，改为通过 OptionTags 表的存在性自动判定：

| 在 OptionTags 中的状态 | 题目性质 |
|---|---|
| 该题有至少 1 条 OptionTags 记录 | **评分题** |
| 该题在 OptionTags 表**无任何记录** | **公共题**（不参与评分） |

**填写示例**：
```
question_id | group_id     | sub_title                  | answer                    | img_path | question_options
------------|--------------|----------------------------|---------------------------|----------|----------------------------------
Q1          | G1           | 你家最主要的问题是？        |                           | q1.jpg   | 宠物毛发&split&灰尘&split&顽固污渍&split&其他
Q2          | G2           | 你的房屋面积是多少？        | 房屋面积影响清洁频率。     | q2.jpg   | 小于 50㎡&split&50-100㎡&split&大于 100㎡
Q3          | G_heavy_pet  | 严重程度如何？              |                           | q3.jpg   | 非常严重&split&比较严重
```

> **Q2 是公共题**（在 OptionTags 表中无 Q2 记录）。`answer` 字段填写了题干解释，会展示在题干下方。

### 5.3 Sheet: `OptionTags`（6 列）

| 列 | 字段名 | 必填 | 一句话作用 |
|---|---|---|---|
| A | `question_id` | ✅ | 引用 Questions 表的 `question_id` |
| B | `option_index` | ✅ | 选项索引（0-based），下拉 0-9 |
| C | `tag` | ✅ | 标签名 |
| D | `layer_id` | ✅ | 标签所属层 |
| E | `score` | ✅ | 加分数值 |
| F | `priority` | ✅ | 平局优先级（越小越优先） |

**v1.2 新约定**：**bucket 信息完全由 Rules 表维护**——OptionTags 表不再有 `bucket_min` / `bucket_max`。

**填写示例**：
```
question_id | option_index | tag       | layer_id | score | priority
------------|--------------|-----------|----------|-------|----------
Q1          | 0            | pet_hair  | L1       | 5     | 1
Q1          | 1            | dust      | L1       | 5     | 1
Q1          | 2            | grease    | L1       | 5     | 1
```

> **bucket 怎么用？** 在 Rules 表的 routing 行写 `(tag, bucket)` → `target_group_id` 的映射即可（见 §5.4）。

### 5.4 Sheet: `Rules`（11 列）

| 列 | 字段名 | 必填 | 一句话作用 |
|---|---|---|---|
| A | `rule_type` | ✅ | routing / result / result_page |
| B | `from_layer_id` | * | routing：从哪一层出发 |
| C | `tag` | * | routing：上一层胜出标签；(DEFAULT) 表示兜底 |
| D | `bucket` | * | routing：bucket 名；(ANY) 表示不区分 |
| E | `target_group_id` | * | routing：跳转到哪个组 |
| F | `condition_expr` | * | result：跨层判定 JSON |
| G | `result_page_id` | * | result / result_page：结果页 ID |
| H | `is_default` | * | **result_page**：是否兜底结果页（v1.1 新增） |
| I | `title` | * | result_page：结果页标题 |
| J | `content` | * | result_page：结果页正文（富文本）|
| K | `img_path` | * | result_page：结果页图片 |

**三种 rule_type 的字段启用矩阵**：

| rule_type | 必填字段 | 可选字段 | 必须留空 |
|---|---|---|---|
| **routing** | `from_layer_id`, `target_group_id` | `tag`（默认 `(DEFAULT)`）, `bucket`（默认 `(ANY)`） | `condition_expr`, `result_page_id`, `is_default`, `title`, `content`, `img_path` |
| **result** | `condition_expr`, `result_page_id` | — | 其余字段 |
| **result_page** | `result_page_id`, `title`, `content`, `is_default` | `img_path` | `from_layer_id`, `tag`, `bucket`, `target_group_id`, `condition_expr` |

---
## 6. 典型场景配置示例

### 场景 1：单层 2 选题（最简配置）

> 问 1 道题，根据答案直接出结果。

#### Structure
| layer_id | layer_name | layer_default_tag | group_id | group_name |
|---|---|---|---|---|
| L1 | 入口层 | fallback_tag | G1 | 主问题 |

#### Questions
| question_id | group_id | sub_title | answer | img_path | question_options |
|---|---|---|---|---|---|
| Q1 | G1 | 你喜欢什么颜色？ | | q1.jpg | 红色&split&蓝色 |

#### OptionTags
| question_id | option_index | tag | layer_id | score | priority |
|---|---|---|---|---|---|
| Q1 | 0 | red | L1 | 5 | 1 |
| Q1 | 1 | blue | L1 | 5 | 1 |

#### Rules
| rule_type | from_layer_id | tag | bucket | target_group_id | condition_expr | result_page_id | is_default | title | content | img_path |
|---|---|---|---|---|---|---|---|---|---|---|
| result | | | | | {"L1":{"tag":"red"}} | RP_red | | | | |
| result | | | | | {"L1":{"any":true}} | RP_default | | | | |
| result_page | | | | | | RP_red | false | 红色推荐 | 推荐红色的产品 | rp_red.jpg |
| result_page | | | | | | RP_default | true | 默认推荐 | 推荐通用产品 | rp_default.jpg |

### 场景 2：2 层漏斗（按问题严重程度分流）

> 入口层问问题类型，根据标签分流到不同的严重程度层。

#### Structure
| layer_id | layer_name | layer_default_tag | group_id | group_name |
|---|---|---|---|---|
| L1 | 入口层 | L1.fallback | G1 | 主问题 |
| L2 | 严重程度 | L2.fallback | G_heavy_pet | 严重宠物 |
| L2 | 严重程度 | L2.fallback | G_light_pet | 轻度宠物 |

#### Questions
| question_id | group_id | sub_title | answer | img_path | question_options |
|---|---|---|---|---|---|
| Q1 | G1 | 你家最主要的问题是？ | | q1.jpg | 宠物毛发&split&灰尘&split&其他 |
| Q2 | G_heavy_pet | 严重程度如何？ | | q2.jpg | 非常严重&split&比较严重 |
| Q3 | G_light_pet | 严重程度如何？ | | q3.jpg | 轻微&split&一般 |

#### OptionTags
| question_id | option_index | tag | layer_id | score | priority |
|---|---|---|---|---|---|
| Q1 | 0 | pet_hair | L1 | 5 | 1 |
| Q1 | 1 | dust | L1 | 5 | 1 |
| Q1 | 2 | other | L1 | 1 | 3 |
| Q2 | 0 | wants_pro | L2 | 3 | 1 |
| Q2 | 1 | wants_diy | L2 | 2 | 2 |

#### Rules
| rule_type | from_layer_id | tag | bucket | target_group_id | condition_expr | result_page_id | is_default | title | content | img_path |
|---|---|---|---|---|---|---|---|---|---|---|
| routing | L1 | pet_hair | heavy | G_heavy_pet | | | | | | |
| routing | L1 | dust | heavy | G_light_pet | | | | | | |
| routing | L1 | (DEFAULT) | (ANY) | G_light_pet | | | | | | |
| result | | | | | {"L1":{"tag":"pet_hair","bucket":"heavy"}} | RP_pro_pet | | | | |
| result | | | | | {"L1":{"any":true}} | RP_default | | | | |
| result_page | | | | | | RP_pro_pet | true | 专业宠物清洁 | 推荐专业清洁服务 | rp1.jpg |
| result_page | | | | | | RP_default | false | 推荐通用方案 | 通用清洁方案介绍 | rp3.jpg |

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
| Questions | D | answer | — | 题目解释文本（v1.2 新增，可选） |
| Questions | E | img_path | — | 题图路径 |
| Questions | F | question_options | ✅ | 选项 &split& 拼接 |
| OptionTags | A | question_id | ✅ | 引用题目 |
| OptionTags | B | option_index | ✅ | 选项索引（0-based） |
| OptionTags | C | tag | ✅ | 标签名 |
| OptionTags | D | layer_id | ✅ | 标签所属层 |
| OptionTags | E | score | ✅ | 加分数值 |
| OptionTags | F | priority | ✅ | 平局优先级（越小越优先） |
| Rules | A | rule_type | ✅ | routing / result / result_page |
| Rules | B | from_layer_id | * | routing：从哪一层出发 |
| Rules | C | tag | * | routing：上一层胜出标签 |
| Rules | D | bucket | * | routing：bucket 名 |
| Rules | E | target_group_id | * | routing：跳转到哪个组 |
| Rules | F | condition_expr | * | result：跨层判定 JSON |
| Rules | G | result_page_id | * | result / result_page：结果页 ID |
| Rules | H | is_default | * | **result_page**：是否兜底结果页 |
| Rules | I | title | * | result_page：结果页标题 |
| Rules | J | content | * | result_page：结果页正文（富文本）|
| Rules | K | img_path | * | result_page：结果页图片 |

> v1.2 移除字段（共 4 列）：
> - `Structure.is_entry`（入口层由约定决定）
> - `Questions.is_public`（公共题由 OptionTags 存在性推断）
> - `OptionTags.bucket_min` / `bucket_max`（路由只看 Rules.bucket）

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

在 Rules 表里找 `rule_type=result_page` 的行，把其中 1 行的 `is_default` 改成 `true`，其他改成 `false` 即可。**全文必须有且仅有 1 行 `is_default=true`**，否则上传报错。

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

**v1.2 起 bucket 完全由 Rules 表维护**。在 Rules 表写 routing 时，`bucket` 字段填业务自由命名的字符串（如 `heavy` / `light` / `medium` / `urgent`），OptionTags 表不再维护 bucket 阈值。

例如想让 `pet_hair` 分数 ≥ 4 算 heavy、< 4 算 light：
```
Rules routing 行：
  tag=pet_hair, bucket=heavy → G_heavy_pet
  tag=pet_hair, bucket=light → G_light_pet
  tag=(DEFAULT), bucket=(ANY) → G_default
```

### Q10：业务想新增一个分桶怎么办？

直接加一条 routing 行即可：
```
routing | L1 | pet_hair | urgent | G_xxx
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

---
## 9. 校验规则速查

### 上传前自查清单（业务侧）

- [ ] 文件名以 `quiz_` 开头（不带路径、不带空格），后缀是 `.xlsx`
- [ ] Structure 表第 1 个 `layer_id`（入口层）恰好 1 个 group
- [ ] 每个非最后一层都有 1 条 `(DEFAULT) + (ANY)` 兜底 routing
- [ ] 至少有 1 条 `any:true` 兜底 result
- [ ] 至少 1 张 result_page，其中**恰好 1 行** `is_default=true`
- [ ] 所有跨 sheet 引用 ID 都存在（建议上传后看系统校验结果）
- [ ] 评分题（OptionTags 中有记录）**不应**与公共题混淆
- [ ] 公共题（OptionTags 中无记录）不应在 OptionTags 里出现对应记录

### 系统自动校验的错误格式

```
✗ 导入失败，共 4 处错误：

[Structure] 第 3 行：A 列 layer_id="L3" 但同层其他行的 layer_id="L1"
[Questions] 第 5 行：B 列 group_id="G_typo" 在 Structure 表中不存在
[OptionTags] 第 8 行：A 列 question_id="Q99" 在 Questions 表中不存在
[Rules] 第 12 行：F 列 condition_expr 不是合法 JSON
[Rules] result_page 行中 is_default=true 的数量 = 0（必须恰好 1 行）
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