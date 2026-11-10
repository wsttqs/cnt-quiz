# 外部调研 - 动态 Quiz / 条件分支内容配置

> 版本：v1.0
> 调研日期：2026-09-14
> 用途：作为 `requirements/quiz-dynamic-requirements.md` 的市场参考与方案背书

---

## 0. 调研背景

### 0.1 我们的场景

- 内部内容系统，已有"固定 Quiz 文章"上传功能（业务用 Excel 准备题目 → 系统生成文章）
- 本次需求：**新增动态 Quiz 文章**——根据用户答题上下文，动态决定下一层展示什么题目
- 关键技术决策：**用 Excel 配置业务规则**（不做前端编辑器）

### 0.2 调研目标

1. 市场上"动态 Quiz / 条件分支内容"是怎么做的
2. 主流配置形态（页面交互 vs 结构化数据）的取舍
3. 找到与我们方案最接近的成功先例
4. 给我们 v1.2 方案的市场定位背书

---

## 1. 市场主流方案分类

### 1.1 表单 / 问卷类

| 产品 | 核心机制 | 表达方式 |
|---|---|---|
| Typeform | Logic Jump（逻辑跳转） | 可视化流程图 + 每题跳转规则 |
| JotForm | Conditional Logic | 每题/选项配显示/跳转条件 |
| SurveyMonkey | Skip Logic / Branching | 可视化流程图 + 跳转条件 |
| Qualtrics | Survey Flow | 高级流程控制 + 嵌入式逻辑 |
| Google Forms | Go to section based on answer | 简单跳转 |

### 1.2 互动 Quiz / 个性化结果类

| 产品 | 核心机制 | 表达方式 |
|---|---|---|
| Interact | 分段（Segments）+ 结果匹配 | 可视化 + 标签评分 |
| Outgrow | Outcome 配置 + 计算器 | 可视化 + 公式 |
| Octane AI（Shopify） | 电商 Quiz + 产品推荐 | 标签 + 产品映射 |
| ScoreApp | 评分 + 分级结果 | 标签 + 分桶 + 结果 |
| Quiz Kit（Shopify） | Shopify 集成 | 选项→标签→结果 |

### 1.3 决策规则 / 业务规则类（参考模型）

| 产品 / 模式 | 核心机制 | 表达方式 |
|---|---|---|
| Drools（Red Hat） | 决策表 | Excel 矩阵 |
| Camunda | DMN 决策表 | XML / JSON |
| Easy Rules | 规则引擎 | Java 注解 + YAML |
| JSON Logic | 声明式规则 | JSON DSL |
| DMN（OMG 标准） | 决策模型与标记 | 决策表 + 决策需求图 |
| 决策表（Decision Table） | 经典模式 | 行=条件，列=动作 |

### 1.4 CMS / 内容路由类（参考架构）

| 产品 | 核心机制 |
|---|---|
| WordPress + Conditional Blocks | 用户属性条件渲染 |
| Drupal Rules | 事件-条件-动作（ECA）规则 |
| Contentful / Strapi | 标签 + 个性化 API |

### 1.5 题库 / 内容生产类（最贴近我们）

| 产品 | 核心机制 |
|---|---|
| Respondus | Excel/CSV 批量题目导入 |
| ExamSoft | CSV/Excel 题目导入 |
| Questionmark | Excel 题目模板 |
| SurveyMonkey / Qualtrics（高级） | CSV 高级导入 |

---

## 2. 两种核心模式详解

### 2.1 模式 A：可视化流程图（主流）

```
Q1 → Q2 → Q3 → Result
         ↓
         Q4 (if A)
```

- **代表**：Typeform、SurveyMonkey、Interact
- **优点**：直观，业务上手快
- **缺点**：复杂场景节点爆炸；"评分后选路径"难以表达

### 2.2 模式 B：决策表 / 矩阵

```
条件1 条件2 条件3 | 结果
T    *    *     | A
F    T    T     | B
*    *    F     | C
```

