# Requirements - 需求文档

存放与业务方对齐的需求规格、配置模板定义等。

## 当前文档

| 文档 | 说明 | 受众 |
|---|---|---|
| [quiz-dynamic-requirements.md](quiz-dynamic-requirements.md) | 动态 Quiz 文章需求规格 v1.2（核心需求、模型、流程、已确认规则）| 产品 / 技术 |
| [quiz-dynamic-excel-schema.md](quiz-dynamic-excel-schema.md) | 动态 Quiz Excel 配置模板 Schema v1.3（**4 sheet**、字段定义、校验规则、完整业务示例）| 技术 / 业务 |
| [quiz-dynamic-excel-user-guide.md](quiz-dynamic-excel-user-guide.md) | 动态 Quiz Excel 配置指南 v1.2（**业务侧使用手册**，5 分钟上手、字段详解、典型场景、FAQ）| 业务运营 |

## 配套模板

- [quiz-dynamic-template-v4.xlsx](quiz-dynamic-template-v4.xlsx) — 与 Schema v1.3 对应的 Excel 模板（4 sheet，含示例数据）

## 配套

- 外部调研：[`../research/`](../research/)
- 现有实现分析：[`../analysis/`](../analysis/)
- 实施方案：[`../design/`](../design/)

## 阅读顺序

### 业务运营（只想配置 quiz）

1. 先读 [quiz-dynamic-excel-user-guide.md](quiz-dynamic-excel-user-guide.md) 的 §2「文件命名约定」和 §3「5 分钟上手」
2. 遇到字段细节问题时再翻 [quiz-dynamic-excel-schema.md](quiz-dynamic-excel-schema.md)

### 产品 / 技术（评审需求 / 设计实现）

1. 先读 [quiz-dynamic-requirements.md](quiz-dynamic-requirements.md) 了解需求模型
2. 再读 [quiz-dynamic-excel-schema.md](quiz-dynamic-excel-schema.md) 了解 schema
3. 业务侧使用流程参考 [quiz-dynamic-excel-user-guide.md](quiz-dynamic-excel-user-guide.md)

## v1.3 关键变更速览（重要）

相比 v1.2，**移除 4 个冗余列**，**题目字段命名对齐现有 quiz**：

| 字段 | v1.2 做法 | v1.3 做法 |
|---|---|---|
| `Questions.text` | 手填题干 | **`sub_title`**（对齐现有 quiz） |
| `Questions.options` | 手填选项拼接 | **`question_options`**（对齐现有 quiz） |
| `Questions.is_public` | bool 列标记公共题 | **移除**（OptionTags 无记录 = 公共题） |
| `Questions.answer` | 无 | **新增**（题干解释，可选） |
| `Structure.is_entry` | bool 列标记入口组 | **移除**（首个 layer_id = 入口层，且恰好 1 个 group） |
| `OptionTags.bucket_min` | 分桶下界 | **移除**（路由只看 Rules.bucket） |
| `OptionTags.bucket_max` | 分桶上界 | **移除**（路由只看 Rules.bucket） |

**配套模板文件**：`quiz-dynamic-template-v4.xlsx`（请使用 v4，不要用 v1/v2/v3）

---

## v1.2 关键变更速览（历史）

相比 v1.1，**Excel 从 5 sheet 减为 4 sheet**（移除 Quiz sheet）：

| 字段 | v1.1 做法 | v1.2 做法 |
|---|---|---|
| 文章 ID | Quiz 表 A 列手填 | **从 Excel 文件名自动获取**（去掉 .xlsx 后缀） |
| 文章标题 | Quiz 表 B 列手填 | **默认同文件名**，CMS 后台可改名 |
| 状态（draft/published） | Quiz 表 C 列手填 | **CMS 控制**，Excel 不再维护 |
| 兜底结果页 | Quiz 表 D 列填 default_result_page_id | **Rules 表 result_page 行用 is_default=true 标识** |