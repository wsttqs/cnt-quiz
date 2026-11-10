# 现有 Quiz 实现分析

> 版本：v1.0
> 调研日期：2026-09-14
> 目的：摸清现有"固定 Quiz"实现，作为 v1.3 Excel schema 设计的基线

---

## 1. 样本

- **线上链接**：https://en.myhomesgardens.com/post/test-your-knowledge-of-u-s-geography-with-this-quiz
- **文章 slug**：`test_your_knowledge_of_u_s_geography_with_this_quiz`
- **样本数**：1 篇（U.S. Geography 主题）

> ⚠️ 结论基于单一样本，可能不覆盖所有变体。建议补充 2-3 篇其他主题文章再做最终结论。

---

## 2. 文件结构

```
<article-slug>/
├── _index.md       ← Hugo 分页配置（paginate_by=1）
├── index.md        ← 引导页（intro + 首图）
├── 1.md            ← 第 1 题
├── 2.md            ← 第 2 题
├── ...
├── 30.md           ← 第 30 题
├── 31.md           ← 唯一的"结果页"
└── 1.jpg ~ 31.jpg  ← 每页一张图（N 与 N.md 对应）
```

**共 32 张内容页**：1 引导 + 30 题 + 1 结果。

---

## 3. .md 文件字段（从前 N 个样本提取）

### 3.1 引导页（index.md）

```yaml
title: "Test Your Knowledge of U.S. Geography with This Quiz!"
date: 2025-01-14 18:59:11
template: "page1.html"
has_share_block: true
is_open_html_safe: false
next: true
img: "/post/.../1.jpg"
keywords: ""
main_img: "/post/.../1.jpg"
---
From sea to shining sea, the United States is brimming with...
```

### 3.2 题目页（1.md ~ 30.md）

```yaml
title: "Test Your Knowledge of U.S. Geography with This Quiz!"
date: 2025-01-14 18:59:12
template: "page1.html"
has_share_block: true
is_open_html_safe: false
keywords: ""
progress: 3           ← 进度百分比（3, 7, 10, ... ,97）
main_img: "/post/.../2.jpg"
footer_text: ""
sub_title: "In which state is the Grand Canyon?"   ← 题干
answer: "Grand Canyon National Park was established..."   ← 解释文本
question_options: ["Arizona","Texas","Kansas","Hawaii"]   ← 4 个选项
correct_answer: 1                                    ← 1-based 正确选项
author: "Jenny - Jan 14, 2025"
```

### 3.3 结果页（31.md）

```yaml
title: "..."
date: 2025-01-14 18:59:42
template: "page1.html"
has_share_block: true
is_open_html_safe: false
keywords: ""
progress: 100
main_img: "/post/.../32.jpg"
quiz_result_score: "30"          ← 满分值（硬编码）
quiz_result_title: "Congratulations! You've finished all the questions."
author: "..."
```

**只有一个固定结果页**，显示完成文案。

---

## 4. Excel 原始格式（业务侧准备）

### 4.1 文件信息

- 文件名：`test_your_knowledge_of_u_s_geography_with_this_quiz.xlsx`
- Sheet 数：3（仅 Sheet1 有内容，Sheet2 / Sheet3 为空）

### 4.2 Sheet1 结构（单 sheet，6 列）

| 行 | A= sub_title | B= answer | C= question_options | D= correct_answer | E= content | F= footer_text |
|---|---|---|---|---|---|---|
| 1 | sub_title | answer | question_options | correct_answer | content | footer_text | ← 表头
| 2 | (空) | (空) | (空) | (空) | From sea to shining sea... | (空) | ← 引导页
| 3 | In which state is the Grand Canyon? | Grand Canyon National Park... | Arizona&split&Texas&split&Kansas&split&Hawaii | 1 | (空) | (空) |
| 4 | What state is known as "The First State"? | Delaware is called... | Delaware&split&Colorado&split&Pennsylvania&split&Georgia | 1 | (空) | (空) |
| ... | ... | ... | ... | ... | ... | ... |
| 32 | Which state famously had six different national flags...? | Texas has been under... | Alaska&split&Texas&split&California&split&Nevada | 2 | (空) | (空) |

**行结构**：
- 第 1 行：表头
- 第 2 行：引导页（用 E 列存 intro 文本）
- 第 3-32 行：30 道题

