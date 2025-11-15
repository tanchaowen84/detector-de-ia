import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function CallToActionSection() {
  const t = useTranslations('HomePage.calltoaction');

  return (
    <section className="relative isolate overflow-hidden bg-[#140b3c] py-20 text-white">
      {/* 装饰性背景 */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.03)_1px,_transparent_1px)] bg-[length:20px_20px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-bold lg:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-6 text-xl text-white/80">{t('description')}</p>

          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#140b3c] hover:bg-white/90 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <LocaleLink href="#detector">
                {t('primaryButton')}
              </LocaleLink>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full transition-all duration-300"
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
