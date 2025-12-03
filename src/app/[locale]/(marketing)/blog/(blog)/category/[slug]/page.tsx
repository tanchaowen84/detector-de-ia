import BlogGridWithPagination from '@/components/blog/blog-grid-with-pagination';
import { websiteConfig } from '@/config/website';
import { LOCALES } from '@/i18n/routing';
import { getPaginatedBlogPosts } from '@/lib/blog/data';
import { ensureBlogEnabled } from '@/lib/blog/guard';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import { allCategories } from 'content-collections';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Generate all static params for SSG (locale + category)
export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  if (!websiteConfig.features.enableBlogPage) {
    return params;
  }
  for (const locale of LOCALES) {
    const localeCategories = allCategories.filter(
      (category) => category.locale === locale
    );
    for (const category of localeCategories) {
      params.push({ locale, slug: category.slug });
    }
  }
  return params;
}

// Generate metadata for each static category page (locale + category)
export async function generateMetadata({ params }: BlogCategoryPageProps) {
  const { locale, slug } = await params;
  if (!websiteConfig.features.enableBlogPage) {
    return;
  }
  const category = allCategories.find(
    (category) => category.locale === locale && category.slug === slug
  );
  if (!category) {
    notFound();
  }
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const canonicalPath = `/blog/category/${slug}`;
  return constructMetadata({
    title: `${category.name} | ${t('title')}`,
    description: category.description,
    canonicalUrl: getUrlWithLocale(canonicalPath, locale),
    locale,
  });
}

interface BlogCategoryPageProps {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
}

export default async function BlogCategoryPage({
  params,
}: BlogCategoryPageProps) {
  const { locale, slug } = await params;
  ensureBlogEnabled();
  const category = allCategories.find(
    (category) => category.locale === locale && category.slug === slug
  );
  if (!category) {
    notFound();
  }
  const currentPage = 1;
  const { paginatedPosts, totalPages } = getPaginatedBlogPosts({
    locale,
    page: currentPage,
    category: slug,
  });
  return (
    <BlogGridWithPagination
      posts={paginatedPosts}
      totalPages={totalPages}
      routePrefix={`/blog/category/${slug}`}
    />
  );
}
