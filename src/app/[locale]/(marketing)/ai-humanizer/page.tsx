import { HumanizerHero } from '@/components/tools/humanizer';
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
    <div className="relative z-10 flex flex-col">
      <HumanizerHero />
    </div>
  );
}
