# 动态 Quiz 文章配置指南（业务侧）

> 版本：v1.1
> 编写日期：2026-09-15
> 配套文档：
> - [Schema 参考（技术字段定义）](./quiz-dynamic-excel-schema.md) v1.2
> - [需求规格](./quiz-dynamic-requirements.md) v1.2
> - [Excel 模板](./quiz-dynamic-template-v3.xlsx)

> **v1.1 变更**：移除整个 Quiz sheet（5 → 4 sheet）。文章 ID、标题改为从 Excel 文件名自动获取；status 由 CMS 控制；兜底结果页改在 Rules 表用 `is_default=true` 标识。少填一张表，配置更快。

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

#### Structure
| layer_id | layer_name | layer_default_tag | group_id | group_name | is_entry |
|---|---|---|---|---|---|
| L1 | 入口层 | fallback_tag | G1 | 主问题 | true |

#### Questions
| question_id | group_id | text | is_public | img_path | options |
|---|---|---|---|---|---|
| Q1 | G1 | 你喜欢什么颜色？ | false | q1.jpg | 红色&split&蓝色 |

#### OptionTags
| question_id | option_index | tag | layer_id | score | priority | bucket_min | bucket_max |
|---|---|---|---|---|---|---|---|
| Q1 | 0 | red | L1 | 5 | 1 | 0 | 10 |
| Q1 | 1 | blue | L1 | 5 | 1 | 0 | 10 |

#### Rules
| rule_type | from_layer_id | tag | bucket | target_group_id | condition_expr | result_page_id | is_default | title | content | img_path |
|---|---|---|---|---|---|---|---|---|---|---|
| result | | | | | {"L1":{"tag":"red"}} | RP_red | | | | |
| result | | | | | {"L1":{"any":true}} | RP_default | | | | |
| result_page | | | | | | RP_red | false | 红色推荐 | 推荐红色的产品 | rp_red.jpg |
| result_page | | | | | | RP_default | **true** | 默认推荐 | 推荐通用产品 | rp_default.jpg |

**效果**：用户选「红色」→ RP_red；用户选「蓝色」→ 兜底 RP_default（也是 `is_default=true` 的那张）。

### 3.4 关键观察

- 没有 Quiz sheet：所有元数据都在文件名和 CMS 里
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

从内部系统下载 `quiz-dynamic-template-v3.xlsx`（**注意是 v3 这个最新版本**）。模板里已经预填了一份宠物清洁的**示例数据**，可以直接修改使用，也可以清空全部数据后从零开始。

### 步骤 2：保存为正确文件名

从模板另存为 `quiz_<你的id>.xlsx`（参考 §2「文件命名约定」）。

### 步骤 3：填充配置

按下面的顺序填表，**强烈建议一边填一边参考模板示例**：

1. **先填 Structure**：把"有几层、每层有几组"规划好
2. **填 Questions**：按每个组依次填题目
3. **填 OptionTags**：每填完一道题，立刻配它的选项标签（避免遗忘）
4. **填 Rules（最后填）**：所有题目和标签都确定后，再配置路由和结果
5. **记得填兜底**：`result_page` 行中**恰好 1 行** `is_default=true`

### 步骤 4：上传系统

在 CMS 后台找到「动态 Quiz 上传」入口，选择填写好的 Excel 文件，点击上传。

### 步骤 5：验证上线

- 系统会自动校验：
  - 必填字段是否齐全
  - ID 引用是否存在
  - 规则是否覆盖完整
  - **`is_default=true` 是否恰好 1 行**
- 校验通过后状态变为 `published`（或保持在 `draft` 由你控制），文章即可访问
- 校验失败会显示具体错误（sheet 名 + 行号 + 列名 + 错误描述）

---

## 5. 字段详解（按 Sheet）

### 5.1 `Structure`（层 + 组）

定义 quiz 的**漏斗结构**。每一行是一个**组**（用户在一个层里看到的一组题）。

