'use client';

import { HeaderSection } from '@/components/layout/header-section';
import {
  CpuIcon,
  FingerprintIcon,
  type LucideIcon,
  PencilIcon,
  Settings2Icon,
  SparklesIcon,
  ZapIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type FeaturesSectionProps = {
  i18nNamespace?: string;
  items?: FeatureItem[];
};

/**
 * https://nsui.irung.me/features
 * pnpm dlx shadcn@canary add https://nsui.irung.me/r/features-4.json
 */
export default function Features3Section({
  i18nNamespace = 'HomePage.features3',
  items: itemsOverride,
}: FeaturesSectionProps) {
  const t = useTranslations(i18nNamespace);

  return (
    <section className="relative py-20 text-slate-900">
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <HeaderSection
          title={t('title')}
          subtitle={t('subtitle')}
          subtitleAs="p"
          description={t('description')}
          descriptionAs="p"
          className="text-center mb-16"
        />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {(
            itemsOverride ?? [
              {
                title: t('items.item-1.title'),
                description: t('items.item-1.description'),
                icon: ZapIcon,
              },
              {
                title: t('items.item-2.title'),
                description: t('items.item-2.description'),
                icon: CpuIcon,
              },
              {
                title: t('items.item-3.title'),
                description: t('items.item-3.description'),
                icon: FingerprintIcon,
              },
              {
                title: t('items.item-4.title'),
                description: t('items.item-4.description'),
                icon: PencilIcon,
              },
              {
                title: t('items.item-5.title'),
                description: t('items.item-5.description'),
                icon: Settings2Icon,
              },
              {
                title: t('items.item-6.title'),
                description: t('items.item-6.description'),
                icon: SparklesIcon,
              },
            ]
          ).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg"
              >
                <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-indigo-100 blur-xl group-hover:bg-indigo-200 transition-colors" />
                <div className="relative z-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
                    <Icon className="size-6 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