### 4.3 `&split&` 分隔符模式

选项数组用 `&split&` 拼接存到单格：

```
Arizona&split&Texas&split&Kansas&split&Hawaii
```

解析时按 `&split&` split → 数组。`correct_answer` 用 1-based 索引。

---

## 5. 关键设计特征

| 特征 | 体现 | 对 v1.3 的影响 |
|---|---|---|
| **Excel 极简** | 单 sheet，6 列 | 业务熟悉度高，扩展时尽量保持简洁 |
| **`&split&` 数组模式** | 单格存选项数组 | 可借鉴作为"短数组"的表达方式 |
| **snake_case 英文字段** | sub_title / question_options / correct_answer | v1.3 字段名延续此风格 |
| **图片命名约定** | {N}.jpg 与 {N}.md 对应 | v1.3 资产命名可保留类似约定 |
| **结果页字段** | quiz_result_score / quiz_result_title | 结果页有独立字段，可扩展 |
| **唯一固定结果** | 30/30 分即"Congratulations" | 动态 Quiz 的结果页字段需重定义 |

---

## 6. 现有 → 动态 Quiz 的差距

| 维度 | 现有 | 动态 Quiz 需要 | 差距 |
|---|---|---|---|
| **Excel 结构** | 单 sheet 6 列 | 多 sheet 10+ 列 | 业务需要学多 sheet |
| **数据实体** | 每行 = 一道题 | 行 = 标签 / 路由 / 结果 / 题等不同实体 | 概念模型变了 |
| **评分机制** | 唯一正确选项 | 多标签 + 分值累加 | 数据结构变了 |
| **流程模型** | 固定 30 题顺序 | 多层漏斗 + 动态路由 | 流程模型变了 |
| **结果模型** | 1 个固定结果页 | 多结果页 + 标签组合匹配 | 结果模型变了 |
| **标签概念** | 无 | 每层有标签，跨层组合 | 全新概念 |
| **路由概念** | 无 | (标签, 分值) → 下一层 | 全新概念 |
| **资源准备** | 业务只准备 Excel | 业务可能需要准备结果页内容 | 资产范围扩大 |

---

## 7. v1.3 Schema 设计原则（基于现有实现）

### 7.1 必须保持

- ✅ snake_case 英文字段名
- ✅ Excel 单文件多 sheet
- ✅ `&split&` 模式用于短数组（如选项列表、标签列表）
- ✅ 字段名语义化（业务看一眼能懂）
- ✅ 必填字段在表头标注

### 7.2 必须扩展

- 新增多个 sheet 表达漏斗层 / 标签 / 路由 / 结果
- 跨 sheet 引用用 ID（不依赖 Excel 公式）
- 关键字段加 Excel 数据验证（下拉菜单）

### 7.3 必须避免

- ❌ 单 sheet 表达所有（动态 quiz 实体太多）
- ❌ 用中文做 ID
- ❌ 让业务手写 Excel 公式
- ❌ 字段名跟现有 quiz 重名但含义不同（避免混淆）

---

## 8. 建议的 v1.3 sheet 清单（基于现有 6 列扩展）

| Sheet | 字段来源 | 备注 |
|---|---|---|
| **Quiz** | 新增 | 基础信息（标题、默认结果页） |
| **Layers** | 新增 | 漏斗层定义 |
| **Groups** | 新增 | 题目组 |
| **Questions** | sub_title | 复用现有字段名 |
| **Options** | question_options 拆分 | 从单格数组拆成多行 |
| **OptionTags** | 新增 | 选项→(标签, 分值) 绑定 |
| **Tags** | 新增 | 标签 + 优先级 + 分桶 |
| **Routing** | 新增 | 层间路由决策表 |
| **Results** | 新增 | 结果匹配决策表 |
| **ResultPages** | quiz_result_title 等 | 复用 + 扩展 |

> **Questions / Options / OptionTags** 是核心新表，把现有 6 列结构拆开重组。
> **Routing / Results** 是新增决策表（对应 v1.2 §6 的 Excel schema）。

---

## 9. 下一步

1. 补 2-3 篇其他主题文章样本，确认现有格式是否一致（特别是结果页结构）
2. 基于本分析出 v1.3 schema 详细字段定义
3. 找业务侧评审 Excel 模板的可读性（特别是多 sheet 的接受度）
