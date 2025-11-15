import { AiDetectorSection } from '@/components/detector/ai-detector-section';
import AiDetectorFeaturesSection from '@/components/blocks/detector-features';
import UseCasesSection from '@/components/blocks/use-cases/use-cases';
import DetectionProcessSection from '@/components/blocks/detection-process';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

/**
 * https://next-intl.dev/docs/environments/actions-metadata-route-handlers#metadata-api
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    canonicalUrl: getUrlWithLocale('', locale),
  });
}

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage(props: HomePageProps) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations('HomePage');

  return (
    <>
      <div className="flex flex-col">
        {/* 1. 英雄板块 - AI 检测器主界面 */}
        <AiDetectorSection />

        {/* 2. 功能特性板块 - 左文右图，展示核心技术 */}
        <AiDetectorFeaturesSection />

        {/* 3. 应用场景板块 - 左文右图，展示目标用户 */}
        <UseCasesSection />

        {/* 4. 工作流程板块 - 左图右文，展示3步检测过程 */}
        <DetectionProcessSection />
      </div>
    </>
  );
}
