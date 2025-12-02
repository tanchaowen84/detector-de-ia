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
      title: t('plagiarism.title'),
      href: Routes.PlagiarismDetector,
      external: false,
    },
    {
      title: t('humanizer.title'),
      href: Routes.AIHumanizer,
      external: false,
    },
    {
      title: t('apaGenerator.title'),
      href: Routes.ApaGenerator,
      external: false,
    },
    {
      title: t('textCompare.title'),
      href: Routes.TextCompare,
      external: false,
    },
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
  ];

  if (websiteConfig.features.enableBlogPage) {
    links.push({
      title: t('blog.title'),
      href: Routes.Blog,
      external: false,
    });
  }

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
