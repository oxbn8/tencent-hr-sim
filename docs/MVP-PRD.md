# 腾讯 AI 赋能 HR 模拟场 · MVP 产品需求文档

| 字段 | 内容 |
|------|------|
| 文档版本 | **MVP v1.0** |
| 更新日期 | 2026-06-13 |
| 产品代号 | Tencent HR Sim |
| 上级文档 | [PRD v0.1](./PRD.md) |
| MVP 范围 | **沟通型 HR + 创意型 HR**；职级起点 **培训生**；平台内 **AI Chat AIGC**；**海报 + 提示词双维评分** |

---

## 0. MVP 决策锁定（已确认）

| # | 决策项 | 结论 |
|---|--------|------|
| D1 | 角色范围 | 仅 **沟通型**、**创意型** |
| D2 | 海报类 Task | 平台内置 **AI Chat**，对话式 AIGC 出图，不跳转外部工具 |
| D3 | 评分维度 | **成稿质量** + **提示词质量** 分开打分并分别给改进建议 |
| D4 | 职级起点 | 可选 **培训生**（MVP 默认推荐）；存档记录起点职级 |
| D5 | 玩法长度 | 每角色 **7 游戏日** 主线 |
| D6 | 玩家模式 | **单人**，本地存档 |
| D7 | 分析型/技术型 | **不在 MVP**，入口灰置「即将开放」 |

---

## 1. MVP 产品概述

### 1.1 一句话

玩家在腾讯 S3 HR 线身份下，选择事业群与产品小组，以 **培训生** 职级入职，在 **沟通型** 或 **创意型** HR 路径上完成 7 天闯关；创意型海报任务通过平台 **AI Chat** 完成 AIGC 出图，系统对 **最终海报** 与 **提示词过程** 分别评分，帮助用户建立「人机协作 + Prompt 工程」能力。

### 1.2 MVP 要验证的核心假设

| 假设 | 验证方式 |
|------|----------|
| 「选 BG + 选角色 + 按天闯关」有完整可玩性 | Day1–7 完播率、平均停留时长 |
| 平台内 AI Chat 足以支撑 AIGC 海报任务 | 创意型 Day3 提交率、Chat 轮次分布 |
| **提示词评分**能提升用户 Prompt 质量 | 同一用户多轮 Task 的 prompt_score 趋势 |
| 沟通型「AI 辅助话术 + 人工改写」有教学价值 | 沟通 Task 重试率、feedback 满意度（v0.2 问卷） |

### 1.3 MVP 成功标准（上线 2 周内）

| 指标 | 目标 |
|------|------|
| 注册/启动 → 完成角色选择 | ≥ 80% |
| 完成 Day1 挑战 | ≥ 65% |
| 完成 Day3（含海报 AIGC） | ≥ 45% |
| 完成 7 日主线（任一角） | ≥ 25% |
| AI Chat 调用成功率 | ≥ 95% |
| 单次评分 API 延迟 P95 | ≤ 8s |

### 1.4 MVP 明确不做

- 分析型、技术型 playable 内容
- 账号登录、多人、排行榜
- 真实对接 TCamp 成绩回传（可留外链入口）
- 视频/音频 AIGC（仅 **文本 + 图像**）
- 移动端独立 App（响应式 Web 即可）

---

## 2. 用户与场景

### 2.1 目标用户（MVP 优先级）

1. **TCamp / 课程实训学员**（首要）— 完成指定天数打卡  
2. **考虑投递 AI-HR 培训生的校招候选人**  
3. **HR 新人** — 了解 AI 在沟通/雇主品牌中的用法  

### 2.2 核心用户故事

| ID | 作为… | 我想要… | 以便… |
|----|--------|---------|--------|
| US-01 | 培训生 | 选择 WXG+微信支付+创意型 | 体验与我意向岗位贴近的场景 |
| US-02 | 创意型培训生 | 在平台 AI Chat 里写 Prompt 生成校招海报 | 不用切换工具，且学会写更好的提示词 |
| US-03 | 创意型培训生 | 看到海报分和提示词分及各自点评 | 知道下次 Prompt 该怎么改 |
| US-04 | 沟通型培训生 | 用 AI 生成沟通草稿再手动修改提交 | 模拟真实 HR 人机协作 |
| US-05 | 培训生 | 本地保存进度，下次继续 Day4 | 分多次完成 7 日主线 |
| US-06 | 培训生 | Day7 获得成长报告 | 复盘本周能力变化 |

---

