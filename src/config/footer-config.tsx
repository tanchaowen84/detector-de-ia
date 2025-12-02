'use client';

import { websiteConfig } from '@/config/website';
import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import { useTranslations } from 'next-intl';

/**
 * Get footer config with translations
 *
 * NOTICE: used in client components only
 *
 * docs:
 * https://mksaas.com/docs/config/footer
 *
 * @returns The footer config with translated titles
 */
export function getFooterLinks(): NestedMenuItem[] {
  const t = useTranslations('Marketing.footer');

  return [
    {
      title: t('product.title'),
      items: [
        {
          title: t('product.items.plagiarism'),
          href: Routes.PlagiarismDetector,
          external: false,
        },
        {
          title: t('product.items.humanizer'),
          href: Routes.AIHumanizer,
          external: false,
        },
        {
          title: t('product.items.textSummarizer'),
          href: Routes.TextSummarizer,
          external: false,
        },
        {
          title: t('product.items.apaGenerator'),
          href: Routes.ApaGenerator,
          external: false,
        },
        {
          title: t('product.items.textCompare'),
          href: Routes.TextCompare,
          external: false,
        },
        {
          title: t('product.items.wordCounter'),
          href: Routes.WordCounter,
          external: false,
        },
        {
          title: t('product.items.pricing'),
          href: Routes.Pricing,
          external: false,
        },
        {
          title: t('product.items.faq'),
          href: Routes.FAQ,
          external: false,
        },
      ],
    },
    {
      title: t('legal.title'),
      items: [
        {
          title: t('legal.items.cookiePolicy'),
          href: Routes.CookiePolicy,
          external: false,
        },
        {
          title: t('legal.items.privacyPolicy'),
          href: Routes.PrivacyPolicy,
          external: false,
        },
        {
          title: t('legal.items.termsOfService'),
          href: Routes.TermsOfService,
          external: false,
        },
        {
          title: t('legal.items.refundPolicy'),
          href: Routes.RefundPolicy,
          external: false,
        },
      ],
    },
  ];
}
