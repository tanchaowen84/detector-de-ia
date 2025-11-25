import { TextCompare } from '@/components/tools/text-compare';
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
  const t = await getTranslations({ locale, namespace: 'TextComparePage.metadata' });

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    canonicalUrl: getUrlWithLocale('/text-compare', locale),
  });
}

interface TextComparePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function TextComparePage({ params }: TextComparePageProps) {
  await params;
  return <TextCompare />;
}

