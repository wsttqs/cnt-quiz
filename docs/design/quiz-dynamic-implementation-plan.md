# 动态 Quiz 文章 - 实施方案

> 版本：v1.1
> 编写日期：2026-09-14
> 输入依据：
> - `../requirements/quiz-dynamic-requirements.md` v1.2
> - `../requirements/quiz-dynamic-excel-schema.md` v1.0
> - `../analysis/current-implementation-analysis.md`
> - `../research/external-research.md`

---

## 0. 设计目标

在现有"固定 Quiz 文章"基础上，**扩展**支持"动态 Quiz 文章"——根据用户答题上下文，动态决定下一层展示什么题目，最终由各层标签组合决定结果页。

### 与现有体系的关系

| 维度 | 现状 | 本方案 |
|---|---|---|
| 业务侧配置 | Excel 单 sheet 6 列 | **同一 Excel 多 sheet 扩展（5 sheet）** |
| 前端模板 | page1.html | **复用 + 扩展**支持动态 |
| 数据落库 | 静态 md 文件 | **新增 DB 表 + 静态资源** |
| 与固定 Quiz 关系 | — | **并存不破坏**，老文章继续可用 |

---

## 1. 总体架构

```
┌──────────────────────────────────────────────────────────────┐
│  业务侧：Excel 配置（5 个 sheet）                                │
└──────────────────┬───────────────────────────────────────────┘
                   │ 上传 .xlsx
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  Excel 导入管线（Import Pipeline）                              │
│  ┌─────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐    │
│  │ Parser  │→ │ Validator│→ │ Cross-Sheet │→ │  Error   │    │
│  │ xlsx→   │  │ Schema   │  │ Reference   │  │ Reporter │    │
│  │ JSON    │  │ Check    │  │ Check       │  │          │    │
│  └─────────┘  └──────────┘  └─────────────┘  └──────────┘    │
└──────────────────┬───────────────────────────────────────────┘
                   │ 校验通过 → 落库
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  Quiz 模板库（DB Tables）                                       │
│  quiz_templates / structures / questions / option_tags /      │
│  rules (含 routing + result + result_page)                     │
└──────────────────┬───────────────────────────────────────────┘
                   │ 加载模板
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  Quiz 运行时引擎（Runtime Engine）                              │
│  ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  State Mgr │ │ Scoring  │ │ Routing  │ │ Result       │   │
│  │  会话状态   │ │ 累加决胜 │ │ (标签,   │ │ Matcher      │   │
│  │            │ │ 分桶     │ │  区间)→  │ │ (规则→结果)  │   │
│  └────────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└──────────────────┬───────────────────────────────────────────┘
                   │ 渲染
                   ▼
┌──────────────────────────────────────────────────────────────┐
│  文章模板（Article Template）                                   │
│  - 题页渲染器（动态题 + 公共题）                                 │
│  - 结果页渲染器（复用现有模板）                                  │
│  - 进度条 + 修改答案重算                                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. 核心实体（5 张配置表 + 3 张答题表）

### 2.1 配置表（5 张，对应 5 个 Excel sheet）

```
quiz_templates
  ├─ quiz_id (PK)
  ├─ title
  ├─ status (draft / published)
  ├─ quiz_type (fixed / dynamic)        ← 区分固定/动态
  ├─ default_result_page_id             ← 引用 quiz_rules.rule_id (type=result_page)
  └─ created_at / updated_at

quiz_structures                          ← 合并 layers + groups，每行一个 group
  ├─ structure_id (PK)
  ├─ quiz_id (FK)
  ├─ layer_id (业务命名，同 quiz 内唯一)
  ├─ layer_order (1-N)
  ├─ layer_name
  ├─ layer_default_tag                  ← 本层无胜出时使用，引用 quiz_option_tags.tag
  ├─ group_id (业务命名，全局唯一)
  ├─ group_order (同 layer 内 1-N)
  ├─ group_name
  └─ is_entry (bool, 仅第 1 层有 1 个 true)

quiz_questions                           ← 合并 questions + options
  ├─ question_id (PK)
  ├─ group_id (FK, 引用 quiz_structures.group_id)
  ├─ text
  ├─ order (同 group 内 1-N)
  ├─ is_public (bool)                   ← 公共题不参与评分
  ├─ img_path
  └─ options (TEXT, &split& 拼接)

