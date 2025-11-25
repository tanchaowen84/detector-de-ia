'use client';

import { websiteConfig } from '@/config/website';
import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import { useTranslations } from 'next-intl';

/**
 * Get navbar config with translations
 *
 * NOTICE: used in client components only
 *
 * docs:
 * https://mksaas.com/docs/config/navbar
 *
 * @returns The navbar config with translated titles and descriptions
 */
export function getNavbarLinks(): NestedMenuItem[] {
  const t = useTranslations('Marketing.navbar');

  const links: NestedMenuItem[] = [
    {
      title: t('wordCounter.title'),
      href: Routes.WordCounter,
      external: false,
    },
    {
      title: t('pricing.title'),
      href: Routes.Pricing,
      external: false,
    },
    {
      title: t('blog.title'),
      href: Routes.Blog,
      external: false,
    },
  ];

  // 条件性添加docs链接
  if (websiteConfig.features.enableDocsPage) {
    links.push({
      title: t('docs.title'),
      href: Routes.Docs,
      external: false,
    });
  }

  // links.push(
  //   {
  //     title: t('blocks.title'),
  //     items: [ ...
  //   }
  // );

  // If future sections are needed, push them here.

  return links;
}
