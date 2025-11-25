import { PlagiarismDetector } from '@/components/tools/plagiarism-detector';
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
  await params;
  return <PlagiarismDetector />;
}

