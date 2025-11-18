import { HeaderSection } from '@/components/layout/header-section';
import {
  CpuIcon,
  FingerprintIcon,
  PencilIcon,
  Settings2Icon,
  SparklesIcon,
  ZapIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * https://nsui.irung.me/features
 * pnpm dlx shadcn@canary add https://nsui.irung.me/r/features-4.json
 */
export default function Features3Section() {
  const t = useTranslations('HomePage.features3');

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
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg">
            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-indigo-100 blur-xl group-hover:bg-indigo-200 transition-colors" />
            <div className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
                <ZapIcon className="size-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                {t('items.item-1.title')}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {t('items.item-1.description')}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg">
            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-indigo-100 blur-xl group-hover:bg-indigo-200 transition-colors" />
            <div className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
                <CpuIcon className="size-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                {t('items.item-2.title')}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {t('items.item-2.description')}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg">
            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-indigo-100 blur-xl group-hover:bg-indigo-200 transition-colors" />
            <div className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
                <FingerprintIcon className="size-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                {t('items.item-3.title')}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {t('items.item-3.description')}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg">
            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-indigo-100 blur-xl group-hover:bg-indigo-200 transition-colors" />
            <div className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
                <PencilIcon className="size-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                {t('items.item-4.title')}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {t('items.item-4.description')}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg">
            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-indigo-100 blur-xl group-hover:bg-indigo-200 transition-colors" />
            <div className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
                <Settings2Icon className="size-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                {t('items.item-5.title')}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {t('items.item-5.description')}
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg">
            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-indigo-100 blur-xl group-hover:bg-indigo-200 transition-colors" />
            <div className="relative z-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
                <SparklesIcon className="size-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-slate-900">
                {t('items.item-6.title')}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {t('items.item-6.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
