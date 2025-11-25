import { WordCounter } from '@/components/tools/word-counter';
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
  const t = await getTranslations({ locale, namespace: 'WordCounterPage.metadata' });

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    canonicalUrl: getUrlWithLocale('/word-counter', locale),
  });
}

interface WordCounterPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function WordCounterPage({ params }: WordCounterPageProps) {
  await params;
  return <WordCounter />;
}
