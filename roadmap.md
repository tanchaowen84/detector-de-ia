# 开发规划（VeriIA 扩展工具）

## 总原则
- 仅使用 Winston API（不新增模型或外部依赖）。
- 复用现有检测器 UI 组件；Hero 能复用就复用，必要时小改文案与主色。
- 新增路由与导航后，自动加入 sitemap/robots；无需额外积分计算，直接采用 Winston 返回的 credits_used。

## 里程碑与任务

### M1 抄袭检测器（/plagiarism-detector）
- 路由：新增 page + 生成 metadata。
- UI：复用现有 AiDetector 骨架；保留文本/文件/URL 输入。
- 接口：调用 Winston 抄袭检测 API；记录 detections.inputType="plagiarism"。
- 结果：显示整体相似度%、来源列表、句子高亮；空来源时给提示。
- 文案：ES/EN 文案落地；按钮/提示与积分不足弹窗沿用现有逻辑。

### M2 文本对比（/text-compare）
- 路由：新增 page + metadata。
- UI：双文本框（禁用文件/URL）；同样的 CTA/按钮区。
- 接口：调用 Winston text-compare；detections.inputType="compare"。
- 结果：展示相似度%、差异要点（重合率/独特片段/句子差异）；可选差异列表。
- 文案：西语主文案 + 英文翻译。

### M3 词数统计（/word-counter）
- 路由：新增 page + metadata。
- UI：单文本框，移除上传/URL；实时显示词、字符（含/不含空格）、句子、段落。
- 逻辑：纯前端，不耗积分，不写入历史；标注“Gratis”。

### M4 首页与导航对齐
- 首页 Related Tools 三个按钮指向新路由。
- Navbar/页脚/CTA（如 InlineCtaSection）更新链接文案。
- 国际化：messages/es.json 与 messages/en.json 加入三页的文案命名空间。

### M5 QA 与发布
- 手测：文本/文件/URL 三路径（抄袭）；双文本对比边界；词数统计大文本性能。
- 空输入/超长/非法 URL/文件类型提示确认。
- Credits 弹窗与登录引导验证；历史列表能显示新 inputType。
- 部署：预览环境验证；上线后观察 Winston 返回 credits_used 与错误率。

## 优先顺序
1) M1 抄袭检测器（上线价值最高）
2) M2 文本对比
3) M3 词数统计
4) M4 导航/文案收尾
5) M5 QA 与发布

## 约束与注意事项
- 不新增后端依赖；保持现有计划/额度体系，直接使用 Winston 的 credits_used 字段。
- 保持移动端体验：双栏在移动端改为纵向堆叠，按钮保持可触达。
- 保持暗色模式兼容（复用现有主题变量）。
