"use client";

import { HeaderSection } from '@/components/layout/header-section';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

const STEP_KEYS = ['step-1', 'step-2', 'step-3'] as const;

type StepKey = (typeof STEP_KEYS)[number];

type StepItem = {
  title: string;
  description: string;
};

type Step = {
  label: string;
  imageAlt: string;
  items: StepItem[];
  imageSrc?: string;
};

type StepsSectionProps = {
  /** i18n namespace, defaults to HomePage.howItWorks */
  i18nNamespace?: string;
  /** override steps to bypass translations */
  steps?: Step[];
};

const visualStyles: Record<StepKey, { gradient: string; accent: string }> = {
  'step-1': {
    gradient: 'from-indigo-50/60 via-white/80 to-purple-50/50',
    accent: 'bg-indigo-500/80',
  },
  'step-2': {
    gradient: 'from-amber-50/60 via-white/80 to-orange-50/50',
    accent: 'bg-amber-500/80',
  },
  'step-3': {
    gradient: 'from-emerald-50/60 via-white/80 to-teal-50/50',
    accent: 'bg-emerald-500/80',
  },
};

export default function AiDetectorFeaturesSection({
  i18nNamespace = 'HomePage.howItWorks',
  steps: stepsOverride,
}: StepsSectionProps) {
  // Relax typing so dynamic namespaces compile cleanly
  const t = useTranslations(i18nNamespace as any) as unknown as {
    (key: string): string;
    raw: (key: string) => any;
  };
  const locale = useLocale();

  const imageFolder = i18nNamespace.startsWith('HumanizerPage')
    ? 'howitworks/ai-humanizer'
    : 'steps';

  const stepImages: Record<StepKey, { src: string; alt: string }> = {
    'step-1': {
      src: `https://pub-a9525ed8fd554c05ba42ef72c86b7063.r2.dev/${imageFolder}/step1.webp`,
      alt: t('steps.step-1.imageAlt'),
    },
    'step-2': {
      src: `https://pub-a9525ed8fd554c05ba42ef72c86b7063.r2.dev/${imageFolder}/step2.webp`,
      alt: t('steps.step-2.imageAlt'),
    },
    'step-3': {
      src: `https://pub-a9525ed8fd554c05ba42ef72c86b7063.r2.dev/${imageFolder}/step3.webp`,
      alt: t('steps.step-3.imageAlt'),
    },
  };

  const steps: Step[] = stepsOverride ??
    STEP_KEYS.map((key) => t.raw((`steps.${key}` as any)) as Step).map((step, idx) => ({
      ...step,
      imageSrc: step.imageSrc ?? stepImages[STEP_KEYS[idx]].src,
      imageAlt: step.imageAlt ?? stepImages[STEP_KEYS[idx]].alt,
    }));

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
          {steps.map((step, idx) => {
            const key = STEP_KEYS[idx] ?? STEP_KEYS[STEP_KEYS.length - 1];
            let items = step.items ?? [];
            if (items.length > 3) {
              // 防止回退合并导致的多语言重复，按当前语言截取
              items = locale === 'en' ? items.slice(-3) : items.slice(0, 3);
            }
            return (
              <article
                key={step.label}
                className="flex h-full flex-col rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)]"
              >
                <div
                  className={cn(
                    'relative mb-6 flex h-56 w-full overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-b shadow-inner',
                    visualStyles[key]?.gradient ?? visualStyles['step-1'].gradient
                  )}
                >
                  <Image
                    src={step.imageSrc ?? stepImages['step-1'].src}
                    alt={step.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 360px"
                    className="object-cover"
                    priority={idx === 0}
                  />
                </div>

                <div className="flex flex-col gap-5 text-left">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.45em] text-indigo-500">
                      {step.label}
                    </p>
                    <h3 className="sr-only">{step.label}</h3>
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
