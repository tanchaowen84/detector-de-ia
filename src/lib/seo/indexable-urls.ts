import { websiteConfig } from '@/config/website';
import { getLocalePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getBaseUrl } from '@/lib/urls/urls';
import { allCategories, allPosts } from 'content-collections';
import type { MetadataRoute } from 'next';
import type { Locale } from 'next-intl';

type Href = Parameters<typeof getLocalePathname>[0]['href'];

const BASE_STATIC_ROUTES: Href[] = [
  '/',
  '/plagiarism-detector',
  '/ai-humanizer',
  '/text-compare',
  '/ai-summarizer',
  '/word-counter',
  '/apa-generator',
  '/pricing',
  '/privacy',
  '/terms',
  '/cookie',
  '/refund',
];

type SitemapEntry = MetadataRoute.Sitemap[number];

function createEntry(
  url: string,
  lastModified: Date,
  priority: number,
  changeFrequency: SitemapEntry['changeFrequency']
): SitemapEntry {
  return {
    url,
    lastModified,
    priority,
    changeFrequency,
  };
}

function getUrl(href: Href, locale: Locale) {
  const pathname = getLocalePathname({ locale, href });
  return getBaseUrl() + pathname;
}

function getEnabledStaticRoutes(): Href[] {
  const routes = [...BASE_STATIC_ROUTES];

  if (websiteConfig.features.enableBlogPage) {
    routes.push('/blog');
  }

  if (websiteConfig.features.enableAIPages) {
    routes.push('/ai/text', '/ai/image', '/ai/video', '/ai/audio');
  }

  if (websiteConfig.features.enableMagicUIPage) {
    routes.push('/magicui');
  }

  return routes;
}

function dedupeEntries(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  return Array.from(
    entries
      .reduce(
        (map, entry) => map.set(entry.url, entry),
        new Map<string, SitemapEntry>()
      )
      .values()
  );
}

export async function getIndexableSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  entries.push(
    ...getEnabledStaticRoutes().flatMap((route) =>
      routing.locales.map((locale) =>
        createEntry(getUrl(route, locale), lastModified, 1, 'weekly')
      )
    )
  );

  if (websiteConfig.features.enableBlogPage) {
    const publishedPostsByLocale = new Map(
      routing.locales.map((locale) => [
        locale,
        allPosts.filter((post) => post.locale === locale && post.published),
      ])
    );

    routing.locales.forEach((locale) => {
      const posts = publishedPostsByLocale.get(locale) ?? [];
      const totalPages = Math.max(
        1,
        Math.ceil(posts.length / websiteConfig.blog.paginationSize)
      );

      for (let page = 2; page <= totalPages; page += 1) {
        entries.push(
          createEntry(
            getUrl(`/blog/page/${page}`, locale),
            lastModified,
            0.8,
            'weekly'
          )
        );
      }
    });

    routing.locales.forEach((locale) => {
      const localeCategories = allCategories.filter(
        (category) => category.locale === locale
      );

      localeCategories.forEach((category) => {
        const postsInCategory = (
          publishedPostsByLocale.get(locale) ?? []
        ).filter((post) =>
          post.categories.some((cat) => cat && cat.slug === category.slug)
        );
        const totalPages = Math.max(
          1,
          Math.ceil(postsInCategory.length / websiteConfig.blog.paginationSize)
        );

        entries.push(
          createEntry(
            getUrl(`/blog/category/${category.slug}`, locale),
            lastModified,
            0.8,
            'weekly'
          )
        );

        for (let page = 2; page <= totalPages; page += 1) {
          entries.push(
            createEntry(
              getUrl(`/blog/category/${category.slug}/page/${page}`, locale),
              lastModified,
              0.8,
              'weekly'
            )
          );
        }
      });
    });

    entries.push(
      ...allPosts.flatMap((post) =>
        routing.locales
          .filter((locale) => post.locale === locale && post.published)
          .map((locale) =>
            createEntry(
              getUrl(`/blog/${post.slugAsParams}`, locale),
              lastModified,
              0.8,
              'weekly'
            )
          )
      )
    );
  }

  return dedupeEntries(entries);
}

export async function getIndexableUrls(): Promise<string[]> {
  const entries = await getIndexableSitemapEntries();
  return entries.map((entry) => entry.url);
}