## 3. 组织与角色（MVP 配置）

### 3.1 组织选择（三级）

```
Step 1: 事业群（6 选 1）
Step 2: 产品小组（该 BG 下 2–3 选 1）
Step 3: 职级起点（MVP 仅开放「培训生」可选；「实习生」显示 coming soon）
```

**职级说明（MVP）**

| 职级 | 是否可选 | 初始权益 |
|------|----------|----------|
| **培训生** | ✅ 默认 | 导师提示 3 次/天；装备栏 2 格；EXP 基准 ×1.0 |
| 实习生 | 🔒 灰置 | v0.2 开放（更高难度、更少提示） |

培训生起点叙事：「你已通过 HR Star 选拔，以培训生身份派驻 {BG}·{小组}，由导师 {NPC 名} 带你完成第一周实战。」

### 3.2 事业群 × 产品小组（完整 MVP 表）

| BG | ID | 产品小组 |
|----|-----|----------|
| WXG | `wxg` | 微信基础 `wxg-core`、微信支付 `wxg-pay`、企业微信 `wxg-wework` |
| PCG | `pcg` | 腾讯视频 `pcg-video`、QQ `pcg-qq`、腾讯新闻 `pcg-news` |
| IEG | `ieg` | 王者荣耀 `ieg-honor`、和平精英 `ieg-peace`、腾讯电竞 `ieg-esports` |
| TEG | `teg` | 基础架构 `teg-infra`、安全 `teg-sec`、AI 平台 `teg-ai` |
| CSIG | `csig` | 腾讯云 `csig-cloud`、智慧产业 `csig-industry` |
| CDG | `cdg` | 腾讯广告 `cdg-ads`、理财通 `cdg-licaitong` |

Task Brief 中的 `{bg_name}`、`{team_name}` 由玩家选择动态替换。

### 3.3 MVP 角色（2 选 1）

| 角色 ID | 名称 | 入口状态 | 7 日主线数 |
|---------|------|----------|------------|
| `creative` | 创意型 HR | 可玩 | 7 |
| `comm` | 沟通型 HR | 可玩 | 7 |
| `analyst` | 分析型 HR | 灰置 | — |
| `tech` | 技术型 HR | 灰置 | — |

---

## 4. 信息架构与页面规格

### 4.1 站点地图

```
/                     启动页
/onboarding/org       组织选择（BG → 小组 → 职级）
/onboarding/role      角色选择（2 可玩 + 2 灰置）
/onboarding/guide     角色通关指南 & 装备说明
/game                 主控制台（日历、邮件、状态）
/game/challenge/:id   挑战页（Task 主战场）
/game/result/:id      结果页（分数、点评）
/game/report          Day7 成长报告
```

### 4.2 页面详细规格

#### P0 启动页 `/`

| 元素 | 规格 |
|------|------|
| 主按钮 | 「开始实训」→ 无存档进 onboarding；有存档进 `/game` |
| 次按钮 | 「继续进度」— 读取 localStorage `hr_sim_save_v1` |
| 免责声明 | 「本产品为模拟实训，非腾讯官方招聘/培训系统」 |

#### P1 组织选择 `/onboarding/org`

**Step A — 事业群**

- 6 张卡片：简称 + 中文名 + 一句话描述  
- 选中高亮腾讯蓝 `#006EFF`

**Step B — 产品小组**

- 根据 BG 过滤，2–3 张卡片  
- 显示「你将支持的 HRBP 服务对象」

**Step C — 职级**

- **培训生**：可选，标记「推荐」  
- **实习生**：灰置 + 「即将开放」

确认后写入 `save.org`。

#### P2 角色选择 `/onboarding/role`

- 4 张角色卡；分析/技术不可点，hover 显示「MVP 后续开放」  
- 沟通型 / 创意型可点 → 展开 slogan、业务方向、需求热度标签  
- 「查看通关指南」→ P3

#### P3 通关指南 `/onboarding/guide`

| 区块 | 创意型 | 沟通型 |
|------|--------|--------|
| 能力模型 | 审美、内容力、AIGC | 人际感知、沟通协作、逻辑、AI 学习 |
| 7 日预览 | Day1–7 标题列表（无剧透答案） | 同左 |
| 必备装备 | 绘图台、写作台、品牌包… | 倾听徽章、话术助手、纪要模板… |
| 视频入口 | 外链 TCamp 6333 对应视频（新窗口） | 同左 |
| 确认 | 「以培训生身份入职」→ 初始化 save，跳转 `/game` | 同左 |