quiz_option_tags                         ← 合并 option_tags + tags
  ├─ option_tag_id (PK)
  ├─ question_id (FK)
  ├─ option_index (int, 0-based)        ← 定位 quiz_questions.options 切分后的某项
  ├─ tag (业务命名)
  ├─ layer_id (FK, 引用 quiz_structures.layer_id)
  ├─ score (整数, 可负)
  ├─ priority (整数, 同分决胜)
  ├─ bucket_min (int, 可选)
  └─ bucket_max (int, 可选)

quiz_rules                               ← 合并 routing + result + result_page
  ├─ rule_id (PK)
  ├─ quiz_id (FK)
  ├─ rule_type (routing / result / result_page)
  ├─ order (升序匹配，routing/result 用)
  ├─ from_layer_id (routing 用)
  ├─ tag (routing 用，含 (DEFAULT) 兜底)
  ├─ bucket (routing 用，含 (ANY) 兜底)
  ├─ target_group_id (routing 用)
  ├─ condition_expr (JSON, result 用)
  ├─ result_page_id (result 用, 引用 type=result_page 的 rule_id)
  ├─ title (result_page 用)
  ├─ content (TEXT, result_page 用，富文本)
  └─ img_path (result_page 用)
```

### 2.2 答题数据（3 张表）

```
quiz_attempts                           ← 每次答题会话
  ├─ attempt_id (PK)
  ├─ quiz_id
  ├─ session_id
  ├─ status (in_progress / completed / abandoned)
  ├─ final_result_page_id
  ├─ started_at
  └─ ended_at

quiz_attempt_layer_outputs              ← 每层的胜出标签
  ├─ attempt_id (FK)
  ├─ layer_id
  ├─ winning_tag
  ├─ winning_score
  ├─ bucket                             ← 落入的分桶
  └─ output_at

quiz_attempt_events                     ← 事件流（漏斗 / 重算 / 跳层）
  ├─ event_id (PK)
  ├─ attempt_id (FK)
  ├─ event_type (layer_enter / answer_submit / answer_modify /
  │              layer_complete / early_end / result_match)
  ├─ payload (JSON)
  └─ created_at
```

---

## 3. Excel 配置概要

**详细字段定义、示例、校验规则、完整业务示例见** [`../requirements/quiz-dynamic-excel-schema.md`](../requirements/quiz-dynamic-excel-schema.md)

### 3.1 Sheet 清单（5 个）

| # | Sheet | 对应 DB 表 | 一句话职责 |
|---|---|---|---|
| 1 | `Quiz` | quiz_templates | 文章元数据（1 行/篇） |
| 2 | `Structure` | quiz_structures | 层 + 题组合并（每行一个 group） |
| 3 | `Questions` | quiz_questions | 题目 + 选项合并（options 用 `&split&`） |
| 4 | `OptionTags` | quiz_option_tags | 选项→(标签, 分值, 优先级) + 标签元数据 |
| 5 | `Rules` | quiz_rules | 路由 + 结果 + 结果页（`rule_type` 列区分） |

### 3.2 各 sheet 字段概要

#### Quiz（1 行/篇）
```
| quiz_id | title | status | default_result_page_id |
```

#### Structure（每行一个 group，layer 级字段同层重复）
```
| layer_id | layer_order | layer_name | layer_default_tag |
| group_id | group_order | group_name | is_entry          |
```

#### Questions（每题一行，选项 `&split&` 拼接）
```
| question_id | group_id | text | order | is_public | img_path | options |
```

#### OptionTags（每 (question, option, tag) 一行）
```
| question_id | option_index | tag | layer_id |
| score       | priority     | bucket_min | bucket_max |
```

#### Rules（用 rule_type 区分 routing/result/result_page）
```
| rule_type | order | from_layer_id | tag | bucket | target_group_id |
| condition_expr | result_page_id | title | content | img_path        |
```

### 3.3 三种 rule_type 的字段启用规则

| rule_type | 必填字段 | 可选字段 | 留空字段 |
|---|---|---|---|
| **routing** | `from_layer_id`, `target_group_id` | `tag`（默认 `(DEFAULT)`）, `bucket`（默认 `(ANY)`） | 其余 |
| **result** | `condition_expr`, `result_page_id` | — | 其余 |
| **result_page** | `result_page_id`, `title`, `content` | `img_path` | 其余 |

> **为什么合并**：Routing 和 Result 都是"决策表"，Result Page 是它们的输出。三者共享 `order` 字段，混在一张表里业务能直接看到"路由规则 → 结果规则 → 结果页内容"的完整链路。

### 3.4 option_index 约定

Questions 表的 `options` 列用 `&split&` 拼接，OptionTags 表的 `option_index` 定位具体选项：

```
Questions 第 X 行：options = "宠物毛发&split&灰尘&split&顽固污渍&split&其他"
                   → 切分后: ["宠物毛发", "灰尘", "顽固污渍", "其他"]
                   → option_index: 0, 1, 2, 3
