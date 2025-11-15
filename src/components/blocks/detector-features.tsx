import { HeaderSection } from '@/components/layout/header-section';
import {
  ClipboardPasteIcon,
  BrainCircuitIcon,
  FileTextIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * How It Works Section
 * 展示AI检测器的工作流程
 */
export default function AiDetectorFeaturesSection() {
  const t = useTranslations('HomePage.howItWorks');

  return (
    <section className="relative py-20 text-slate-900">
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <HeaderSection
          title={t('title')}
          subtitle={t('subtitle')}
          subtitleAs="h2"
          description={t('description')}
          descriptionAs="p"
          className="text-center mb-16"
        />

        {/* 横向三步骤布局 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
          {/* 步骤 1 */}
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 mb-6">
                <ClipboardPasteIcon className="size-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {t('steps.step-1.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t('steps.step-1.description')}
              </p>
            </div>
          </div>

          {/* 步骤 2 */}
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 mb-6">
                <BrainCircuitIcon className="size-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {t('steps.step-2.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t('steps.step-2.description')}
              </p>
            </div>
          </div>

          {/* 步骤 3 */}
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 mb-6">
                <FileTextIcon className="size-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {t('steps.step-3.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {t('steps.step-3.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}