#### P4 主控制台 `/game`

```
┌─────────────────────────────────────────────────────┐
│  顶栏：{BG}·{小组} | 创意型/沟通型 培训生 | Day 3/7   │
├──────────────┬──────────────────────────────────────┤
│  左侧日历     │  中部：今日 Brief（邮件样式）          │
│  Day1 ✓      │  「来自：PCG 雇主品牌组」              │
│  Day2 ✓      │  任务标题 + 要求 + 限时               │
│  Day3 ●      │  [开始挑战]                           │
│  Day4 🔒     │                                       │
├──────────────┤  右侧：装备栏 | EXP | 提示次数(3)     │
└──────────────┴──────────────────────────────────────┘
```

- 仅当前 Day 可挑战；未完成 Day N 则 Day N+1 锁定  
- 「提示」消耗 1 次，调用导师 NPC 短提示（不泄露满分答案）

#### P5 挑战页 `/game/challenge/:taskId`（核心）

**布局（创意型 · 含 AIGC 海报 Task）**

```
┌────────────────────────────────────────────────────────────┐
│ Brief 区（只读）          │ 倒计时 12:00                    │
├───────────────────────────┴────────────────────────────────┤
│  提交区                                                        │
│  ┌─ 成稿提交 ─────────────────────────────────────────────┐  │
│  │ 主标题 [____]  副标题 [____]                            │  │
│  │ 选用海报：[Chat 生成 #2 ▼]  或上传图片                    │  │
│  └────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│  AI Chat 面板（AIGC 工作区）                    [展开/收起]   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 系统：你是雇主品牌设计助手…（Task 上下文自动注入）         │  │
│  │ 用户：请生成一张…（Prompt 输入）                          │  │
│  │ 助手：[生成中…] → 图片 + 修订建议                         │  │
│  │ [Prompt 输入框]                        [发送] [重新生成]  │  │
│  └────────────────────────────────────────────────────────┘  │
│  Chat 历史将用于「提示词评分」— 侧栏显示 Prompt 技巧 checklist │
├──────────────────────────────────────────────────────────────┤
│            [保存草稿]              [提交挑战]                  │
└──────────────────────────────────────────────────────────────┘
```

**布局（沟通型 · 无出图）**

```
┌────────────────────────────────────────────────────────────┐
│ Brief：业务方邮件 / IM 线程（只读）                           │
├────────────────────────────────────────────────────────────┤
│ AI Chat：话术助手模式                                         │
│  - 用户可请求「生成 3 版回复草稿」                             │
│  - 草稿一键插入「我的回复」编辑区                               │
├────────────────────────────────────────────────────────────┤
│ 我的回复（必填，富文本/Markdown）                             │
│  字数统计 | 需体现「人工修改」：与 AI 草稿 diff 高亮（可选）    │
├────────────────────────────────────────────────────────────┤
│            [保存草稿]              [提交挑战]                  │
└────────────────────────────────────────────────────────────┘
```

#### P6 结果页 `/game/result/:submissionId`

**创意型（含海报 Task）— 双维评分 UI**

```
┌─────────────────────────────────────────┐
│  综合得分 78 / 100        ★ 通关        │
├─────────────────┬───────────────────────┤
│  🖼 成稿得分     │  ✍️ 提示词得分         │
│     72 / 100    │     84 / 100          │
│  [雷达：品牌/    │  [雷达：结构/          │
│   创意/合规/     │   具体/风格/           │
│   完整]         │   约束/迭代]           │
├─────────────────┴───────────────────────┤
│  成稿点评（3–5 条 bullet）                 │
│  提示词点评（3–5 条 bullet + 改写示例）     │
│  「推荐改进 Prompt」：[折叠展示 gold prompt] │
├─────────────────────────────────────────┤
│  [查看 Chat 记录]  [重试-降权]  [下一天 →] │
└─────────────────────────────────────────┘
```

- 通关线：**综合分 ≥ 60**  
- 优秀线：综合分 ≥ 85  

#### P7 成长报告 `/game/report`（Day7 完成后）

- 7 日得分折线（成稿分 / 提示词分分开展示）  
- 能力雷达（角色维度）  
- 最佳 Prompt 片段 & 最需改进维度  
- 「推荐学习」：TCamp 6333 链接  

---

## 5. Task 系统设计

### 5.1 Task 分类（MVP）