```

业务填写 OptionTags 时对照 Questions 表的 options 字段从左到右数即可。

### 3.5 业务逻辑校验（Logic Validator 必查项）

- ✅ Quiz 表恰好 1 行
- ✅ 每篇 quiz 都有默认结果页
- ✅ 第 1 层有且仅有 1 个 `is_entry=true` 的 group
- ✅ 每层（非最后一层）都有兜底 routing：`(DEFAULT)` + `(ANY)` → 兜底 group
- ✅ 每层都有 `layer_default_tag`
- ✅ 每层至少 1 条 result 规则带 `any:true` 兜底
- ✅ 每篇 quiz 至少有 1 个 result_page 行
- ✅ 公共题（`is_public=true`）在 OptionTags 中无记录

---

## 4. Excel 导入管线（Import Pipeline）

### 4.1 处理流程

```
[上传 xlsx]
   │
   ▼
[1. Parser] xlsx → 中间 JSON（5 个 sheet 各自解析）
   │
   ▼
[2. Schema Validator] 按 §3 / Excel Schema §6.1 验证每行每列
   │ 错误：记录并中止
   ▼
[3. Cross-Sheet Validator] 跨 sheet 引用 / 完整性
   │ 错误：列出所有引用错误
   ▼
[4. Logic Validator] 业务逻辑校验（按 §3.5）
   │ 错误：列出所有业务逻辑问题
   ▼
[5. Error Reporter] 聚合所有错误，定位到 sheet/row/column
   │
   ▼
[6. Persist] 全部通过 → 落库
   - 事务写入
   - 同一 quiz_id 旧数据先清后写（v1.2 覆盖语义）
```

### 4.2 错误反馈格式

业务看到的错误报告示例：

```
✗ 第 4 处错误，导入失败：

[Structure] 第 3 行，A 列 layer_id="L3" 但 quiz_id="quiz_demo" 在 Quiz sheet 中不存在
[Rules] 第 5 行，bucket="medium" 但在 Routing 上下文里未配置对应规则
[Rules] 第 2 行，result_page_id="RP_typo" 在本表 type=result_page 行中不存在（你可能想写 RP_pro_pet）
[Logic] 第 1 层 L1 没有 is_entry=true 的 group（必须配置入口题组）
```

### 4.3 失败模式

| 阶段 | 失败处理 |
|---|---|
| Parser 失败 | 直接返回，提示"文件无法解析" |
| Schema 失败 | 列出所有字段错误，**不落库** |
| Cross-Sheet 失败 | 列出所有引用错误，**不落库** |
| Logic 失败 | 列出业务逻辑问题，**不落库** |
| Persist 失败 | 事务回滚，提示"系统异常，请重试" |

---

## 5. 运行时引擎（Runtime Engine）

### 5.1 状态机

```
                ┌──────────────┐
                │    START     │
                └──────┬───────┘
                       │ load quiz
                       ▼
                ┌──────────────┐
        ┌──────▶│  L1.ENTRY    │◀──────┐
        │       │  Group       │       │
        │       └──────┬───────┘       │
        │              │ submit answer │
        │              ▼               │
        │       ┌──────────────┐       │
        │       │  SCORE L1    │       │ modify answer
        │       └──────┬───────┘       │ (recalc from here)
        │              │               │
        │              ▼               │
        │       ┌──────────────┐       │
        │       │ EARLY_END?   │       │
        │       └──────┬───────┘       │
        │           yes │ no           │
        │              ▼               │
        │       ┌──────────────┐       │
        │       │ ROUTE L1     │       │
        │       │ → L2 group   │       │
        │       └──────┬───────┘       │
        │              │               │
        │              ▼               │
        │       ┌──────────────┐       │
        │       │  L2          │───────┘
        │       │  ...         │
        │       └──────┬───────┘
        │              │ last layer
        │              ▼
        │       ┌──────────────┐
        │       │ MATCH_RESULT │
        │       └──────┬───────┘
        │              │
        └──────────────┤
                       ▼
                ┌──────────────┐
                │  RESULT PAGE │
                └──────────────┘
