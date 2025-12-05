import deepmerge from 'deepmerge';
import type { Locale, Messages } from 'next-intl';
import { routing } from './routing';

import enMessages from '../../messages/en.json';
import esMessages from '../../messages/es.json';

// Keep a tiny in-memory map so the default locale drives which language
// we surface for manifest/OG fallbacks instead of hard-coding English.
const messagesMap: Record<string, Messages> = {
  en: enMessages as Messages,
  es: esMessages as Messages,
};

export const defaultMessages: Messages =
  messagesMap[routing.defaultLocale] ?? messagesMap.en;

const importLocale = async (locale: Locale): Promise<Messages> => {
  return (await import(`../../messages/${locale}.json`)).default as Messages;
};

// Instead of using top-level await, create a function to get default messages
export const getDefaultMessages = async (): Promise<Messages> => {
  return await importLocale(routing.defaultLocale);
};

/**
 * If you have incomplete messages for a given locale and would like to use messages
 * from another locale as a fallback, you can merge the two accordingly.
 *
 * https://next-intl.dev/docs/usage/configuration#messages
 */
export const getMessagesForLocale = async (
  locale: Locale
): Promise<Messages> => {
  const localeMessages = await importLocale(locale);
  if (locale === routing.defaultLocale) {
    return localeMessages;
  }
  // Get default messages when needed instead of using a top-level await
  const defaultMessages = await getDefaultMessages();
  // Overwrite arrays instead of concatenating (deepmerge default) to avoid
  // mixed-language lists like steps/FAQ when merging locales.
  return deepmerge(defaultMessages, localeMessages, {
    arrayMerge: (_destinationArray, sourceArray) => sourceArray,
  }) as Messages;
};