| 类型 ID | 名称 | 角色 | 是否用 AI Chat | 是否双维评分 |
|---------|------|------|----------------|--------------|
| `aigc_poster` | AIGC 海报 | 创意 | ✅ 出图 | ✅ 成稿 + Prompt |
| `aigc_copy` | AIGC 文案 | 创意 | ✅ 写作 | ✅ 成稿 + Prompt |
| `copywriting` | 纯文案 | 创意 | 可选 | ❌ 仅成稿（v1 可先单维） |
| `comm_reply` | 沟通回复 | 沟通 | ✅ 话术 | ❌ 成稿 + 「人工度」加分 |
| `comm_dialogue` | 多轮对话 | 沟通 | ✅ | ❌ 过程 + 成稿 |

**MVP 双维评分强制覆盖的 Task**：所有 `aigc_poster`、`aigc_copy`（创意型至少 **3 个** Task 走双维）。

### 5.2 创意型 7 日主线（定稿）

| Day | Task ID | 类型 | 标题 | 限时 | 双维评分 |
|-----|---------|------|------|------|----------|
| 1 | `cr_d1_slogan` | `aigc_copy` | 为 `{team}` 电竞/校招写 Slogan | 8 min | ✅ |
| 2 | `cr_d2_9grid` | `copywriting` | 雇主品牌推文 9 图文案 | 10 min | ❌ |
| 3 | `cr_d3_poster` | `aigc_poster` | **{team} 校招空宣主视觉海报** | 12 min | ✅ |
| 4 | `cr_d4_video_script` | `aigc_copy` | Open Day 30s 视频脚本 | 12 min | ✅ |
| 5 | `cr_d5_longimg` | `copywriting` | 技术岗雇主品牌长图结构 | 10 min | ❌ |
| 6 | `cr_d6_campaign` | `aigc_poster` | 多 BG 联合校招 Campaign 主 KV | 15 min | ✅ |
| 7 | `cr_d7_ab_test` | `aigc_poster` | 主视觉 A/B 两版 + 选择理由 | 15 min | ✅ |

#### Day3 完整 Brief 模板（示例）

> **发件人**：PCG 雇主品牌组（若玩家选 PCG·腾讯视频则自动替换）  
> **主题**：【紧急】2026 校招空宣主视觉需求  
>
> 培训生你好，  
> 我们将在下周举办 **{team_name} 2026 校园招聘空中宣讲会**，需要你产出 1 张主视觉海报。  
>
> **要求**  
> - 体现「年轻、多元、AI 赋能」  
> - 主标题需包含「2026 校招」语义  
> - 符合腾讯雇主品牌基调，避免未授权 IP、夸大宣传  
> - 尺寸概念：1080×1920 竖版（模拟）  
>
> **提交**  
> 1. 主标题、副标题  
> 2. 选用一张 Chat 生成的海报（或上传）  
> 3. Chat 中的 Prompt 将一并纳入评分  
>
> **限时**：12 分钟

### 5.3 沟通型 7 日主线（定稿）

| Day | Task ID | 类型 | 标题 | 限时 |
|-----|---------|------|------|------|
| 1 | `cm_d1_urgent_hc` | `comm_reply` | 业务方催招：澄清 HC 与 timeline | 10 min |
| 2 | `cm_d2_offer` | `comm_reply` | 候选人拒 Offer：挽回邮件 | 10 min |
| 3 | `cm_d3_er_case` | `comm_dialogue` | 员工工时争议：首次沟通 | 12 min |
| 4 | `cm_d4_training` | `comm_reply` | 培训需求访谈：纪要 + 回复 | 12 min |
| 5 | `cm_d5_hrbp` | `comm_reply` | HRBP 周会：本周 priority 邮件 | 10 min |
| 6 | `cm_d6_conflict` | `comm_dialogue` | 跨部门冲突调解 | 15 min |
| 7 | `cm_d7_exec_sum` | `comm_reply` | 向 COE 汇报：Executive Summary | 15 min |

沟通型 **Prompt 评分不适用**；改为 **「人工改写度」** 子分（见 §6.3）。

### 5.4 Task 配置 Schema

