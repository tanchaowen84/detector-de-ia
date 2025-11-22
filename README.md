detector de ia 产品MVP文档
⸻

① 功能（MVP 要做什么）
	•	首页一个大输入框，用户粘贴西班牙语文本。
	•	一个按钮：一键检测。
	•	前端把文本发到后端接口
	•	后端调用第三方 Winston AI Detector API，拿到一个 0–100 的分数。
	•	结果区域：
	1.	显示 AI 概率百分比（例如：AI Score: 76%）
	2.	显示一个简单结论：More likely AI / Mixed / More likely human
	3.	显示一句很短的英文说明，例如：Style is highly repetitive and similar to typical AI-generated text.
  4.  需要根据每个句子的ai概率高亮对应的句子并且需要根据概率的大小标注不同颜色深度

⸻

② 要重点关注的西班牙语关键词（SEO 选词用）

核心主关键词：
	•	detector de ia
	•	detector de ia gratis / detector de ia gratuito
	•	detector de contenido de ia
	•	detector de texto ia
	•	detector de ia online

使用场景长尾：
	•	detector de ia para estudiantes
	•	detector de ia para profesores
	•	detector de ia para universidades
	•	detector de ia para trabajos / detector de ia para tareas / detector de ia para ensayos
	•	detector de ia para SEO / detector de ia para blogs / detector de ia para contenido web

替代说法 / 相关搜索：
	•	verificador de ia
	•	checker de ia
	•	detector de chatgpt / detector de texto de chatgpt
	•	detector de contenido generado por ia

你现在可以：
 	•	功能段拿去当 MVP 说明 / PRD；
 	•	关键词整段丢进 Ahrefs / Semrush 看量和难度，然后再拆词做后续页面。

⸻

## 上线前路线图

1. **检测历史**
   - 设计 `detections` 表（userId、来源类型、输入摘要、分数、句子结果、时间戳）。
   - 在 `detectAIContentAction` 中记录登录用户的每次检测。
   - 提供分页查询/过滤接口，Dashboard 可调用查看详情。
   - 重构受保护的 Dashboard，让“历史检测”按钮真正跳到列表/侧边栏。

2. **付费计划与付费墙**
   - 在 `websiteConfig.price` 中定义清晰的额度：如免费 ≤1500 字符，付费解锁长文本 + 文件 + URL。
   - 为不同 plan 增加能力标记（`allowFileUpload`、`allowWebsiteScan`、每日限额），Server Action 校验权限。
   - 前端根据 plan 显示/禁用按钮，并提供升级 CTA；后端返回明确的超限错误。
   - 全量测试支付流程（Creem/Stripe）、Webhook、成功/取消页，确保能正确开通权限。

3. **合规文档**
   - 撰写并上线 Cookie Policy、Privacy Policy、Terms of Use、Refund Policy（至少西语/英语双语），存放在 `content/pages`。
   - Footer、注册页、检测结果提示等位置全部指向最新文档，并在需要时记录用户同意。

4. **上线前检查表**
   - 桌面/移动端分别跑通文本、文件、URL 三种检测流程，确认 UI 与提示一致。
   - Dashboard 中的额度、历史计数显示正确，并搭建基础监控/告警。
   - 更新 sitemap 与 SEO 元信息，确保新页面被索引。
   - 准备部署/回滚步骤、支持渠道与上线后指标跟踪计划。

### Esquema actual del hero (ASCII)

```
┌──────────────────────────────────────────────┐     
│                                              │
│ [Subir archivo] [Pegar URL] [Probar muestras]│
│                                 [Historial]  │
│-──────────────────────────────────────────———│
│  Arrastra tu archivo...                      │
│   Aceptamos .txt...                          │
│                                              │
│        [Pegar]      [Subir]                  │
│                                              │
│——─────────────────────────────────────────———│
│ 0 / 120,0 caracteres ·                       │
│ [Limpiar]                      [Detectar]    │
└──────────────────────────────────────────────┘
```

### Propuesta columna derecha (ASCII)

```
┌─────────────────────────────┐
│ Originality report    [Tiempo] │
│ Low        ◡        High    │
│         Gauge 75%          │
│ --% Confident that's AI    │
├─────────────────────────────┤
│ Your text is secure…        │
│ [✓] Encrypted               │
│ [✓] Never Shared            │
│ [✓] Not used to train AI    │
│                             │
│ By continuing you agree…    │
│ (Terms) + legal copy        │
└─────────────────────────────┘
```

## 付费与额度功能落地计划（简版执行稿，复用现有 Creem 支付）

- 数据与配置
  - 计划能力配置：`maxChars`、`allowText|File|Url`、`monthlyCredits`、`resetInterval`、`oneTimeCredits`、`oneTimeExpiresDays`、`saveHistory`、`creditsPerWordDetect=1`。
  - 用户/访客额度字段：`plan`、`credits`、`creditsResetAt`、`oneTimeExpiresAt`（Trial Pack），访客用 `ipCredits`、`ipCreditsResetAt`（cookie/ip-key），尽量复用 `user` 表或 `metadata`，少动表结构。
- 扣费与过期逻辑（Server Action，Winston 调用前）
  - 顺序：计划校验 → 过期/重置检查 → 额度校验 → 扣费事务 → 调用 Winston。
  - 重置规则：Trial 过期清零；订阅按周期重置；访客/Free 30 天重置 400；额度不足返回错误码 `INSUFFICIENT_CREDITS`
  - 记 `creditsHistory`（扣费明细）、保留字数与类型。
