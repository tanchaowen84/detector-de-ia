import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

type InlineCtaVariant = 'primary' | 'secondary';

export function InlineCtaSection({ variant = 'primary' }: { variant?: InlineCtaVariant }) {
  const t = useTranslations('HomePage.inlineCta');
  const key = variant === 'secondary' ? 'secondary' : 'primary';

  return (
    <section className="px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 rounded-[22px] border border-white/50 bg-white/35 px-5 py-6 text-center text-slate-900 shadow-[0_16px_50px_rgba(0,0,0,0.05)] backdrop-blur-md">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-900">{t(`${key}.title`)}</p>
          <p className="text-sm text-slate-600">{t(`${key}.description`)}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button asChild className="h-11 px-5 rounded-full shadow-sm">
            <LocaleLink href="/#detector">{t(`${key}.primary`)}</LocaleLink>
          </Button>
          <Button variant="outline" asChild className="h-11 px-5 rounded-full border-slate-200/70 bg-white/60 backdrop-blur-sm">
            <LocaleLink href="/pricing">{t(`${key}.secondary`)}</LocaleLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