```typescript
interface TaskConfig {
  id: string;
  role: "creative" | "comm";
  day: number;
  type: "aigc_poster" | "aigc_copy" | "copywriting" | "comm_reply" | "comm_dialogue";
  title: string;
  brief_template: string;          // 含 {bg_name} {team_name} {player_name}
  time_limit_seconds: number;
  submit_schema: SubmitField[];
  scoring: ScoringConfig;
  chat: ChatConfig;
  hints: string[];                 // 导师提示池
  equipment_recommended: string[];
}

interface SubmitField {
  key: string;
  label: string;
  type: "text" | "textarea" | "image_pick" | "image_upload" | "markdown";
  required: boolean;
}

interface ScoringConfig {
  mode: "dual" | "single" | "comm";
  pass_score: number;                // default 60
  weights: {
    deliverable: number;             // 成稿权重，dual 默认 0.55
    prompt: number;                  // 提示词权重，dual 默认 0.45
  };
  rubric_deliverable: RubricDimension[];
  rubric_prompt: RubricDimension[]; // 仅 dual
}

interface RubricDimension {
  id: string;
  name: string;
  weight: number;                    // 维度内权重，合计 100
  description: string;
}

interface ChatConfig {
  enabled: boolean;
  mode: "image_gen" | "text_gen" | "dialogue_sim";
  system_prompt_template: string;
  max_turns: number;                 // 默认 20
  max_images: number;                // poster 默认 5
  inject_task_context: boolean;
  prompt_tips_checklist: string[];   // 侧栏展示
}
```

---

## 6. 评分系统（MVP 核心）

### 6.1 创意型双维评分总公式

```
综合分 = 成稿分 × Wd + 提示词分 × Wp

默认 Wd = 0.55，Wp = 0.45（可在 Task 级配置）
通关：综合分 ≥ 60
```

### 6.2 成稿评分（Deliverable Score）

**适用**：海报、文案、脚本等最终提交物。

| 维度 ID | 名称 | 权重 | 说明 |
|---------|------|------|------|
| `brand_fit` | 品牌契合 | 25 | 腾讯蓝基调、年轻化、符合 BG 调性 |
| `brief_compliance` | Brief 合规 | 25 | 满足 Task 硬性要求（关键词、尺寸语义、禁词） |
| `creativity` | 创意表达 | 20 | 差异化、记忆点，非模板感 |
| `completeness` | 完整性 | 15 | 必填字段齐全、信息层次清晰 |
| `professionalism` | 专业度 | 15 | 排版/语言质量、无错别字、无歧视表述 |

**实现**：规则分（40%）+ LLM 辅评（60%）

| 规则项 | 示例 |
|--------|------|
| 必填项 | 主标题非空 +2 |
| 禁词 | 「保证录取」「第一」等 -10 |
| 品牌色提及 | Prompt 或标题含合理元素 +0（辅评为主） |
| 超时提交 | 成稿分 ×0.85 |

### 6.3 提示词评分（Prompt Score）— MVP 差异化能力

**数据来源**

```typescript
interface PromptEvaluationInput {
  chat_messages: ChatMessage[];      // 仅 user + assistant 中与生成相关的轮次
  final_image_message_id?: string; // 用户选作提交的那张图对应轮次
  task_brief: string;
  submit_titles: { main: string; sub: string };
}
```

**评估维度**

| 维度 ID | 名称 | 权重 | 评分逻辑要点 |
|---------|------|------|--------------|
| `structure` | 结构清晰 | 20 | 是否有主体/风格/构图/文案分区描述 |
| `specificity` | 具体明确 | 25 | 避免「好看的海报」；含尺寸、色调、元素 |
| `constraints` | 约束完整 | 20 | 体现 Brief 硬约束（校招、2026、禁 IP） |
| `style_language` | 风格语言 | 15 | 会用风格词：flat/3D/极简/赛博等 |
| `iteration` | 迭代优化 | 20 | 多轮 Prompt 是否基于上一轮反馈改进 |

**迭代分计算（规则辅助）**

```
iteration_raw = min(20, (meaningful_refinement_turns - 1) × 7)
```

- 「有意义迭代」：第 N 轮 user Prompt 与 N-1 轮相比编辑距离 > 阈值，且非纯「再生成」  

**LLM 输出格式（结构化 JSON）**

```json
{
  "prompt_score": 84,
  "prompt_dimensions": {
    "structure": 18,
    "specificity": 22,
    "constraints": 16,
    "style_language": 12,
    "iteration": 16
  },
  "prompt_feedback": [
    "你在第 2 轮补充了「1080×1920 竖版」，具体性提升明显。",
    "未明确禁止未授权 IP，建议在 Prompt 中加 negative prompt。",
    "第 3 轮仅写「再生成一次」，未构成有效迭代。"
  ],
  "suggested_prompt_rewrite": "一张 1080x1920 竖版校招海报，腾讯蓝(#006EFF)为主色…"
}
```

**成稿评分的 LLM 输出**（同理，独立调用）

