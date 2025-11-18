import { HeaderSection } from '@/components/layout/header-section';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

const STEP_KEYS = ['step-1', 'step-2', 'step-3'] as const;

type StepKey = (typeof STEP_KEYS)[number];

type StepItem = {
  title: string;
  description: string;
};

const visualStyles: Record<StepKey, { gradient: string; accent: string }> = {
  'step-1': {
    gradient: 'from-indigo-50 via-white to-purple-50',
    accent: 'bg-indigo-500/80',
  },
  'step-2': {
    gradient: 'from-amber-50 via-white to-orange-50',
    accent: 'bg-amber-500/80',
  },
  'step-3': {
    gradient: 'from-emerald-50 via-white to-teal-50',
    accent: 'bg-emerald-500/80',
  },
};

export default function AiDetectorFeaturesSection() {
  const t = useTranslations('HomePage.howItWorks');

  return (
    <section id="how-it-works" className="relative py-20 text-slate-900">
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <HeaderSection
          title={t('title')}
          subtitle={t('subtitle')}
          subtitleAs="p"
          className="text-center mb-16"
        />

        <div className="grid grid-cols-1 gap-8 xl:gap-12 md:grid-cols-2 xl:grid-cols-3">
          {STEP_KEYS.map((key) => {
            const label = t(`steps.${key}.label`);
            const imageAlt = t(`steps.${key}.imageAlt`);
            const items = t.raw(`steps.${key}.items`) as StepItem[];
            return (
              <article
                key={key}
                className="flex h-full flex-col rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)]"
              >
                <div
                  className={cn(
                    'relative mb-6 flex h-56 w-full flex-col gap-4 rounded-2xl border border-slate-100 bg-gradient-to-b p-5 shadow-inner',
                    visualStyles[key].gradient
                  )}
                  role="img"
                  aria-label={imageAlt}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-10 rounded-full bg-white/70" />
                    <span className="h-3 flex-1 rounded-full bg-white/40" />
                    <span className="h-3 w-6 rounded-full bg-white/30" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-3">
                    <div className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-md">
                      <div className="mb-3 h-3 w-1/2 rounded-full bg-slate-200" />
                      <div className="space-y-2">
                        <div className="h-2 rounded-full bg-slate-300/80" />
                        <div className="h-2 rounded-full bg-slate-300/60" />
                        <div className="h-2 rounded-full bg-slate-300/40" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((pill) => (
                        <span
                          key={pill}
                          className={cn(
                            'h-2 rounded-full bg-white/60',
                            pill === 0 && visualStyles[key].accent
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-5 text-left">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.45em] text-indigo-500">
                      {label}
                    </p>
                    <h3 className="sr-only">{label}</h3>
                  </div>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.title} className="space-y-1">
                        <p className="text-base font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="text-sm leading-relaxed text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