| 列 | 字段名 | 必填 | 怎么填 |
|---|---|---|---|
| A | `layer_id` | ✅ | 层 ID，建议 `L1`、`L2`... 同 quiz 内唯一 |
| B | `layer_name` | — | 层中文名，后台阅读用 |
| C | `layer_default_tag` | — | 本层无胜出时的兜底标签（必须存在于 OptionTags 表同 layer）|
| D | `group_id` | ✅ | 组 ID，建议 `G1`、`G2`... 或带语义 `G_heavy_pet` |
| E | `group_name` | — | 组中文名 |
| F | `is_entry` | ✅ | 是否为入口组。**第 1 层必须恰好 1 个 `true`**，其他层全 `false` |

#### 怎么规划层和组？

**典型 2 层结构**：

```
L1（入口层）
  └─ G1：主问题（is_entry=true，用户必答）
  └─ G2：补充信息（公共题，收集用户画像）

L2（精准层，根据 L1 答案分流）
  └─ G_heavy_pet：严重宠物用户追加问题
  └─ G_light_pet：轻微宠物用户追加问题
```

**示例**：

| layer_id | layer_name | layer_default_tag | group_id | group_name | is_entry |
|---|---|---|---|---|---|
| L1 | 入口层 | other | G1 | 主问题 | true |
| L1 | 入口层 | other | G2 | 公共信息 | false |
| L2 | 程度与偏好 | wants_diy | G_heavy_pet | 严重宠物 | false |
| L2 | 程度与偏好 | wants_diy | G_light_pet | 轻度宠物 | false |

#### 同层多个组怎么填？

**layer 级字段（layer_id, layer_name, layer_default_tag）在每个组行都重复填一遍**。看起来有点冗余，但能让"层"和它的"组"绑在一起，避免漏配。

#### 顺序是怎么决定的？

**行的上下顺序 = 顺序**：
- `L1` 第一次出现的行决定 L1 是第 1 层
- 同一层内，`G1` 排在 `G2` 前面 → G1 先被路由到

---


### 5.2 `Questions`（题目）

一行 = 一道题。选项拼在一格里，用 `&split&` 分隔（沿用现有 quiz 模板约定）。

| 列 | 字段名 | 必填 | 怎么填 |
|---|---|---|---|
| A | `question_id` | ✅ | 题 ID，建议 `Q1`、`Q2`... 全局唯一 |
| B | `group_id` | ✅ | 这道题属于哪个组 |
| C | `text` | ✅ | 题干文字 |
| D | `is_public` | ✅ | `true` = 公共题（不评分），`false` = 评分题 |
| E | `img_path` | — | 题图路径（可空） |
| F | `options` | ✅ | 选项列表，用 `&split&` 拼接 |

#### 什么是公共题？

**公共题**：收集用户信息用，**不参与评分、不计入任何标签**。

典型用途：
- 「你家有宠物吗？」（用于业务画像）
- 「你的房屋面积是多少？」（用于个性化文案）
- 「你来自哪个城市？」（用于地域推荐）

**注意**：公共题在 OptionTags 表里**不能出现**对应的选项记录。

#### 怎么数选项位置？

OptionTags 表里的 `option_index` 是 0-based：

| options 列 | 切分后 | option_index |
|---|---|---|
| `红色&split&蓝色&split&绿色` | ["红色", "蓝色", "绿色"] | 0=红色, 1=蓝色, 2=绿色 |

**实操**：在 Questions 表填完 options 后，对着 options 列从左到右数 0、1、2...，然后填 OptionTags 表。

---

### 5.3 `OptionTags`（选项 + 标签）

定义**每个选项给哪些标签加分**，以及标签的属性。

| 列 | 字段名 | 必填 | 怎么填 |
|---|---|---|---|
| A | `question_id` | ✅ | 引用 Questions 表 |
| B | `option_index` | ✅ | 选项位置（0-based） |
| C | `tag` | ✅ | 标签名，同 layer 内唯一 |
| D | `layer_id` | ✅ | 这个标签属于哪一层 |
| E | `score` | ✅ | 加分数值（可负，可表示严重程度：分数越高问题越严重）|
| F | `priority` | ✅ | 平局优先级，**越小越优先**（1 > 2 > 3） |
| G | `bucket_min` | — | 分桶下界（配合 H 定义分桶） |
| H | `bucket_max` | — | 分桶上界 |

#### 核心概念：标签 + 分值 + 分桶