```json
{
  "deliverable_score": 72,
  "deliverable_dimensions": { "...": 0 },
  "deliverable_feedback": ["...", "..."]
}
```

### 6.4 沟通型评分（无 Prompt 维）

```
综合分 = 沟通成稿分 × 0.70 + 人工改写度 × 0.20 + 过程分 × 0.10
```

| 子分 | 说明 |
|------|------|
| **沟通成稿分** | 同理 LLM + 规则：语气、结构、目标达成、合规 |
| **人工改写度** | 用户最终文本 vs AI 最后草稿：编辑距离/变更率；变更率 <5% 扣分（照搬 AI） |
| **过程分** | 是否阅读 Brief、是否使用 Chat、限时内提交 |

### 6.5 重试规则

| 次数 | 规则 |
|------|------|
| 第 1 次提交 | 正常计分 |
| 同 Day 第 2 次 | 综合分 ×0.9，Chat 历史保留 |
| 第 3 次+ | 不允许（或仅练习模式，不计进度） |

---

## 7. AI Chat 模块规格

### 7.1 能力边界（MVP）

| 模式 | ChatConfig.mode | 能力 |
|------|-----------------|------|
| 海报生成 | `image_gen` | 文本 Prompt → 生成图片（1–4 张/轮）；支持「基于上一张修订」 |
| 文案生成 | `text_gen` | Slogan、脚本、9 宫格 copy |
| 对话模拟 | `dialogue_sim` | 扮演业务方/员工，沟通型 Day3/6 多轮 |

### 7.2 系统 Prompt 注入（image_gen 示例）

```
你是腾讯雇主品牌实训助手，帮助培训生完成「{task_title}」任务。

【任务 Brief】
{brief_rendered}

【品牌约束】
- 主色建议 #006EFF（腾讯蓝），可搭配白/浅灰
- 禁止：未授权 IP、夸大承诺、歧视性表述
- 调性：年轻、专业、科技向善

【你的行为】
1. 根据用户 Prompt 生成海报描述并调用出图
2. 若 Prompt 模糊，先问 1 个澄清问题（可选）
3. 出图后给出 1 条 Prompt 优化建议（不直接替写整段）

当前事业群：{bg_name}，业务小组：{team_name}
```

### 7.3 Chat UI 交互

| 功能 | 规格 |
|------|------|
| 消息流 | user / assistant / system；assistant 含 text + image_url |
| 选为成稿 | 每张图有「选为提交海报」按钮；仅 1 张 active |
| 重新生成 | 沿用当前 Prompt 或允许编辑后 regenerate |
| Prompt 侧栏 | 展示 `prompt_tips_checklist`（Task 配置） |
| 历史持久化 | 存入 `submission.draft.chat_log` |
| 出图失败 | Toast + 重试；不计入 user 轮次 |

### 7.4 后端 API（Chat）

```
POST /api/chat/session
  body: { task_id, save_id }
  resp: { session_id, system_message }

POST /api/chat/message
  body: { session_id, content, regenerate_image_id? }
  resp: { messages[], images[], usage }

POST /api/chat/select-image
  body: { session_id, message_id, image_index }
  resp: { selected_image_url }
```

**图像生成实现选项（MVP 推荐）**

| 方案 | 说明 |
|------|------|
| A（推荐） | OpenAI 兼容 `images/generations` 或腾讯混元文生图 API |
| B（降级） | 无 API Key 时：返回「高保真占位图」+ 强调 Prompt 评分；开发环境可配置 |

### 7.5 Prompt 技巧 Checklist（Day3 海报侧栏）

- [ ] 是否写明用途（校招空宣海报）  
- [ ] 是否写明版式（竖版 9:16）  
- [ ] 是否指定主色/风格  
- [ ] 是否列出必含文字（2026 校招）  
- [ ] 是否写出禁止项（无未授权 IP）  
- [ ] 是否在第 2+ 轮针对上一轮问题做了修改  

---

## 8. 装备与成长（MVP 简化）

### 8.1 培训生初始装备

**创意型**

| 装备 ID | 名称 | 效果 |
|---------|------|------|
| `eq_aigc_draw` | AIGC 绘图台 | 开启 Chat image_gen |
| `eq_aigc_write` | AIGC 写作台 | 开启 Chat text_gen |

**沟通型**

| 装备 ID | 名称 | 效果 |
|---------|------|------|
| `eq_listener` | 倾听者徽章 | 冲突 Task 显示情绪标签 |
| `eq_script_helper` | AI 话术助手 | 开启 Chat text_gen（3 版草稿） |

