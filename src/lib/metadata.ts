import { websiteConfig } from '@/config/website';
import { defaultMessages } from '@/i18n/messages';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getBaseUrl, getImageUrl } from './urls/urls';

function stripLocaleFromPath(pathname: string): string {
  const pattern = new RegExp(`^/(${routing.locales.join('|')})(/|$)`);
  return pathname.replace(pattern, '/');
}

function buildAlternateLanguages(canonicalUrl?: string): Metadata['alternates'] | undefined {
  if (!canonicalUrl) return undefined;

  const url = new URL(canonicalUrl);
  const basePath = stripLocaleFromPath(url.pathname) || '/';
  const search = url.search || '';

  const buildUrl = (locale: string) => {
    const localizedPath =
      locale === routing.defaultLocale
        ? basePath
        : `/${locale}${basePath}`.replace(/\/+/g, '/');
    return `${url.origin}${localizedPath}${search}`;
  };

  const languages: Record<string, string> = {};
  routing.locales.forEach((locale) => {
    languages[locale] = buildUrl(locale);
  });
  languages['x-default'] = buildUrl(routing.defaultLocale);

  return {
    canonical: canonicalUrl,
    languages,
  };
}

function mapOpenGraphLocale(locale?: Locale): string {
  switch (locale) {
    case 'es':
      return 'es_ES';
    case 'en':
      return 'en_US';
    default:
      return 'es_ES';
  }
}

/**
 * Construct the metadata object for the current page (in docs/guides)
 */
export function constructMetadata({
  title,
  description,
  canonicalUrl,
  image,
  locale,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  image?: string;
  locale?: Locale;
  noIndex?: boolean;
} = {}): Metadata {
  title = title || defaultMessages.Metadata.title;
  description = description || defaultMessages.Metadata.description;
  image = image || websiteConfig.metadata.images?.ogImage;
  const ogImageUrl = image ? getImageUrl(image) : getImageUrl('/og.png');
  const alternates = buildAlternateLanguages(canonicalUrl);
  const ogLocale = mapOpenGraphLocale(locale);
  return {
    title,
    description,
    alternates,
    openGraph: {
      type: 'website',
      locale: ogLocale,
      url: canonicalUrl,
      title,
      description,
      siteName: defaultMessages.Metadata.name,
      images: [ogImageUrl.toString()],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl.toString()],
      site: getBaseUrl(),
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-32x32.png',
      apple: '/apple-touch-icon.png',
    },
    metadataBase: new URL(getBaseUrl()),
    manifest: `${getBaseUrl()}/manifest.webmanifest`,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
