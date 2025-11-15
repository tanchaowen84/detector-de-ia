import { HeaderSection } from '@/components/layout/header-section';
import {
  BookOpenIcon,
  GraduationCapIcon,
  PenToolIcon,
  SearchIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

/**
 * AI Detector Use Cases Section
 * 展示不同用户群体的使用场景
 */
export default function UseCasesSection() {
  const t = useTranslations('HomePage.useCases');

  return (
    <section className="relative isolate overflow-hidden bg-slate-50 py-20 text-slate-900">
      {/* 装饰性背景 */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,_rgba(99,102,241,0.1),_transparent_50%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <HeaderSection
          title={t('title')}
          subtitle={t('subtitle')}
          subtitleAs="h2"
          description={t('description')}
          descriptionAs="p"
          className="text-center mb-16"
        />

        <div className="grid items-center gap-12 lg:grid-cols-5 lg:gap-24">
          {/* 左侧文字内容 */}
          <div className="lg:col-span-2">
            <div className="lg:pr-8">
              <h2 className="text-4xl font-bold text-slate-900 leading-tight">
                {t('title')}
              </h2>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                {t('description')}
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <div className="group relative p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
                    <GraduationCapIcon className="size-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {t('cases.students.title')}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {t('cases.students.description')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-sm">
                    <BookOpenIcon className="size-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {t('cases.teachers.title')}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {t('cases.teachers.description')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
                    <PenToolIcon className="size-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {t('cases.content.title')}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {t('cases.content.description')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-sm">
                    <SearchIcon className="size-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {t('cases.seo.title')}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {t('cases.seo.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧图片 */}
          <div className="relative lg:col-span-3">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] relative bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-4xl mb-4">👥</div>
                  <div className="text-slate-800 text-sm font-medium">Professionales Usando IA Detector</div>
                  <div className="text-slate-600 text-xs mt-2">Estudiantes, profesores, creadores, especialistas SEO</div>
                </div>

                {/* 装饰性渐变覆盖层 */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent" />
              </div>

              {/* 装饰性统计卡片 */}
              <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="text-2xl font-bold text-indigo-600">99%</div>
                  <div className="text-sm text-slate-600">Precisión</div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="text-2xl font-bold text-purple-600">1M+</div>
                  <div className="text-sm text-slate-600">Análisis</div>
                </div>
              </div>

              {/* 边框光效 */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30 pointer-events-none" />
            </div>

            {/* 装饰性元素 */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