### 8.2 解锁（MVP）

| 条件 | 解锁 |
|------|------|
| Day2 通关 | `eq_brand_kit`（创意）/ `eq_meeting_tpl`（沟通） |
| Day5 通关 | 提示次数 +1/天（临时 buff） |
| Day7 通关 | 成长报告 + 职级显示「培训生·结业」徽章（无实际 L2） |

MVP **不做**复杂 EXP 升级链，仅记录 `days_cleared` 与 `badges`。

---

## 9. 数据与存档

### 9.1 localStorage Schema `hr_sim_save_v1`

```typescript
interface SaveGameV1 {
  version: 1;
  player_name: string;
  org: {
    bg_id: string;
    team_id: string;
    level_start: "trainee";        // MVP 固定枚举
  };
  role: "creative" | "comm";
  progress: {
    current_day: number;             // 1-7, 当前可进行的天
    cleared_days: number[];          // [1,2,3]
    task_attempts: Record<string, number>;
  };
  resources: {
    hints_left_today: number;
    last_play_date: string;          // YYYY-MM-DD，跨日重置 hints
  };
  submissions: Record<string, SubmissionRecord>;  // task_id -> latest
  badges: string[];
  updated_at: string;
}

interface SubmissionRecord {
  task_id: string;
  submitted_at: string;
  deliverable: Record<string, unknown>;
  chat_session_id: string;
  chat_log: ChatMessage[];
  selected_image?: string;
  scores: {
    overall: number;
    deliverable?: number;
    prompt?: number;
    passed: boolean;
  };
  feedback: {
    deliverable: string[];
    prompt: string[];
    suggested_prompt?: string;
  };
}
```

### 9.2 服务端无账号 MVP

- 所有进度 **localStorage**  
- Chat / 评分走 API，关联 `session_id`，不长期存 PII  
- 可选：匿名 `device_id` UUID 存于 localStorage，用于限流  

---

