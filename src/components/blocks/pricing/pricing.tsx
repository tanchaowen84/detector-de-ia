import { HeaderSection } from '@/components/layout/header-section';
import { PricingTable } from '@/components/pricing/pricing-table';
import { useTranslations } from 'next-intl';

export default function PricingSection() {
  const t = useTranslations('HomePage.pricing');

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
