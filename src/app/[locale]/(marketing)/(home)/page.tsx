import { AiDetectorSection } from '@/components/detector/ai-detector-section';
import AiDetectorFeaturesSection from '@/components/blocks/detector-features';
import Features3Section from '@/components/blocks/features/features3';
import DetectionProcessSection from '@/components/blocks/detection-process';
import PricingSection from '@/components/blocks/pricing/pricing';
import FaqSection from '@/components/blocks/faqs/faqs';
import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';
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

        {/* 3. 使用场景板块 - 6个板块并列两行，展示AI检测器的应用场景 */}
        <Features3Section />

        {/* 4. 工作流程板块 - 左图右文，展示3步检测过程 */}
        <DetectionProcessSection />

        {/* 5. 价格方案板块 - 展示不同层级的服务 */}
        <PricingSection />

        {/* 6. 常见问题板块 - 解答用户疑虑 */}
        <FaqSection />

        {/* 7. 行动召唤板块 - 最终转化引导 */}
        <CallToActionSection />
      </div>
    </>
  );
}
