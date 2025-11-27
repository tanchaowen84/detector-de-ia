import { websiteConfig } from '@/config/website';
import { routing } from '@/i18n/routing';
import type { MetadataRoute } from 'next';
import { getBaseUrl } from '../lib/urls/urls';

export default function robots(): MetadataRoute.Robots {
  const disallow: string[] = ['/api/*', '/_next/*', '/settings/*', '/dashboard/*'];

  if (!websiteConfig.features.enableBlogPage) {
    disallow.push('/blog*');
    routing.locales.forEach((locale) => disallow.push(`/${locale}/blog*`));
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow,
    },
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
