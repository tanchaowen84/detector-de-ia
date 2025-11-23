import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function InlineCtaSection() {
  const t = useTranslations('HomePage.inlineCta');

  return (
    <section className="px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl bg-indigo-50/80 px-6 py-6 text-center text-slate-900 shadow-sm">
        <div className="space-y-1">
          <p className="text-lg font-semibold">{t('title')}</p>
          <p className="text-sm text-slate-600">{t('description')}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button asChild className="px-5">
            <LocaleLink href="/#detector">{t('primary')}</LocaleLink>
          </Button>
          <Button variant="outline" asChild className="px-5">
            <LocaleLink href="/pricing">{t('secondary')}</LocaleLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