```

### 5.2 关键操作

#### start_attempt(quiz_id, session_id)
- 创建 quiz_attempts 行（status=in_progress）
- 加载 L1 的 entry group（`quiz_structures.is_entry=true`）的所有 question
- 返回第一道题

#### submit_answer(layer_id, question_id, option_id)
- 写入 quiz_attempt_events（event_type=answer_submit）
- 如果当前层所有题都已答完 → 触发 score_layer
- 否则返回下一道题

#### modify_answer(layer_id, question_id, option_id)
- 写入 quiz_attempt_events（event_type=answer_modify）
- **清空当前层及以下的所有状态**（answers / outputs）
- 重新加载当前层题目

#### score_layer(layer_id)
```
1. 遍历该层所有题目 → 收集选中选项 → 转 (question_id, option_index)
2. 对每个 (question_id, option_index) 查 quiz_option_tags，累加各 (tag, score)
3. 按 priority 取最高分（最高分胜出，同分按 priority）
4. 如果没有任何标签有分 → 使用 quiz_structures.layer_default_tag
5. 用 score_buckets 分桶 → 得到 (winning_tag, winning_score, bucket)
6. 写入 quiz_attempt_layer_outputs
7. 触发 early_end 检查 + route_layer
```

#### route_layer(layer_id)
```
1. 从 quiz_rules 找 (rule_type=routing, from_layer=layer, tag, bucket) 首条命中
2. 如果未命中 → 找 tag="(DEFAULT)" + bucket="(ANY)" 的兜底
3. 加载 target_group_id 对应的下一道题
```

#### match_result(attempt_id)
```
1. 读取所有 quiz_attempt_layer_outputs
2. 按 quiz_rules (rule_type=result) 的 order 顺序首条 condition_expr 命中
3. 如果都没命中 → 用 quiz_templates.default_result_page_id
4. 更新 attempt.final_result_page_id，status=completed
```

### 5.3 修改答案重算（v1.2 §3.1）

- 用户在当前层修改任一已选项 → 提交时从当前层起向下重算
- 上层状态不变
- 实现：清空 quiz_attempt_layer_outputs 中 layer_id ≥ 当前层的记录 + 重新 score_layer + route

---

## 6. 文章模板（前端）

### 6.1 复用现状

- 现有 `page1.html` 作为基础
- 复用 Hugo 的 `_index.md` / `index.md` / 数字 .md 模式
- 静态资源（图片）保持 `{N}.jpg` 命名

### 6.2 新增渲染能力

| 渲染器 | 职责 | 复用现有 |
|---|---|---|
| 题页渲染器 | 展示题目 + 选项 + 进度条 + 修改答案按钮 | ✅ 复用 page1 风格 |
| 公共题渲染器 | 同题页但显示"该题不影响结果" | ❌ 新增 |
| 结果页渲染器 | 复用现有结果页模板 | ✅ 完全复用 |
| 进度条 | 按"层×题"计算百分比 | ❌ 新增（基于 v1.2 §10 P0-2） |

### 6.3 前端状态

- 当前 attempt_id
- 当前 layer_id / group_id / question_id
- 已答选项缓存
- 进度（layers_completed / total_layers）

---

## 7. 跟踪数据输出（Tracking Output）

### 7.1 必交付（v1.2 §7）

每条 attempt 完成后产出：

```json
{
  "attempt_id": "uuid",
  "quiz_id": "quiz_demo",
  "session_id": "session_xyz",
  "started_at": "...",
  "ended_at": "...",
  "layer_outputs": [
    { "layer_id": "L1", "winning_tag": "pet_hair", "score": 5, "bucket": "heavy" },
    { "layer_id": "L2", "winning_tag": "wants_pro", "score": 2, "bucket": null }
  ],
  "final_result_page_id": "RP_pro_pet",
  "dropped_at": null
}
```

### 7.2 落库位置

- `quiz_attempts`（主表）
- `quiz_attempt_layer_outputs`（层输出）
- `quiz_attempt_events`（事件流）

业务可直接 SQL 查询这两类数据。

### 7.3 不做的（v1 范围外）

- 实时 dashboard / BI 看板
- 用户级聚合分析
- 与 CRM 联动

---

## 8. 与现有固定 Quiz 的共存策略

### 8.1 策略：共存 + 复用基础实体

```
┌────────────────────────────────────────────┐
│ quiz_templates (统一表)                      │
│   quiz_type = "fixed"   → 走老逻辑          │
│   quiz_type = "dynamic" → 走新逻辑          │
└────────────────────────────────────────────┘