- **代表**：Drools Decision Table、DMN、Oracle ODM
- **优点**：批量规则一目了然；适合"按标签组合选结果"
- **缺点**：条件多了表宽大；不能直接表达"累加后比大小"

### 2.3 模式 C：每题/选项配条件（碎片化）

```
Q3 选项 A: if 用户选了 Q1.A，跳到 Q5
```

- **代表**：JotForm、Google Forms
- **优点**：最简单，线性流程友好
- **缺点**：跨题依赖散落各处；难维护

### 2.4 模式 D：标签 + 评分 + 路由（我们的方案）

```
每选项配 (标签, 分值)
每层: 累加 → 胜出标签 → 路由下一层
所有层标签 → 匹配结果页
```

- **代表**：Interact、ScoreApp、Octane AI、HubSpot、Marketo
- **优点**：抽象统一，扩展性好；不限制漏斗层数
- **缺点**：业务需理解"标签"概念；可视化编辑器要求高

---

## 3. 模式 B 与 模式 D 具体形态对比

> 用同一场景（2 层漏斗判断宠物清洁方案）展示两种模式

### 3.1 场景设定

**第 1 层（问题类型）**：用户最主要的问题是？
- A. 地板/地毯的宠物毛发 → 标签：pet_hair
- B. 家具上的灰尘 → 标签：dust
- C. 厨房/卫浴的顽固污渍 → 标签：grease

**第 2 层（严重程度 + 偏好）**：
- Q2.1 多久复发一次？→ heavy / light
- Q2.2 想自己处理还是找专业服务？→ wants_pro / wants_diy

**3 个结果页**：service_A / service_B / service_C

### 3.2 模式 B（决策表）形态

#### 层间路由表

| 顺序 | 条件：L1.标签 | 条件：L1.分值区间 | → 目标题组 |
|---|---|---|---|
| 1 | pet_hair | heavy | pet_heavy_group |
| 2 | pet_hair | light | pet_light_group |
| 3 | dust | heavy | dust_heavy_group |
| 4 | dust | light | dust_light_group |
| 5 | grease | * | grease_group |
| 6 | (默认) | * | fallback_group |

#### 结果页匹配表

| 顺序 | 条件：L1.标签 | 条件：L1.区间 | 条件：L2.标签 | → 结果页 |
|---|---|---|---|---|
| 1 | pet_hair | heavy | wants_pro | service_A |
| 2 | pet_hair | light | wants_pro | service_B |
| 3 | pet_hair | * | wants_diy | diy_pet_guide |
| 4 | dust | heavy | * | service_C |
| 5 | dust | light | * | diy_dust_guide |
| 6 | grease | * | wants_pro | service_D |
| 7 | (默认) | * | * | fallback_result |

**特点**：
- 声明式：业务只管"什么条件出什么结果"
- 顺序敏感：业务要手排
- "—"或"*"：表达"任何值"
- 优点：规则多了也直观；批量维护友好
- 缺点：条件列多了会变宽；不能直接表达"累加后比大小"

### 3.3 模式 D（标签 + 评分）形态

#### 步骤 1：定义标签 + 分桶

```
第 1 层标签：
  - pet_hair (优先级 1)
  - dust     (优先级 2)
  - grease   (优先级 3)

第 2 层标签：
  - heavy / light（互斥，依靠互斥选项绑定实现）
  - wants_pro / wants_diy

分值区间定义（以 pet_hair 为例）：
  - 0–3 分 → light
  - 4–10 分 → heavy
```

#### 步骤 2：选项 → 标签 + 分值

```
Q1.A (地板毛发)   → pet_hair += 3
Q1.B (家具灰尘)   → dust     += 3
Q1.C (顽固污渍)   → grease   += 3

Q2.1.A (<一周复发) → heavy += 2
Q2.1.B (≥一周复发) → light += 2

Q2.2.A (专业服务)  → wants_pro += 1
Q2.2.B (自己处理)  → wants_diy += 1
```

#### 步骤 3：用户答题 → 累加

