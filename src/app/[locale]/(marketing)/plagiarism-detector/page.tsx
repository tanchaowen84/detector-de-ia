import { PlagiarismDetector } from '@/components/tools/plagiarism-detector';
import AiDetectorFeaturesSection from '@/components/blocks/detector-features';
import Features3Section from '@/components/blocks/features/features3';
import PricingSection from '@/components/blocks/pricing/pricing';
import FaqSection from '@/components/blocks/faqs/faqs';
import DetectionProcessSection from '@/components/blocks/detection-process';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { FingerprintIcon, ArrowLeftRightIcon, FileTextIcon } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PlagiarismPage.metadata' });

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    canonicalUrl: getUrlWithLocale('/plagiarism-detector', locale),
  });
}

interface PlagiarismPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function PlagiarismPage({ params }: PlagiarismPageProps) {
  const { locale } = await params;
  const tRelated = await getTranslations({ locale, namespace: 'PlagiarismPage.blocks.related' });
  return (
    <>
      <PlagiarismDetector />
      <AiDetectorFeaturesSection i18nNamespace="PlagiarismPage.blocks.howItWorks" />
      <Features3Section i18nNamespace="PlagiarismPage.blocks.useCases" />
      <PricingSection />
      <FaqSection i18nNamespace="PlagiarismPage.blocks.faq" />
      <DetectionProcessSection
        i18nNamespace="PlagiarismPage.blocks.related"
        items={[
          {
            href: '/',
            title: tRelated('items.detector.title'),
            description: tRelated('items.detector.description'),
            iconName: 'search',
          },
          {
            href: '/text-compare',
            title: tRelated('items.compare.title'),
            description: tRelated('items.compare.description'),
            iconName: 'file',
          },
          {
            href: '/word-counter',
            title: tRelated('items.counter.title'),
            description: tRelated('items.counter.description'),
            iconName: 'sparkles',
          },
        ]}
      />
    </>
  );
}
