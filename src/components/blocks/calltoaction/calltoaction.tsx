import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function CallToActionSection() {
  const t = useTranslations('HomePage.calltoaction');

  return (
    <section className="relative py-20 text-slate-900">
      {/* 使用页面整体背景，无需重新定义渐变 */}

      <div className="relative z-10 mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-bold lg:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-6 text-xl text-slate-600">{t('description')}</p>

          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <LocaleLink href="#detector">
                {t('primaryButton')}
              </LocaleLink>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-semibold px-8 py-4 rounded-full transition-all duration-300"
            >
              <LocaleLink href="#features3">
                {t('secondaryButton')}
              </LocaleLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