```
用户选择：Q1.A + Q2.1.A + Q2.2.A
累加结果：
  - pet_hair = 3 (来自 Q1.A)
  - heavy    = 2 (来自 Q2.1.A)
  - wants_pro= 1 (来自 Q2.2.A)
  - 其他标签 = 0
```

#### 步骤 4：每层决出胜出标签

```
第 1 层胜出：pet_hair（分数 3）
  - 落入分桶：3 ∈ [0,3] = light

第 2 层胜出：heavy（分数 2）
第 2 层胜出：wants_pro（分数 1）
```

#### 步骤 5：路由 + 结果匹配

```
(第 1 层 pet_hair, light) → 查路由表第 2 行 → pet_light_group
(pet_hair, light, wants_pro) → 查结果表第 2 行 → service_B
```

**特点**：
- 过程式：累加 → 比较 → 分桶 → 查表
- 顺序无关：累加不依赖顺序
- 优点：自然表达"多题累积反映某一维度"
- 缺点：业务需要理解"标签/分值/分桶"概念

### 3.4 关键对比

| 维度 | 模式 B（决策表） | 模式 D（标签评分） |
|---|---|---|
| **表达层** | 规则级别（每行一条规则） | 选项级别（每选项一个分值贡献） |
| **业务配置什么** | 条件→动作的对应关系 | 选项的标签绑定和分值 |
| **计算过程** | 按行匹配首条命中 | 累加 → 比大小 → 分桶 |
| **规则数量爆炸** | 条件列多了会变宽 | 层数多了不爆，标签会多 |
| **业务理解成本** | 低（看表就行） | 中（要懂标签+分值+分桶） |
| **典型代表** | Drools / DMN / 业务规则引擎 | Interact / ScoreApp / Octane AI |

### 3.5 关键洞察：两者不是互斥，而是**组合使用**

```
模式 D 负责"产生标签和分数"（机制层）：
  - 选项→(标签, 分值)
  - 累加 → 胜出 → 分桶

模式 B 负责"用标签分数查表"（决策层）：
  - 层间路由表（决策表）
  - 结果页匹配表（决策表）
```

**我们的 v1.2 = 模式 D 的评分机制 + 模式 B 的决策表做路由/结果匹配**

---

## 4. 典型产品调研

### 4.1 模式 D 产品

#### 4.1.1 Interact（营销 Quiz 之王）

- **官网**：tryinteract.com
- **场景**：营销人员制作"性格测试 Quiz"，根据结果推送内容或邮件
- **逻辑**：
  ```
  每答案绑定 Outcome 标签 + 分值
    ↓
  答题完成 → 累加各 Outcome 总分
    ↓
  得分最高的 Outcome 对应的结果页展示
  ```
- **配置示例**：

| 题目 | 选项 | Outcome | 分值 |
|---|---|---|---|
| 工作风格？ | A. 计划型 | Planner | 3 |
| | B. 灵感型 | Creator | 3 |
| | C. 执行型 | Doer | 3 |
| 喜欢什么内容？ | A. 详细指南 | Planner | 2 |
| | B. 创意案例 | Creator | 2 |
| | C. 速查清单 | Doer | 2 |

- **特点**：可视化配置；一个选项可绑多个 Outcome；结果预设几种类型

#### 4.1.2 ScoreApp（评分式 Quiz）

- **官网**：scoreapp.com
- **场景**：B2B 营销，潜在客户打分分级，结果用于销售跟进
- **逻辑**：
  ```
  每答案有 outcome tags + weighted points
    ↓
  答题完成 → 计算总评分 + 决定 outcome tier
    ↓
  分值区间映射结果：
    0-30 = Cold, 31-60 = Warm, 61-80 = Hot, 81-100 = Very Hot
  ```
- **特点**：总分机制；分数即业务语义（潜在客户质量）；强联动 CRM

#### 4.1.3 Octane AI（电商产品推荐 Quiz）

- **官网**：octaneai.com（Shopify 头部 Quiz 应用）
- **场景**：Shopify 店铺里通过 Quiz 找到适合自己的护肤/服装/保健品
- **逻辑**：
  ```
  每答案给 product properties（产品属性）加分
    ↓
  累加各属性得分
    ↓
  得分最高的属性组合 = 用户画像
    ↓
  匹配产品库中标签/属性匹配度最高的商品
  ```
