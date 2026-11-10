# CNT Quiz

参考 [vibquiz.com](https://vibquiz.com/) 的视觉风格与页面结构，仿制的一款多语言趣味问答网站。
品牌：**CNT Quiz**；吉祥物：**Cortex**（珊瑚粉大脑 + 黑框眼镜 + 红领结的小男孩）。

纯静态站点，零构建、零依赖 —— 双击 `index.html` 或用内置静态服务器即可运行。

---

## 本地运行

```bash
node web/tools/serve.js 5173      # 然后打开 http://localhost:5173/
```

或者用任意静态服务器：

```bash
npx serve web
python -m http.server 5173 -d web
```

> 直接双击 `web/index.html` 用 `file://` 打开也能跑（所有资源都是相对路径），
> 但推荐用 HTTP 服务器，避免个别浏览器的本地文件限制。

---

## 目录结构

```
web/
├─ index.html            # 首页：Hero（今日测验）+ 分类测验卡片墙
├─ quiz.html             # 答题页：?id=<quiz-id>
├─ 404.html              # 404 页（quiz.html?id=不存在 也会回退到该页面）
└─ assets/
   ├─ css/style.css      # 全部样式（设计令牌 / 组件 / 特效 / 响应式）
   └─ js/
      ├─ i18n.js         # 中英文案字典 + 语言切换（localStorage: cnt_lang）
      ├─ art.js          # 全部 SVG 素材：吉祥物、logo、缩略图、图标
      ├─ data.js         # 36 套题库（36 quizzes / 10 分类）+ 题目、选项、解析
      ├─ common.js       # 页头/页脚/分类条/搜索浮层/主题切换/音效/富文本
      ├─ effects.js      # ★ 答对/答错互动特效（奖杯、炸弹爆炸、彩带）
      ├─ home.js         # 首页渲染
      ├─ quiz.js         # 答题页状态机 + 判分 + 特效调度
      └─ notfound.js     # 404 页渲染
tools/serve.js           # 极简静态服务器（开发用）
```

---

## 页面结构（对照参考站还原）

| 区域 | 还原细节 |
| --- | --- |
| 顶部导航 | 深海军蓝 `#0c2a3d`；左侧 = 吉祥物 + 红色堆叠字标（红填充 + 白描边）；右侧 = 圆角描边面板（红色细边框），上排 `English ▾` + 太阳/月亮 + 放大镜，下排邮箱输入 + 红色 `Subscribe!` |
| 分类条 | 整条红色 `#c0392b`，白色粗体分类链接 + `More ▾`；窄屏可横向滚动 |
| Hero | 奶油黄 `#f7dfae` 圆角面板 + 放射太阳线；左侧白卡片（深色描边 + 投影）= 红色绶带 `★ TODAY'S QUIZ ★` + 粗黑标题 + 圆形单选 + 红色 `PLAY`；右侧吉祥物（举食指、红色问号、小星星）+ 白黑边气泡 `THINK YOU GOT WHAT IT TAKES?` + 黑色锯齿 `PROVE IT!` |
| 答题页 | sticky 工具条 = 红色 `↻ RESTART` 胶囊 + **白色**进度条（走动小角色 + 居中百分比）+ 小吉祥物 + 红色圆形静音/音乐按钮；下方 2:1 大图（radius ≈ 20px）→ 白色粗体问题 → 选项；页面底深海军蓝 |
| 结果页 | 大号得分、评价标题/描述、彩带庆祝、4 个操作按钮 |
| 404 | 巨大白色 `404` + 上方红色小 `404` + 标题 + 描述 + 按钮 + 分类快捷入口 |

---

## 互动特效系统（`assets/js/effects.js`）

全局对象 `CNTEffects`，全部特效通过 DOM 叠加层 + Canvas 粒子实现，
`pointer-events: none`，**不拦截任何点击**；并遵循 `prefers-reduced-motion`。

| API | 效果 |
| --- | --- |
| `CNTEffects.correct(origin)` | **答对**：金色奖杯从选项位置弹出（弹性缩放 + 旋转光芒 rays）+ 彩带雨 + 星星迸射 + 红色绶带横幅「答对啦！/ 就是这个！」 |
| `CNTEffects.wrong(origin)` | **答错**：炸弹从顶部坠落（加速下坠 + 摆动 + 引线火花）→ 爆炸（白色闪光 + 3 圈冲击波 + 碎片/火花 + 烟雾）+ 页面震屏 + 深色横幅「轰！/ 不是这个哦」 |
| `CNTEffects.pick(origin)` | 漏斗题（不判对错）：中性 ★ 飘字 + 星爆 |
| `CNTEffects.celebrate(level)` | 结果页彩带庆祝（`high` / `low`） |
| `CNTEffects.clear()` | 重开 Quiz / Play Again 时清场 |

### 实现要点

- 特效层挂在 `<html>` 下（`document.documentElement`），**不是 `body`**。
  原因：爆炸时会给 `body` 加 `fx-shake` 震屏动画，而 `body` 一旦带 `transform`
  就会成为 `position: fixed` 子元素的包含块，导致 `.fx-layer` 的定位整体错位、
  横幅被推到屏幕外。挂到 `<html>` 上即可彻底规避。
- 粒子层 `<canvas class="fx-canvas">` 与 DOM 层 `<div id="fxLayer">` 分工：
  彩带 / 火花 / 碎片走 Canvas，奖杯 / 炸弹 / 横幅 / 冲击波走 DOM（便于用 CSS 动画控制）。
- 答对 / 答错的**原点**取自被点击按钮的 `getBoundingClientRect()`，
  所以奖杯会从玩家点的那个选项上冒出来。

---

## 题库

- 36 套测验，10 个分类：趣味常识 / 历史长河 / 科学探索 / 地理世界 / 体育竞技 / 影视巨幕 / 音乐现场 / 脑筋急转弯 / 智能实验室。
- 每套题 4–5 题，含正确答案与解析；`learning-style-funnel` 为 **funnel 题型**（多步选择，得出学习风格画像，不判对错）。
- 题面文案为中英双语数组 `[en, zh]`，由 `I18N.pick()` 按当前语言取值。
- `*斜体*` 标记会被 `CNT.rich()` 渲染成 `<em>`（作品名等），仅对字符串生效。

---

## 其他功能

- **双语**：中 / English，右上角下拉切换，记忆在 `localStorage`。
- **主题**：深色 / 浅色切换（`localStorage: cnt_theme`），跟随 `<html data-theme>`。
- **搜索**：右上角放大镜或快捷键 `/`、`Ctrl/⌘ + K` 打开浮层，实时匹配标题/描述/分类。
- **音效**：答题正确/错误/点击均有 WebAudio 合成音效（右上角可静音）。
- **响应式**：≥1360px 四列卡片，1023px 以下 Hero 纵向堆叠，640px 以下选项单列、特效横幅改为底部 toast。
- **无障碍**：`aria-label` / `aria-expanded` / 键盘可达；特效层对屏幕阅读器隐藏。

---

## 修改指引

| 想改什么 | 改哪里 |
| --- | --- |
| 增删题目 | `assets/js/data.js` 中对应 quiz 对象的 `questions` 数组 |
| 改文案 | `assets/js/i18n.js` 的 `DICT`（界面）/ `data.js`（题面） |
| 改配色 / 圆角 / 字号 | `assets/css/style.css` 顶部的 `:root` 设计令牌 |
| 改吉祥物 / logo / 缩略图 | `assets/js/art.js` |
| 调整特效力度 | `assets/js/effects.js`（粒子数量、速度）+ `style.css` 里的 `.fx-*` 动画 |