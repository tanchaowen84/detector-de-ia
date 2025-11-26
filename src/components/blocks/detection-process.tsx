"use client";

import { HeaderSection } from '@/components/layout/header-section';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import {
  ChevronRight,
  FileTextIcon,
  SearchIcon,
  SparklesIcon,
} from 'lucide-react';
import type { IconName } from 'lucide-react/dynamic';
import { useTranslations } from 'next-intl';

/**
 * Related Tools Section
 * 展示相关工具的横向三列布局
 */
type RelatedTool = {
  href: string;
  title: string;
  description: string;
  iconName: IconName;
};

type RelatedToolsProps = {
  i18nNamespace?: string;
  items?: RelatedTool[];
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  search: SearchIcon,
  'search-icon': SearchIcon,
  plagiarism: SearchIcon,
  file: FileTextIcon,
  text: FileTextIcon,
  compare: FileTextIcon,
  sparkles: SparklesIcon,
  humanizer: SparklesIcon,
};

export default function DetectionProcessSection({
  i18nNamespace = 'HomePage.relatedTools',
  items: itemsOverride,
}: RelatedToolsProps) {
  const t = useTranslations(i18nNamespace);

  const items = itemsOverride ?? [
    {
      href: '/plagiarism-detector',
      title: t('tools.plagiarism.title'),
      description: t('tools.plagiarism.description'),
      iconName: 'search',
    },
    {
      href: '/text-compare',
      title: t('tools.summarizer.title'),
      description: t('tools.summarizer.description'),
      iconName: 'file',
    },
    {
      href: '/word-counter',
      title: t('tools.humanizer.title'),
      description: t('tools.humanizer.description'),
      iconName: 'sparkles',
    },
  ];

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

        {/* 横向三工具布局 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
          {items.map((item) => {
            const Icon = iconMap[item.iconName] ?? SparklesIcon;
            return (
              <div key={item.href} className="text-center">
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 mb-6">
                    <Icon className="size-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {item.description}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 rounded-full"
                    asChild
                  >
                    <LocaleLink href={item.href}>
                      {t('tryNow')}
                      <ChevronRight className="!size-4" />
                    </LocaleLink>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