- **特点**：评分不是为了决出标签，而是填充用户画像；进一步用画像匹配商品库

#### 4.1.4 Outgrow（互动计算器）

- **官网**：outgrow.co
- **场景**：贷款计算器、ROI 计算器、保险报价 Quiz
- **逻辑**：
  ```
  每答案对应一个变量值
    ↓
  公式（业务配置）计算最终结果
    ↓
  结果落进业务定义的输出桶
  ```
- **特点**：公式驱动，不只累加；结果是数值不只标签；适合计算类

#### 4.1.5 Typeform（隐藏字段 + 评分变体）

- **官网**：typeform.com
- **场景**：原本是线性表单，但通过 Hidden Fields + 集成 Zapier/Make 可实现模式 D
- **逻辑**：
  ```
  每答案可 "recall" 一个变量值
    ↓
  Hidden Fields 保存用户画像
    ↓
  通过 webhook 推到外部系统计算
    ↓
  外部系统（如 Airtable + Make）根据计算结果展示不同结果页
  ```
- **特点**：原生是模式 C（Logic Jump）；模式 D 需要集成/Webhook 自建

### 4.2 模式 B 产品

#### 4.2.1 Drools（Red Hat 开源规则引擎）

- **官网**：drools.org
- **场景**：银行、保险、电信的风控 / 定价 / 路由决策
- **逻辑**：
  ```
  业务规则写为 Excel 决策表
    ↓
  Drools 编译决策表 → 内部 DRL 规则 → Rete 算法求值
    ↓
  首条命中规则触发动作
  ```
- **与我们的对照**：Routing sheet 和 Results sheet 几乎就是这种决策表
- **特点**：Excel 即配置；规则量大、需要热更新；技术门槛高

#### 4.2.2 Camunda（DMN 决策引擎）

- **官网**：camunda.com
- **场景**：银行贷款审批、保险理赔路由、电信订单编排
- **逻辑**：
  ```
  业务用 DMN（OMG 标准）建模决策：
    - 决策表（Decision Table）
    - 决策需求图（DRD）
    - 表达式语言（FEEL）
    ↓
  Camunda 引擎执行 DMN XML
    ↓
  输入数据 → 评估决策表 → 输出结果
  ```
- **DMN 决策表示例**：

| # | 客户等级 | 收入 | 信用分 | → 利率 |
|---|---|---|---|---|
| 1 | VIP | - | - | 3.5% |
| 2 | 标准 | >50000 | >700 | 4.5% |
| 3 | 标准 | >50000 | 600-700 | 5.5% |
| 4 | 标准 | <50000 | - | 7.0% |
| 5 | - | - | - | 拒绝 |

- **特点**：DMN 是 OMG 国际标准；银行/保险行业大量使用；我们 v1.3 可借鉴 DMN 的列设计

#### 4.2.3 Pega（业务流程 + 决策平台）

- **官网**：pega.com
- **场景**：保险承保、客服路由、欺诈检测、合规审查
- **逻辑**：
  ```
  When Rule（条件）：
    IF Customer.tier == "VIP" AND Order.amount > 10000
    THEN Route = "Agent A"
    AND Notify = "Manager"
    AND Priority = "High"
  ```
- **特点**：决策表 + 决策树 + 决策图多种表达；强企业流程集成

#### 4.2.4 FICO Blaze Advisor（信用决策）

- **官网**：fico.com
- **场景**：信用卡审批、欺诈检测、贷后管理
- **特点**：极端性能优化（单笔决策 < 50ms）；高频决策（日均百万级）；银行核心系统使用

#### 4.2.5 Oracle ODM / IBM ODM

- **共同特点**：企业级规则引擎；Excel 决策表为核心；银行、保险、电信行业使用

### 4.3 混合产品（D + B）

#### 4.3.1 HubSpot（CRM / 营销自动化）

