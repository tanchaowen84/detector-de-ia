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