**标签（tag）**：用户特征名，如 `pet_hair`（宠物毛发）、`wants_pro`（想找专业服务）。

**分值（score）**：这个选项对这个标签的贡献。业务可以理解为"严重程度"——分数越高，问题越严重。

**分桶（bucket）**：同一标签按分数区间切成几段。比如 `pet_hair`：
- 0-3 分 = `light`（轻微）
- 4-10 分 = `heavy`（严重）

分桶的作用：**不同分桶走不同的下一层路径**。例如轻微走 DIY，严重走专业服务。

#### 怎么把一个标签分成多个桶？

把同一个 (question, option, tag) 写多行，每行用 `bucket_min`/`bucket_max` 表达不同的桶：

| question_id | option_index | tag | layer_id | score | priority | bucket_min | bucket_max |
|---|---|---|---|---|---|---|---|
| Q1 | 0 | pet_hair | L1 | 3 | 1 | 0 | 3 | ← 加 3 分落在 light 桶
| Q1 | 0 | pet_hair | L1 | 4 | 1 | 4 | 10 | ← 加 4 分落在 heavy 桶 |

**业务理解**：用户选了「宠物毛发」：
- 只触发这一项：+3 分，落在 light → 走 DIY 路线
- 还触发其他项累加到 5 分：落在 heavy → 走专业服务路线

#### `priority` 怎么用？

当用户在 L1 多个标签得分相同时（比如 pet_hair 和 dust 都得 5 分），用 priority 决定胜出标签。

**建议**：
- 严重问题的 priority 设小（如 1）——优先匹配严重问题
- 次要标签的 priority 设大（如 3）——作为保底
- 兜底标签（如 `other`）priority 设最大（如 3）——只在其他标签都 0 分时才胜出

---


### 5.4 `Rules`（路由 + 结果 + 结果页）

一张表三种规则，用 `rule_type` 列区分。

| 列 | 字段名 | 哪种规则用 | 怎么填 |
|---|---|---|---|
| A | `rule_type` | 所有 | `routing` / `result` / `result_page`，Excel 下拉 |
| B | `from_layer_id` | routing | 从哪一层出发 |
| C | `tag` | routing | 上一层胜出标签；写 `(DEFAULT)` 表示兜底 |
| D | `bucket` | routing | bucket 名；写 `(ANY)` 表示不区分 |
| E | `target_group_id` | routing | 跳转到哪个组 |
| F | `condition_expr` | result | 跨层判定 JSON |
| G | `result_page_id` | result / result_page | 结果页 ID |
| H | `is_default` | **result_page** | 是否兜底结果页（**v1.2 新增**）。全文**恰好 1 行** `true` |
| I | `title` | result_page | 结果页标题 |
| J | `content` | result_page | 结果页正文（富文本） |
| K | `img_path` | result_page | 结果页图片 |

#### 路由（routing）：怎么配置层间跳转

**匹配规则**：从第一行开始扫描，**第一条命中即生效**。

**配置技巧**：
1. **具体规则放上面**（如 `(L1, pet_hair, heavy) → G_heavy_pet`）
2. **兜底规则放最下面**（`(DEFAULT) + (ANY) → G_default`）

**示例**：

| rule_type | from_layer_id | tag | bucket | target_group_id | ... |
|---|---|---|---|---|---|
| routing | L1 | pet_hair | heavy | G_heavy_pet | | ← 具体规则
| routing | L1 | dust | heavy | G_default | | ← 具体规则
| routing | L1 | (DEFAULT) | (ANY) | G_default | | ← 兜底规则，**必须配置**

**每层都要配兜底**：每个非最后一层都**必须**有一条 `(DEFAULT) + (ANY) → 兜底组` 的规则。

#### 结果判定（result）：怎么配置最终结果

**匹配规则**：同样首条命中。

**`condition_expr` 格式**（JSON 字符串）：

```json
{"L1": {"tag": "pet_hair", "bucket": "heavy"}}
```

| 表达式 | 含义 |
|---|---|
| `{"tag": "X", "bucket": "Y"}` | 该层胜出标签必须是 X 且分桶是 Y |
| `{"any": true}` | 该层任意结果都匹配（**用于兜底**） |
| `{"tag": "X"}` | 简写，bucket 不限制 |