- **机制（模式 D）**：
  ```
  Lead Scoring：
    访问定价页 +10, 下载白皮书 +20, 填写表单 +30
    ↓
  总分 → 分桶（Cold/Warm/Hot/MQL）
  ```
- **决策（模式 B）**：
  ```
  Workflow 触发规则：
    IF score > 80 AND industry = SaaS
    THEN assign to AE_Group_A + send email + notify manager
  ```
- **特点**：营销自动化的典型架构

#### 4.3.2 Marketo / ActiveCampaign

类似 HubSpot：Lead Score（模式 D）+ Smart Campaign（模式 B）

### 4.4 题库导入产品（最贴近我们场景）

| 产品 | 配置形态 |
|---|---|
| Respondus | Excel/CSV 批量导入题目 |
| ExamSoft | CSV/Excel 题目导入 |
| Questionmark | Excel 题目模板 |
| SurveyMonkey（高级） | CSV 题目导入 |
| Qualtrics（部分） | CSV 高级导入 |

**共同点**：题目量大，配置形态适合表格。

---

## 5. 配置形态选择：页面交互 vs 结构化数据

### 5.1 现象：绝大多数 Quiz 产品用页面交互

| 产品 | 配置方式 |
|---|---|
| Typeform | 拖拽式题目 + 流程图式 Logic Jump |
| Interact | 表格 + 表单混合的可视化编辑器 |
| ScoreApp | 引导式向导 |
| Octane AI | 流程图式问题编排 |
| Outgrow | 表单式公式编辑 |
| Quiz Kit | Shopify 后台嵌入式 UI |
| Riddle | 拖拽式题目 + 结果配置面板 |
| Involve.me | 模块化拖拽 |

**原因**：面向非技术营销人员，所见即所得。

### 5.2 页面交互在规模化场景下会崩

#### 失败场景 1：路由/结果规则变多

题目变成 10 道 + 4 层漏斗时，业务需要滚动页面看几十个跳转箭头，配置一次半小时起步。

#### 失败场景 2：跨层组合条件

条件散落在各题配置页里；改一个条件要去多个地方。

#### 失败场景 3：批量维护

要改 50 个 quiz 的同一文案：页面交互要点开 50 次；结构化数据可批量替换。

#### 失败场景 4：审计与版本管理

页面交互：看不清完整规则集；历史版本对比困难；回滚困难。
结构化数据：Excel/JSON 在 git 里可 diff；历史版本清晰。

### 5.3 适合页面交互 vs 适合结构化数据

| 特征 | 适合页面交互 | 适合结构化数据 |
|---|---|---|
| 规则数量 | < 20 条 | > 50 条 |
| 漏斗层数 | 1-2 层 | 3+ 层 |
| 业务用户 | 非技术、不愿看 Excel | 接受表格/数据形式 |
| 配置频率 | 低频（一年几次） | 中高频（业务迭代快） |
| 内容规模 | 少量 quiz | 内部多篇 quiz 模板 |
| 调试需求 | 所见即所得的预览 | 规则审计、批量更新、版本管理 |

### 5.4 用结构化数据（非页面交互）配置的代表

#### 规则引擎类

| 产品 | 配置形态 |
|---|---|
| Drools | Excel 决策表 |
| Camunda DMN | XML / JSON 决策表 |
| Pega | Excel + 决策树 UI |
| Oracle ODM | Excel 决策表 |
| IBM ODM | 决策表 + 规则编辑器 |
| FICO Blaze | 决策表 DSL |

**共同点**：规则量大、变化频繁、需要审计。

#### CMS / 内容模型类

| 产品 | 配置形态 |
|---|---|
| Strapi | JSON Schema |
| Contentful | JSON Schema |
| WordPress ACF | 表单 + JSON 导出 |
| Drupal Views | YAML 导出 |
| Sanity.io | Schema + 自定义 UI |

#### 工作流 / 自动化类

| 产品 | 配置形态 |
|---|---|
| HubSpot Workflows | 触发条件树（背后 JSON） |
| Marketo Smart Campaigns | 触发器 + 过滤器（背后 XML） |
| Camunda BPMN | BPMN XML 标准 |
| Temporal | 工作流代码定义 |
| Airflow | Python DAG 文件 |
| Salesforce Flows | 元数据 + XML |

