'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { websiteConfig } from '@/config/website';
import { useLocalePathname, useLocaleRouter } from '@/i18n/navigation';
import { useLocaleStore } from '@/stores/locale-store';
import { type Locale, useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useTransition } from 'react';

/**
 * LocaleSwitcher component
 *
 * Allows users to switch between available locales using a dropdown menu.
 *
 * Based on next-intl's useLocaleRouter and useLocalePathname for locale navigation.
 * https://next-intl.dev/docs/routing/navigation#userouter
 */
export default function LocaleSwitcher() {
  // Return null if there's only one locale available
  const showLocaleSwitch = Object.keys(websiteConfig.i18n.locales).length > 1;
  if (!showLocaleSwitch) {
    return null;
  }

  const router = useLocaleRouter();
  const pathname = useLocalePathname();
  const params = useParams();
  const locale = useLocale();
  const { currentLocale, setCurrentLocale } = useLocaleStore();
  const [, startTransition] = useTransition();
  const t = useTranslations('Common');

  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale, setCurrentLocale]);

  const setLocale = (nextLocale: Locale) => {
    setCurrentLocale(nextLocale);

    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: nextLocale }
      );
    });
  };

  const activeLocaleData = websiteConfig.i18n.locales[locale as Locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-full border border-border px-3 text-sm font-medium flex items-center gap-2"
        >
          <span role="img" aria-hidden="true">
            {activeLocaleData?.flag ?? '🌐'}
          </span>
          <span>{activeLocaleData?.name ?? locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(websiteConfig.i18n.locales).map(
          ([localeOption, data]) => (
            <DropdownMenuItem
              key={localeOption}
              onClick={() => setLocale(localeOption)}
              className="cursor-pointer"
            >
              {data.flag && <span className="mr-2 text-md">{data.flag}</span>}
              <span className="text-sm">{data.name}</span>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
