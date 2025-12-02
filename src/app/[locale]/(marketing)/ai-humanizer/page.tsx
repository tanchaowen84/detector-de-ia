import { HumanizerHero } from '@/components/tools/humanizer';
import AiDetectorFeaturesSection from '@/components/blocks/detector-features';
import Features3Section from '@/components/blocks/features/features3';
import DetectionProcessSection from '@/components/blocks/detection-process';
import FaqSection from '@/components/blocks/faqs/faqs';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HumanizerPage.metadata' });

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    canonicalUrl: getUrlWithLocale('/ai-humanizer', locale),
  });
}

interface HumanizerPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function HumanizerPage({ params }: HumanizerPageProps) {
  await params; // ensure locale awaited for consistency

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-purple-100 via-purple-50 to-amber-50" />
      <div className="fixed inset-0 opacity-20">
        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,_rgba(139,92,246,0.1),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(251,191,36,0.1),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(139,92,246,0.02)_1px,_transparent_1px)] bg-[length:30px_30px]" />
      </div>

      <div className="relative z-10 flex flex-col">
        <HumanizerHero />
        <AiDetectorFeaturesSection i18nNamespace="HumanizerPage.blocks.howItWorks" />
        <Features3Section i18nNamespace="HumanizerPage.blocks.useCases" />
        <DetectionProcessSection i18nNamespace="HumanizerPage.blocks.related" />
        <FaqSection i18nNamespace="HumanizerPage.blocks.faq" />
      </div>
    </>
  );
}
