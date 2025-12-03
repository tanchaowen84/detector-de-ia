import { websiteConfig } from '@/config/website';
import { ensureBlogEnabled } from '@/lib/blog/guard';
import BlogGridWithPagination from '@/components/blog/blog-grid-with-pagination';
import { LOCALES } from '@/i18n/routing';
import { getPaginatedBlogPosts } from '@/lib/blog/data';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export function generateStaticParams() {
  if (!websiteConfig.features.enableBlogPage) {
    return [];
  }
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: BlogPageProps) {
  const { locale } = await params;
  if (!websiteConfig.features.enableBlogPage) {
    return;
  }
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const pt = await getTranslations({ locale, namespace: 'BlogPage' });
  const canonicalPath = '/blog';
  return constructMetadata({
    title: `${pt('title')} | ${t('title')}`,
    description: pt('description'),
    canonicalUrl: getUrlWithLocale(canonicalPath, locale),
    locale,
  });
}

interface BlogPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  ensureBlogEnabled();
  const { locale } = await params;
  const currentPage = 1;
  const { paginatedPosts, totalPages } = getPaginatedBlogPosts({
    locale,
    page: currentPage,
  });
  return (
    <BlogGridWithPagination
      posts={paginatedPosts}
      totalPages={totalPages}
      routePrefix={'/blog'}
    />
  );
}