#### 内部工具 / 自研类

| 场景 | 形态 |
|---|---|
| 公司内部 CMS | JSON / YAML / Excel 配置 |
| 营销运营 | Google Sheets + Apps Script |
| Airtable + Make/Zapier | 表格 + 工作流 |
| Notion 数据库 | 结构化表格 |
| Retool 内部门户 | 表单 + 表格 |

### 5.5 我们场景为什么适合结构化数据

| 我们的特征 | 对应 |
|---|---|
| 内部系统，业务对表格不陌生 | Excel 友好 |
| 多层漏斗 + 多标签 + 多路由规则 | 结构化清晰 |
| 业务批量维护多篇 Quiz | 批量操作 |
| 需要版本管理/审计 | 结构化易 diff |
| 不希望投入前端编辑器开发 | Excel 完全避免 |
| 规则变化频繁 | 改 Excel 比重写 if-else 容易 |

### 5.6 渐进式演进路径

```
v1 (现在)：Excel 导入 + 自研引擎              ← 我们当前方案
  ↓
v2 (中期)：Excel + 只读预览页                 ← 低成本增强
  业务上传 Excel 后，系统生成可视化预览，
  业务可核对再发布，不直接编辑
  ↓
v3 (长期)：Excel + 轻量编辑器                 ← 可视化但仍结构化
  编辑器输出仍是 Excel/JSON，
  保证配置的可审计、可版本化
```

**关键设计原则**：即使加了编辑器，**底层数据仍是结构化的**。这样既能给业务可视化体验，又不被页面交互的扩展性问题绑架。

### 5.7 反直觉的真相

> **绝大多数 Quiz 产品用页面交互，是因为它们面向"非技术营销人员"。**
> **但如果配置量级上来，规则引擎 / CMS / 题库导入这些"工程向"产品，主流都是结构化配置。**

这两类产品的形态差异，**不是技术选择，是用户群体差异**。

我们是**内部系统 + 业务能接受表格**，落在工程向这一侧。

---

## 6. 我们方案的市场定位

### 6.1 与各家产品对照

| 维度 | Interact / ScoreApp | Drools / Camunda | 我们的 v1.2 |
|---|---|---|---|
| 业务场景 | 营销 Quiz / 个性化结果 | 企业决策 / 业务流程 | 内容系统 Quiz 模板 |
| 配置方式 | 可视化编辑器 | Excel / DMN XML | **Excel** |
| 评分机制 | 标签 + 分值累加 | 通常不涉及 | **标签 + 分值累加（模式 D）** |
| 路由/匹配 | 嵌入式（简单） | 决策表（强） | **决策表（模式 B）** |
| 用户量级 | 千人级 | 百万级 | 内部系统 |
| 决策延迟 | 秒级 | 毫秒级 | 秒级即可 |

### 6.2 我们的方案 = Interact 业务模型 + Drools 决策表形态

- **业务侧体验**：和 Interact 一样，业务用"标签 + 分值"思考题目语义
- **配置形态**：和 Drools 一样，业务用 Excel 维护决策表
- **底层机制**：模式 D 评分 + 模式 B 决策表的混合（已经写在 v1.2）

### 6.3 选型路线

| 阶段 | 触发条件 | 方案 |
|---|---|---|
| 现在 | Quiz < 50 篇 | Excel + 自研引擎（v1.2 路线） |
| 扩展期 | Quiz 50-500 篇 | Excel + 引入 Drools Lite |
| 平台期 | Quiz > 500 或规则极复杂 | Camunda DMN + 自研 Quiz 前端 |
| 终极 | 业务要 GUI | Interact / ScoreApp 风格的自研编辑器 |

当前 v1.2 的方案 = 第一档，**对内部系统 + 当前 Quiz 数量最合适**。

---

## 7. v1.3 Excel schema 设计借鉴来源