## 10. API 一览（MVP）

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/config/org` | BG + 小组树 |
| GET | `/api/config/tasks?role=creative` | 角色 Task 列表（不含答案） |
| GET | `/api/config/task/:id` | 单个 Task Brief（渲染占位符） |
| POST | `/api/chat/session` | 创建 Chat 会话 |
| POST | `/api/chat/message` | 发送消息 / 触发出图 |
| POST | `/api/submit` | 提交成稿 + chat_session_id |
| POST | `/api/score` | 内部：submit 后异步或同步评分 |
| GET | `/api/report?save=` | 根据 submissions 聚合 Day7 报告（或纯前端聚合） |

**POST /api/submit Request**

```json
{
  "task_id": "cr_d3_poster",
  "save_meta": { "bg_id": "pcg", "team_id": "pcg-video", "role": "creative", "day": 3 },
  "deliverable": {
    "main_title": "2026 腾讯视频校招",
    "sub_title": "AI 赋能你的每一次创造",
    "image_url": "/generated/xxx.png"
  },
  "chat_session_id": "sess_abc",
  "elapsed_seconds": 680
}
```

**POST /api/submit Response**

```json
{
  "submission_id": "sub_xyz",
  "passed": true,
  "scores": {
    "overall": 78,
    "deliverable": 72,
    "prompt": 84
  },
  "feedback": { "...": "..." },
  "unlocked_next_day": 4
}
```

---

## 11. 技术方案

### 11.1 推荐栈

| 层 | 选型 |
|----|------|
| 前端 | React 18 + Vite + TypeScript + Tailwind |
| 后端 | Python FastAPI |
| AI 文本 | OpenAI 兼容 Chat Completions（辅评、对话） |
| AI 图像 | OpenAI DALL·E / 混元文生图（可配置 provider） |
| 存储 | 本地文件 or 对象存储（生成图）；元数据 JSON |
| 部署 | 前端静态 + 后端 Docker；需 HTTPS 才能稳定用部分 API |

### 11.2 环境变量

```env
LLM_API_KEY=
LLM_BASE_URL=
IMAGE_API_KEY=
IMAGE_PROVIDER=openai|hunyuan|mock
SCORE_MODEL=gpt-4o-mini
MAX_CHAT_TURNS=20
MAX_DAILY_SUBMISSIONS=50
```

### 11.3 项目目录（建议）

```
tencent-hr-sim/
├── docs/
│   ├── PRD.md
│   └── MVP-PRD.md          ← 本文档
├── frontend/
├── backend/
│   ├── api/
│   │   ├── chat.py
│   │   ├── submit.py
│   │   └── config.py
│   ├── scoring/
│   │   ├── deliverable.py
│   │   ├── prompt.py
│   │   └── comm.py
│   └── data/
│       ├── org_tree.json
│       └── tasks/
│           ├── creative/
│           └── comm/
└── README.md
```

---

## 12. 非功能需求

| 类别 | 要求 |
|------|------|
| 性能 | 首屏 LCP < 2.5s；Chat 首 token < 3s |
| 可用性 | Chrome/Edge 最新两版；1280px 起最佳 |
| 安全 | API Key 仅服务端；上传图限制 5MB；XSS 过滤用户 Markdown |
| 合规 | 页面底栏免责声明；生成内容过敏感词 |
| 可访问性 | 表单有 label；图片有 alt（取自主标题） |

---

## 13. 测试与验收标准

### 13.1 功能验收（Must Pass）

| ID | 场景 | 预期 |
|----|------|------|
| AC-01 | 完整选 BG→小组→培训生→创意型 | 进入 `/game` Day1 |
| AC-02 | 创意型 Day3 全流程 | Chat 出图 → 选图 → 填标题 → 提交 |
| AC-03 | 双维评分展示 | 结果页同时显示成稿分、提示词分、两类 feedback |
| AC-04 | Prompt 迭代加分 | 第 2 轮有效修改 Prompt 后 prompt_score 高于单轮 |
| AC-05 | 沟通型 Day1 | AI 草稿 + 用户修改提交 → 人工改写度计入 |
| AC-06 | 未达 60 分 | 显示未通关，可重试 1 次 |
| AC-07 | Day7 完成 | 成长报告含 7 日分数曲线 |
| AC-08 | 刷新页面 | localStorage 恢复进度 |
| AC-09 | 分析/技术型 | 不可选，显示即将开放 |

### 13.2 评分质量验收

- 准备 **5 套** 标定样例（Prompt 好/差、海报好/差组合）  
- LLM 评分与人工标定 Spearman ≥ 0.7（内部测试）  
- 每条 feedback 非空且 ≤120 字  

---

## 14. 里程碑与排期（建议 4 周）

| 周 | 交付 |
|----|------|
| W1 | 组织/角色 onboarding + `/game` 壳 + Task 配置 JSON（创意 7 + 沟通 7） |
| W2 | AI Chat（text_gen + image_gen）+ 挑战页 UI |
| W3 | 双维评分引擎 + 结果页 + 存档 |
| W4 | 沟通型全流程 + Day7 报告 + 联调 + 5 条标定测试 |

---

## 15. 风险与对策

| 风险 | 对策 |
|------|------|
| 图像 API 成本高 | 每 Task 限 5 张；开发用 mock provider |
| Prompt 评分主观 | 规则分占 Prompt 维 30%；标定样例 few-shot |
| 用户照搬 AI 无修改 | 沟通型人工改写度；创意型 Prompt 迭代分 |
| TCamp 外链失效 | 角色页保留文字版指南 |

---

## 16. 附录：创意型 Day3 Prompt 评分 Rubric（LLM System 摘要）

```
你是 HR 实训 Prompt 评估官。仅评估用户在与 AI 对话中撰写的提示词，不评海报图本身。

输入：Task Brief、chat_messages、用户最终选中的 image 对应轮次。

按 dimensions 打分 0-满分：
- structure, specificity, constraints, style_language, iteration

输出严格 JSON。feedback 必须：
1) 指出最强的一条 Prompt 做法
2) 指出最需改进的一点
3) 给出 suggested_prompt_rewrite 示范（不超过 200 字）

禁止：泄露内部信息、推荐未授权 IP 元素。
```

---

## 17. 附录：沟通型 Day1 Brief 摘要

> **来自**：IEG 王者荣耀工作室 HRBP  
> **主题**：紧急 — Q3 校招 HC 确认  
>
> 我们这边收到 3 个 tech 岗位的 urgent 需求，HC 表上和 COE 给的数量对不上。请在今天下班前回复：  
> 1) 当前可发 offer 数量  
> 2) 最早到岗时间  
> 3) 若 HC 不足，你的建议方案  
>
> 业务方语气较急，请专业、坚定但不激化冲突。

---

*MVP PRD v1.0 定稿 — 下一步：按 W1 任务拆分开发 Issue / 初始化 `org_tree.json` + `tasks/creative/*.json`*
