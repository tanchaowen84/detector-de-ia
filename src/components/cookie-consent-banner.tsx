'use client';

import { useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import 'vanilla-cookieconsent/dist/cookieconsent.css';

/**
 * Lightweight cookie banner using vanilla-cookieconsent with i18n.
 * Loads analytics only after consent (handled where scripts are injected).
 */
export function CookieConsentBanner() {
  const t = useTranslations('CookieBanner');
  const locale = useLocale();
  const ccRef = useRef<any>(null);

  useEffect(() => {
    // Avoid double init on HMR by reusing instance
    let cancelled = false;
    (async () => {
      const lib = await import('vanilla-cookieconsent');
      const cc: any = (lib as any).default ?? lib;
      if (cancelled || !cc || typeof cc.run !== 'function') return;

      if (ccRef.current) {
        ccRef.current.setLanguage?.(locale);
        return;
      }

      cc.run({
        guiOptions: {
          consentModal: {
            layout: 'box',
            position: 'bottom right',
            transition: 'slide',
            equalWeightButtons: true,
            flipButtons: false,
          },
          preferencesModal: {
            layout: 'bar',
            position: 'right',
            transition: 'slide',
          },
        },
        currentLang: locale,
        autoclearCookies: false,
        page_scripts: false, // we gate scripts manually
        languages: {
          [locale]: {
            consentModal: {
              title: t('title'),
              description: t('description'),
              acceptAllBtn: t('acceptAll'),
              acceptNecessaryBtn: t('acceptNecessary'),
              showPreferencesBtn: t('manage'),
            },
            preferencesModal: {
              title: t('manageTitle'),
              acceptAllBtn: t('acceptAll'),
              acceptNecessaryBtn: t('acceptNecessary'),
              savePreferencesBtn: t('save'),
              sections: [
                {
                  title: t('sectionNecessary.title'),
                  description: t('sectionNecessary.desc'),
                  linkedCategory: 'necessary',
                },
                {
                  title: t('sectionAnalytics.title'),
                  description: t('sectionAnalytics.desc'),
                  linkedCategory: 'analytics',
                },
                {
                  title: t('sectionMarketing.title'),
                  description: t('sectionMarketing.desc'),
                  linkedCategory: 'marketing',
                },
              ],
            },
          },
        },
        categories: {
          necessary: {
            enabled: true,
            readOnly: true,
          },
          analytics: {
            autoClear: {
              cookies: [],
            },
            enabled: false,
          },
          marketing: {
            autoClear: {
              cookies: [],
            },
            enabled: false,
          },
        },
        onFirstAction: () => {},
        onAccept: () => {},
        onChange: () => {},
      });
      ccRef.current = cc;
    })();

    return () => {
      cancelled = true;
    };
  }, [locale, t]);

  return null;
}