老 quiz：复用 quiz_questions / quiz_options（不需要新字段）
新 quiz：复用 quiz_questions / quiz_options + 新增 quiz_structures 等
```

### 8.2 互不破坏

- 老 quiz 文章 URL 不变，前端模板选择逻辑不变
- 新 quiz 文章走新 URL 路由 + 新模板
- DB schema 演进时，老字段保留兼容

### 8.3 数据导入兼容

- 老 quiz 仍由原导入逻辑处理（单 sheet）
- 新 quiz 走新 5-sheet 导入
- 入口可以是同一个上传页面，根据 quiz_type 分流

---

## 9. 实施分期

### P0（第 1-2 周）：配置 + 存储
- [ ] Excel 5-sheet schema 终稿（业务评审通过）
- [ ] DB schema 建表
- [ ] Excel Parser + Validator（基础）
- [ ] Error Reporter（详细报错）
- [ ] 导入 API + 落库

### P1（第 3-5 周）：运行时 + 渲染
- [ ] Runtime Engine（State Mgr / Scoring / Routing / Result Matcher）
- [ ] 修改答案重算
- [ ] 题页 / 公共题页 / 结果页模板
- [ ] 进度条
- [ ] 端到端跑通 1 篇动态 quiz

### P2（第 6-7 周）：跟踪 + 体验
- [ ] Tracking 埋点（quiz_attempts / layer_outputs / events）
- [ ] 数据导出接口（业务能 SQL 查）
- [ ] 错误反馈优化（行/列精确定位）
- [ ] 业务试答验证（找业务过几遍）

### P3（后续，非本期）
- 修改已发布 quiz 的版本管理
- 可视化预览 / 编辑器
- 配置校验清单的 UI 化
- 性能优化（路由表查询缓存）

---

## 10. 风险与缓解

| # | 风险 | 影响 | 缓解 |
|---|---|---|---|
| 1 | Excel 多 sheet 学习成本 | 业务配置错误多 | 模板内示例 + 严格数据验证 + 错误精确定位 |
| 2 | Structure 表 layer 级字段重复填 | 业务易复制出错 | 模板内置示例 + 同行一致性校验 |
| 3 | OptionTags.option_index 错位 | 选项-标签错配 | 导入时校验 option_index 在 options 切分范围内 |
| 4 | Routing 表覆盖不全 | 用户卡在某一层 | Logic Validator 检测 + 兜底 (DEFAULT)+(ANY) |
| 5 | Result 规则不命中 | 用户看不到结果 | 默认结果页强制配置 + any:true 兜底 |
| 6 | 修改答案重算 bug | 用户答题状态错乱 | 单元测试 + 集成测试覆盖 |
| 7 | 老 quiz 兼容性 | 现有文章破坏 | quiz_type 区分 + 老逻辑保留 + 回归测试 |
| 8 | 结果页模板适配 | 结果页内容缺失 | 复用现有结果页模板 + 内容字段扩展 |
| 9 | 业务侧 Excel 配置习惯未摸清 | 后续频繁改 schema | 多抽 2-3 篇样本分析 + 业务评审 |

---

## 11. 关键交付物清单

| 交付物 | 落地位置 | 负责人 |
|---|---|---|
| Excel 模板终稿 | [`requirements/quiz-dynamic-excel-schema.md`](../requirements/quiz-dynamic-excel-schema.md) | 产品 + 业务 |
| 实施方案 | `design/quiz-dynamic-implementation-plan.md`（本文档） | 产品 + 后端 |
| ER 详细设计 | `design/quiz-dynamic-er.md` | 后端 |
| Runtime Engine 代码 | 后端服务 | 后端 |
| Import Pipeline 代码 | 后端服务 | 后端 |
| 题页 / 结果页模板 | 前端 `page1.html` 扩展 | 前端 |
| 跟踪数据查询接口 | 后端 API | 后端 + 数据 |

---

## 12. 下一步行动

1. **业务评审 Excel schema**（基于 `requirements/quiz-dynamic-excel-schema.md`）
2. **抽 2-3 篇现有 quiz 样本** 验证现有格式假设
3. **技术评审 ER / Runtime 架构**
4. **确定结果页模板字段扩展范围**

---

## 13. 版本日志

- v1.1（2026-09-14）：
  - Excel schema 精简：10 sheet → 5 sheet
  - DB 表精简：10 张 → 6 张配置表
  - 新增 Excel schema 详细文档 `requirements/quiz-dynamic-excel-schema.md`
  - §3 改为概要，详细字段定义指向新文档
- v1.0（2026-09-14）：初版，10 sheet schema
