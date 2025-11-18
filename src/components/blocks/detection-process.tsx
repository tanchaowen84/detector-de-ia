import { HeaderSection } from '@/components/layout/header-section';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import {
  ChevronRight,
  FileTextIcon,
  SearchIcon,
  SparklesIcon,
} from 'lucide-react';
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
          {/* 工具 1 - 抄袭检测器 */}
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 mb-6">
                <SearchIcon className="size-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {t('tools.plagiarism.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                {t('tools.plagiarism.description')}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 rounded-full"
                asChild
              >
                <LocaleLink href="/plagiarism-detector">
                  {t('tryNow')}
                  <ChevronRight className="!size-4" />
                </LocaleLink>
              </Button>
            </div>
          </div>

          {/* 工具 2 - 文本摘要器 */}
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 mb-6">
                <FileTextIcon className="size-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {t('tools.summarizer.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                {t('tools.summarizer.description')}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 rounded-full"
                asChild
              >
                <LocaleLink href="/text-summarizer">
                  {t('tryNow')}
                  <ChevronRight className="!size-4" />
                </LocaleLink>
              </Button>
            </div>
          </div>

          {/* 工具 3 - AI人性化器 */}
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 mb-6">
                <SparklesIcon className="size-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {t('tools.humanizer.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                {t('tools.humanizer.description')}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 rounded-full"
                asChild
              >
                <LocaleLink href="/ai-humanizer">
                  {t('tryNow')}
                  <ChevronRight className="!size-4" />
                </LocaleLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