| 借鉴来源 | 用在哪 |
|---|---|
| **题库导入工具**（Respondus / ExamSoft） | 题目 / 选项 sheet 的字段设计 |
| **决策表**（Drools / Camunda DMN） | 路由 / 结果 sheet 的列结构 |
| **JSON Schema** | 数据验证规则（必填、取值范围、跨表引用约束） |

---

## 8. 综合结论

1. **方案方向正确**：模式 D（标签 + 评分 + 路由）是动态 Quiz 的市场主流，Interact、ScoreApp、Octane AI 都用类似机制
2. **Excel 形态可行**：借鉴 Drools Decision Table / DMN / 题库导入工具，是行业成熟做法
3. **关键风险在配置体验**：Excel 模板设计 + 校验反馈是成败核心
4. **复用现有体系**：字段命名、sheet 风格、导入逻辑尽量沿用，降低业务学习成本
5. **避开反模式**：不在 Excel 里塞流程图、不让业务手写公式、不用中文 ID、题组必须独立成 sheet

---



## 9. 附录：产品速查表

### 9.1 模式图例

> 详细定义见 §2，下表只给出速记：

| 模式 | 含义 | 核心机制 | 一句话特征 |
|---|---|---|---|
| **A** | 可视化流程图 | 节点=题目，边=跳转条件 | "画流程图" |
| **B** | 决策表 / 矩阵 | 行=规则，列=条件/动作，"-"=不关心 | "用表格配规则" |
| **C** | 每题/选项配条件 | 散落在各题配置里 | "在题目里挂条件" |
| **D** | 标签 + 评分 + 路由 | 选项贡献 (标签, 分值) → 累加 → 查表 | "用分值做匹配" |
| **结构化** | 不属于 A/B/C/D 之一 | 用 JSON / Excel / CSV 等结构化数据表达配置 | "用数据文件配置" |

> 注：很多产品是多种模式的组合（如 "D + B" 表示既用标签评分又用决策表）。
> "结构化" ¹ 指产品不属于 A/B/C/D 典型一种，而是用结构化数据文件配置内容或规则（详见 §5）。

### 9.2 产品速查表

| 产品 | 类型 | 模式 | 配置形态 | 主要场景 |
|---|---|---|---|---|
| Typeform | 表单/Quiz | C + D（集成） | 页面交互 | 通用表单/营销 |
| SurveyMonkey | 调研 | B + C | 页面交互 | 调研问卷 |
| Qualtrics | 调研 | B | 页面交互 | 学术/企业调研 |
| Interact | Quiz | D | 页面交互 | 营销 Quiz |
| ScoreApp | Quiz | D | 页面交互 | 评分式营销 |
| Octane AI | Quiz | D | 页面交互 | 电商产品推荐 |
| Outgrow | Quiz/计算器 | D + 公式 | 页面交互 | 计算器/报价 |
| Riddle | Quiz | D | 页面交互 | 营销测验 |
| Quiz Kit | Quiz | D | 页面交互 | Shopify 集成 |
| Drools | 规则引擎 | B | **Excel 决策表** | 银行/保险/电信 |
| Camunda | BPM/DMN | B | **XML/JSON 决策表** | 流程自动化 |
| Pega | BPM | B + 树 | **Excel + UI** | 保险/银行 |
| Oracle ODM | 规则引擎 | B | **Excel 决策表** | 企业决策 |
| IBM ODM | 规则引擎 | B | **决策表 + UI** | 企业决策 |
| FICO Blaze | 规则引擎 | B | **决策表 DSL** | 信用决策 |
| Strapi | CMS | 结构化 ¹ | JSON Schema | 内容管理 |
| Contentful | CMS | 结构化 ¹ | JSON Schema | 内容管理 |
| HubSpot | CRM | D + B | UI（背后 JSON） | 营销自动化 |
| Marketo | CRM | D + B | UI（背后 XML） | 营销自动化 |
| Respondus | 题库 | 结构化 ¹ | **Excel/CSV** | 题库导入 |
| ExamSoft | 题库 | 结构化 ¹ | **CSV/Excel** | 题库导入 |
