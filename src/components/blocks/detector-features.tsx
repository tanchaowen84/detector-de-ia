import { HeaderSection } from '@/components/layout/header-section';
import {
  BrainCircuitIcon,
  FingerprintIcon,
  SparklesIcon,
  TargetIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

/**
 * AI Detector Features Section
 * 展示AI检测器的核心功能特性
 */
export default function AiDetectorFeaturesSection() {
  const t = useTranslations('HomePage.aiDetectorFeatures');

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
          subtitleAs="h2"
          description={t('description')}
          descriptionAs="p"
          className="text-center mb-16"
        />

        <div className="grid items-center gap-12 lg:grid-cols-5 lg:gap-24">
          {/* 左侧文字内容 */}
          <div className="lg:col-span-2">
            <div className="lg:pr-8">
              {/* 标题已经在HeaderSection中显示，这里只显示描述 */}
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                {t('description')}
              </p>
            </div>

            <ul className="mt-10 space-y-4">
              <li className="group flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100 backdrop-blur-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <TargetIcon className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {t('features.accuracy.title')}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t('features.accuracy.description')}
                  </p>
                </div>
              </li>

              <li className="group flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100 backdrop-blur-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <BrainCircuitIcon className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {t('features.models.title')}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t('features.models.description')}
                  </p>
                </div>
              </li>

              <li className="group flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100 backdrop-blur-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <SparklesIcon className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {t('features.highlights.title')}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t('features.highlights.description')}
                  </p>
                </div>
              </li>

              <li className="group flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100 backdrop-blur-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FingerprintIcon className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {t('features.realtime.title')}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {t('features.realtime.description')}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* 右侧图片 */}
          <div className="relative lg:col-span-3">
            <div className="relative rounded-3xl border border-white/10 p-1 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm">
              <div className="aspect-[4/3] relative rounded-[28px] overflow-hidden bg-white/5">
                <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-4xl mb-4">🔍</div>
                    <div className="text-white/80 text-sm">AI Detection Dashboard</div>
                    <div className="text-white/60 text-xs mt-2">Real-time analysis interface</div>
                  </div>
                </div>

                {/* 装饰性渐变覆盖层 */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#140b3c]/20 to-transparent pointer-events-none" />

                {/* 边框光效 */}
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50 pointer-events-none" />
              </div>
            </div>

            {/* 装饰性元素 */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#d9b061]/15 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#8b5cf6]/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
