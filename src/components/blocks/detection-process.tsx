import { HeaderSection } from '@/components/layout/header-section';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { ChevronRight, SearchIcon, FileTextIcon, SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Related Tools Section
 * 展示相关工具的横向三列布局
 */
export default function DetectionProcessSection() {
  const t = useTranslations('HomePage.relatedTools');

  return (
    <section className="relative py-20 text-slate-900">
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <HeaderSection
          title={t('title')}
          subtitle={t('subtitle')}
          description={t('description')}
          subtitleAs="h2"
          descriptionAs="p"
          className="text-center mb-16"
        />

        {/* 横向三工具布局 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* 工具 1 - 抄袭检测器 */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <SearchIcon className="size-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {t('tools.plagiarism.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                {t('tools.plagiarism.description')}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 rounded-full"
                asChild
              >
                <LocaleLink href="/plagiarism-detector">
                  {t('tools.tryNow')}
                  <ChevronRight className="!size-4" />
                </LocaleLink>
              </Button>
            </div>
          </div>

          {/* 工具 2 - 文本摘要器 */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 mb-6 group-hover:scale-110 transition-transform">
                <FileTextIcon className="size-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {t('tools.summarizer.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                {t('tools.summarizer.description')}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 rounded-full"
                asChild
              >
                <LocaleLink href="/text-summarizer">
                  {t('tools.tryNow')}
                  <ChevronRight className="!size-4" />
                </LocaleLink>
              </Button>
            </div>
          </div>

          {/* 工具 3 - AI人性化器 */}
          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <SparklesIcon className="size-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {t('tools.humanizer.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                {t('tools.humanizer.description')}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-full"
                asChild
              >
                <LocaleLink href="/ai-humanizer">
                  {t('tools.tryNow')}
                  <ChevronRight className="!size-4" />
                </LocaleLink>
              </Button>
            </div>
          </div>
        </div>

        {/* 底部CTA按钮 */}
        <div className="mt-16 text-center">
          <Button
            asChild
            size="lg"
            className="gap-2 bg-gradient-to-r from-purple-300 to-amber-300 text-slate-900 hover:from-purple-400 hover:to-amber-400 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <LocaleLink href="#detector">
              {t('exploreAll')}
              <ChevronRight className="!size-5" />
            </LocaleLink>
          </Button>
        </div>
      </div>
    </section>
  );
}