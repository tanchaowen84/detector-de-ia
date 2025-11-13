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
