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
    <section className="relative isolate overflow-hidden bg-[#140b3c] py-20 text-white">
      {/* 装饰性背景 */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[length:20px_20px]" />
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
              <h2 className="text-4xl font-bold text-white leading-tight">
                {t('title')}
              </h2>
              <p className="mt-6 text-lg text-white/80 leading-relaxed">
                {t('description')}
              </p>
            </div>

            <ul className="mt-10 space-y-4">
              <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <TargetIcon className="size-6 text-[#d9b061] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    {t('features.accuracy.title')}
                  </h3>
                  <p className="text-sm text-white/70">
                    {t('features.accuracy.description')}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <BrainCircuitIcon className="size-6 text-[#d9b061] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    {t('features.models.title')}
                  </h3>
                  <p className="text-sm text-white/70">
                    {t('features.models.description')}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <SparklesIcon className="size-6 text-[#d9b061] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    {t('features.highlights.title')}
                  </h3>
                  <p className="text-sm text-white/70">
                    {t('features.highlights.description')}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <FingerprintIcon className="size-6 text-[#d9b061] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    {t('features.realtime.title')}
                  </h3>
                  <p className="text-sm text-white/70">
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
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#d9b061]/20 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#6b4de6]/15 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
