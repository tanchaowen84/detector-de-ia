"use client";

import { HeaderSection } from '@/components/layout/header-section';
import { PricingTable } from '@/components/pricing/pricing-table';
import { useTranslations } from 'next-intl';

type PricingSectionProps = {
  i18nNamespace?: string;
};

export default function PricingSection({ i18nNamespace = 'HomePage.pricing' }: PricingSectionProps) {
  const t = useTranslations(i18nNamespace as any) as unknown as (key: string) => string;

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

        <PricingTable />
      </div>
    </section>
  );
}
