import { HeaderSection } from '@/components/layout/header-section';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { ChevronRight, ClipboardPasteIcon, BrainCircuitIcon, FileCheckIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

/**
 * AI Detection Process Section
 * 展示AI检测的3步工作流程（左图右文布局）
 */
export default function DetectionProcessSection() {
  const t = useTranslations('HomePage.detectionProcess');

  return (
    <section className="relative isolate overflow-hidden bg-white py-20 text-slate-900">
      {/* 装饰性背景 */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.08),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(139,92,246,0.02)_1px,_transparent_1px)] bg-[length:20px_20px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <HeaderSection
          title={t('title')}
          subtitle={t('subtitle')}
          description={t('description')}
          subtitleAs="h2"
          descriptionAs="p"
          className="text-center mb-16"
        />

        <div className="grid items-center gap-12 lg:grid-cols-5 lg:gap-24">
          {/* 左侧图片 */}
          <div className="relative lg:col-span-3">
            <div className="relative rounded-3xl border border-white/10 p-1 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm">
              <div className="aspect-[4/3] relative rounded-[28px] overflow-hidden bg-white/5">
                <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-4xl mb-4">🔄</div>
                    <div className="text-slate-900 text-sm font-medium">Proceso de Detección IA</div>
                    <div className="text-slate-600 text-xs mt-2">3 pasos: Texto → Análisis → Resultados</div>
                  </div>
                </div>

                {/* 装饰性渐变覆盖层 */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#140b3c]/30 to-transparent" />

                {/* 步骤标记 */}
                <div className="absolute top-6 left-6 space-y-4">
                  <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-sm font-bold">
                      1
                    </div>
                    <span className="text-sm font-medium text-slate-800">Pegar texto</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg ml-8">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-bold">
                      2
                    </div>
                    <span className="text-sm font-medium text-slate-800">Análisis IA</span>
                  </div>

                  <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg ml-16">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-sm font-bold">
                      3
                    </div>
                    <span className="text-sm font-medium text-slate-800">Resultados</span>
                  </div>
                </div>

                {/* 边框光效 */}
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50 pointer-events-none" />
              </div>
            </div>

            {/* 装饰性元素 */}
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#d9b061]/15 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#8b5cf6]/20 rounded-full blur-2xl" />
          </div>

          {/* 右侧文字内容 */}
          <div className="lg:col-span-2">
            <div className="lg:pl-8">
              {/* 标题已经在HeaderSection中显示，这里只显示内容 */}
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                  <ClipboardPasteIcon className="size-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-900 mb-3 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-indigo-600 text-sm font-bold">
                      1
                    </span>
                    {t('steps.step-1.title')}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {t('steps.step-1.description')}
                  </p>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500">▸</span>
                      <span>Pega tu texto en español</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500">▸</span>
                      <span>Mínimo 300 caracteres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500">▸</span>
                      <span>O sube un archivo .txt/.docx</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                  <BrainCircuitIcon className="size-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-900 mb-3 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-indigo-600 text-sm font-bold">
                      2
                    </span>
                    {t('steps.step-2.title')}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {t('steps.step-2.description')}
                  </p>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500">▸</span>
                      <span>Análisis con Winston AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500">▸</span>
                      <span>Detección por oraciones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500">▸</span>
                      <span>Procesamiento en tiempo real</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FileCheckIcon className="size-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-900 mb-3 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-indigo-600 text-sm font-bold">
                      3
                    </span>
                    {t('steps.step-3.title')}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {t('steps.step-3.description')}
                  </p>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500">▸</span>
                      <span>Puntuación de IA 0-100%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500">▸</span>
                      <span>Oraciones resaltadas por colores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-500">▸</span>
                      <span>Informe de originalidad detallado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Button
            asChild
            size="lg"
            className="gap-2 bg-gradient-to-r from-purple-300 to-amber-300 text-slate-900 hover:from-purple-400 hover:to-amber-400 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <LocaleLink href="#detector">
              {t('getStarted')}
              <ChevronRight className="!size-5" />
            </LocaleLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