**示例**：

| rule_type | condition_expr | result_page_id | ... |
|---|---|---|---|
| result | {"L1":{"tag":"pet_hair","bucket":"heavy"}} | RP_pro_pet | | ← 具体判定
| result | {"L1":{"any":true}} | RP_default | | ← 兜底判定，**必须配置**

**必须配置 `any:true` 兜底**：保底覆盖任意组合。

#### 结果页（result_page）：怎么配置内容（**v1.2 重要变更**）

定义一张可被 result 引用的结果页。**v1.2 新增 `is_default` 列**用来标识兜底页：

| rule_type | result_page_id | is_default | title | content | img_path |
|---|---|---|---|---|---|
| result_page | RP_pro_pet | false | 专业宠物清洁 | 推荐专业清洁服务... | rp1.jpg |
| result_page | RP_default | **true** | 默认推荐 | 推荐通用产品... | rp_default.jpg |

**关于 `is_default`（必读）**：

- **只有 `rule_type=result_page` 的行才填 `is_default` 列**，`routing` 和 `result` 行这一列留空
- 全文（Rules 表）`is_default=true` 的行必须**恰好 1 条**
- 这 1 行就是**兜底结果页**：所有 `result` 规则都没匹配上时（虽然理论上 `any:true` 兜底会接住），系统还会以 `is_default=true` 的那张作为最终兜底
- 修改默认结果页：在结果页行上把 `is_default` 改一改即可，不用动任何其他表

**示例场景**：原本 `RP_default` 是兜底页，现在想让 `RP_pro_pet` 当兜底——把这两行的 `is_default` 值互换就行。

---

## 6. 典型业务场景示例

### 场景 1：简单 1 层 quiz（推荐 yes/no）

> 单题两选项，根据选项推不同结果。

**配置**：见本文档 §3「5 分钟上手」。

### 场景 2：2 层漏斗（宠物清洁案例）

> L1 识别问题类型 → L2 评估严重程度和偏好 → 推荐方案。