- 入口与付费墙（前端）
  - Guest/Free：文件/URL 按钮直接弹 Trial CTA；文本超上限阻止提交；额度不足弹对应 CTA（Free→Trial，Trial/Hobby/Pro→续费/升级）。
  - 显示当前 credits 与重置时间（Detector 区 + Dashboard 顶部）。
- Trial Pack 商品（Creem）
  - 直接在现有 Creem 流程上增加产品 ID（ONE_TIME，30000 credits，14 天过期），复用现成 `createCheckoutAction` 和 Creem Provider。
- Webhook 闭环（Creem 已有）
  - 复用现有 `/api/webhooks/creem` 验签与处理逻辑，仅补充：成功事件写入 Trial Pack 余额与 `oneTimeExpiresAt`，订阅事件更新月度配额/`creditsResetAt`；取消/退款可简化为计划降级 + 余额清零。
- 历史与详情页
  - 新增 `/dashboard/detections/[id]`：全文+句子高亮、来源、版本、扣费信息；列表行可点击。
  - Guest 历史默认不存或存短期（配置化）。
- 迁移与验证
  - Drizzle migration：补字段/默认值；预置 Creem 价格 ID。
  - 自测用例：访客/Free/Trial/Hobby/Pro 覆盖超字数、额度不足、Trial 过期、订阅重置、Webhook 成功链路。
  - Checklist：env 填充、Creem webhook 生效、移动端回归。


## 上线前测试清单（付费/额度重点）

- 访客 / Free
  - 文本 ≤1500 chars 可检测；文件/URL 点击弹 Trial CTA。
  - 连续检测至 400 credits 用尽返回不足提示；清理 cookie 后额度重置。
- Trial Pack（一次性，30k credits，14 天）
  - Creem 下单 → webhook 生效：credits=30,000、`oneTimeExpiresAt`=+14d、plan=trial。
  - 单次字符上限 30,000；文件/URL 可用。
  - 模拟过期（改 DB 时间）后检测被拒/提示升级，余额清零。
- Hobby / Pro（订阅）
  - 成功支付后：plan 设置正确；credits=100,000(Hobby)/200,000(Pro)；`creditsResetAt`=+1 月。
  - 字符上限：Hobby 30,000 / Pro 60,000；文件/URL 可用。
  - 到期懒重置：周期后首次调用前刷新额度；取消/过期 webhook 回落到 free、清零。
- 计费口径
  - 文本 1 credit/word；文件/URL 以响应长度估算；抄袭检测入口未开放（确保无误扣）。
  - Credits 不足提示：Free→Trial CTA；Trial/Hobby/Pro→续费/升级提示。
- Pricing & Billing 展示
  - Pricing 卡顺序 Trial→Hobby→Pro；价格：Trial $4.99；Hobby $9/mo ($84/yr)；Pro $19/mo ($180/yr)；文案显示 30k/60k 上限正确。
  - Billing 页面显示当前计划、剩余/总 credits、重置时间；详情页有返回按钮。
- 历史与详情
  - Dashboard 历史行可点击浮起跳转详情；详情显示句子高亮、creditsUsed、元信息。
  - 未登录访问受保护页跳登录；访问他人 ID 返回 404。


### 调试速查：额度/周期快速修改
- 配置入口：`src/config/plan-policy.ts`
  - `maxChars`：单次字符上限（Trial=30000, Hobby=30000, Pro=60000）。改小即可验证前端/后端 gating，改回后重启。
  - `monthlyCredits`：Hobby/Pro 月配额（100000 / 200000）。临时改小可快速打光额度；改大可绕过限制。
  - `oneTimeCredits`, `oneTimeExpiresDays`：Trial Pack 一次性额度与有效期（30k, 14 天）。调小/调短便于验证过期/清零。
  - 访客/Free：`monthlyCredits`、`resetIntervalDays`（当前 400、30 天）。调小 + 清 cookie 即可模拟不足。
- 访客额度快速重置
  - 浏览器删除 cookie `guest_credits`；或在 `src/lib/credits.ts` 的 `getGuestBucket` 内临时改初始额度/周期（记得改回）。
- 用户额度/过期模拟（DB 层）(okay)
  - 表 `user`：`credits` 余额；`metadata.planId`、`metadata.creditsResetAt`、`metadata.oneTimeExpiresAt`。
  - 调试：把 `creditsResetAt` 或 `oneTimeExpiresAt` 改成过去时间，再触发检测，代码会懒重置/清零；把 `credits` 改成小值可模拟不足。
  - 表 `credits_history`：可检查/清理扣费记录（仅调试环境）。
- 价格/产品 ID(okay)
  - `src/config/website.tsx`：Creem 产品 ID 与展示价格，需与 Creem 后台保持一致；可临时切换到测试产品。
- 详情/显示来源(okay)
  - Billing 卡与详情页使用 `user.credits` + `metadata`，改 DB 或 plan-policy 即可看到 UI 变化（刷新）。

调完务必将 `plan-policy.ts` 和 DB 还原为正式数值，避免测试配置遗留上线。

free和订阅层级的都已经测试完成了
还有guest用户层级功能未通过测试，主要是积分制度和额度设置这一块
目前的额度不足是通过弹toast提示语句实现，我觉得可以保留，但最好还是要弹一个modal模态框出来给用户引导付费
还有我们需要写一个品牌名暂定VeriScan AI方便审核和品牌计划
最后就是我们首页还有三个图片需要我们制作
然后就是首页的三个测试文本我们需要真实的三个有层级划分的最好，现在三个测出来都是99+AI