**完整示例**：见 [`quiz-dynamic-excel-schema.md` §7](./quiz-dynamic-excel-schema.md#7-完整业务示例)。

### 场景 3：带公共题的 quiz

> L1 主问题 + 公共信息收集题（房屋面积）。

**Structure 表**：
| layer_id | layer_name | layer_default_tag | group_id | group_name | is_entry |
|---|---|---|---|---|---|
| L1 | 入口层 | fallback | G1 | 主问题 | true |
| L1 | 入口层 | fallback | G2 | 公共信息 | false |

**Questions 表**：
| question_id | group_id | text | is_public | img_path | options |
|---|---|---|---|---|---|
| Q1 | G1 | 你家最主要的问题是？ | false | q1.jpg | ... |
| Q2 | G2 | 房屋面积？ | true | q2.jpg | 小于50㎡&split&大于50㎡ |

**OptionTags 表**：Q1 配置标签；**Q2 不出现**（因为 is_public=true）。

### 场景 4：3 层漏斗（深度个性化）

```
L1：识别大类（宠物 / 灰尘 / 污渍）
L2：评估严重程度（轻微 / 严重）
L3：评估用户预算（低 / 高）
→ 推荐 3 种细分方案
```

每加一层，在 Structure 加 1 行 `L<n>` + N 个组，Rules 加 N+M 条 routing/result 即可。

---


## 7. 字段速查表（cheat sheet）

| Sheet | 列 | 字段 | 必填 | 一句话作用 |
|---|---|---|---|---|
| Structure | A | layer_id | ✅ | 层唯一 ID |
| Structure | B | layer_name | — | 层展示名 |
| Structure | C | layer_default_tag | — | 层无胜出兜底标签 |
| Structure | D | group_id | ✅ | 题组唯一 ID |
| Structure | E | group_name | — | 组展示名 |
| Structure | F | is_entry | ✅ | 第 1 层必须恰好 1 个 true |
| Questions | A | question_id | ✅ | 题目唯一 ID |
| Questions | B | group_id | ✅ | 所属题组 |
| Questions | C | text | ✅ | 题干 |
| Questions | D | is_public | ✅ | 公共题不评分 |
| Questions | E | img_path | — | 题图 |
| Questions | F | options | ✅ | 选项 &split& 拼接 |
| OptionTags | A | question_id | ✅ | 引用题目 |
| OptionTags | B | option_index | ✅ | 选项索引（0-based） |
| OptionTags | C | tag | ✅ | 标签名 |
| OptionTags | D | layer_id | ✅ | 标签所属层 |
| OptionTags | E | score | ✅ | 加分（可负，可表示严重程度）|
| OptionTags | F | priority | ✅ | 平局优先级（越小越优先）|
| OptionTags | G | bucket_min | — | 分桶下界 |
| OptionTags | H | bucket_max | — | 分桶上界 |
| Rules | A | rule_type | ✅ | routing/result/result_page |
| Rules | B | from_layer_id | * | routing 起始层 |
| Rules | C | tag | * | routing 胜出标签；(DEFAULT)=兜底 |
| Rules | D | bucket | * | routing bucket；(ANY)=不区分 |
| Rules | E | target_group_id | * | routing 跳转组 |
| Rules | F | condition_expr | * | result 判定 JSON |
| Rules | G | result_page_id | * | 结果页 ID |
| Rules | H | is_default | * | **result_page**：是否兜底结果页（v1.2 新增） |
| Rules | I | title | * | 结果页标题 |
| Rules | J | content | * | 结果页正文（富文本）|
| Rules | K | img_path | * | 结果页图片 |

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

不能。`is_public` 二选一：要么纯评分题，要么纯公共题。如果想"既收集信息又参与评分"，拆成两道题。

### Q6：同选项能绑多个标签吗？

可以。一行一个 (question, option, tag) 组合，例如选项 0 同时绑 `pet_hair` 和 `dust`：

| question_id | option_index | tag | layer_id | score | priority | ... |
|---|---|---|---|---|---|---|
| Q1 | 0 | pet_hair | L1 | 5 | 1 | ... |
| Q1 | 0 | dust | L1 | 1 | 2 | ... |

### Q7：怎么调换层/组/题的顺序？

直接调整行的上下位置即可，**不需要改任何字段**。

### Q8：分数可以负数吗？

可以。负分表示"扣分"，例如"其他"选项扣 1 分，让它更难胜出。

### Q9：`bucket_min`/`bucket_max` 必须填吗？

强烈建议填。它是给业务自己看的参考，提醒你"这个标签有哪些分桶"。但**真正起作用的是 Rules 表的 `bucket` 字段**，两者不必严格对应。

### Q10：业务想新增一个分桶怎么办？

例如 `pet_hair` 想加一个 `urgent` 桶（11+ 分）：
1. OptionTags 表新增一行：`bucket_min=11, bucket_max=999`
2. Rules 表新增一条 routing：`tag=pet_hair, bucket=urgent → G_xxx`

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

---

## 9. 校验规则速查

### 上传前自查清单（业务侧）

- [ ] 文件名以 `quiz_` 开头（不带路径、不带空格），后缀是 `.xlsx`
- [ ] Structure 表第 1 层有且仅有 1 个 `is_entry=true`
- [ ] 每个非最后一层都有 1 条 `(DEFAULT) + (ANY)` 兜底 routing
- [ ] 至少有 1 条 `any:true` 兜底 result
- [ ] 至少 1 张 result_page，其中**恰好 1 行** `is_default=true`
- [ ] 所有跨 sheet 引用 ID 都存在（建议上传后看系统校验结果）
- [ ] 公共题（is_public=true）在 OptionTags 里没有对应记录

### 系统自动校验的错误格式

```
✗ 导入失败，共 4 处错误：

[Structure] 第 3 行：A 列 layer_id="L3" 但同层其他行的 layer_id="L1"
[Questions] 第 5 行：B 列 group_id="G_typo" 在 Structure 表中不存在
[OptionTags] 第 8 行：A 列 question_id="Q99" 在 Questions 表中不存在
[Rules] 第 12 行：F 列 condition_expr 不是合法 JSON
[Rules] result_page 行中 is_default=true 的数量 = 0（必须恰好 1 行）
```

格式：`[<Sheet名>] 第 <行号> 行：<列名> <错误描述>`

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

