'use client';

import { HeaderSection } from '@/components/layout/header-section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { IconName } from 'lucide-react/dynamic';
import { useLocale, useTranslations } from 'next-intl';

type FAQItem = {
  id: string;
  icon: IconName;
  question: string;
  answer: string;
};

type FaqSectionProps = {
  i18nNamespace?: string;
  items?: FAQItem[];
};

export default function FaqSection({
  i18nNamespace = 'HomePage.faqs',
  items: itemsOverride,
}: FaqSectionProps) {
  const t = useTranslations(i18nNamespace);

  const faqItems: FAQItem[] = itemsOverride ?? [
    {
      id: 'item-1',
      icon: 'calendar-clock',
      question: t('items.item-1.question'),
      answer: t('items.item-1.answer'),
    },
    {
      id: 'item-2',
      icon: 'wallet',
      question: t('items.item-2.question'),
      answer: t('items.item-2.answer'),
    },
    {
      id: 'item-3',
      icon: 'refresh-cw',
      question: t('items.item-3.question'),
      answer: t('items.item-3.answer'),
    },
    {
      id: 'item-4',
      icon: 'hand-coins',
      question: t('items.item-4.question'),
      answer: t('items.item-4.answer'),
    },
    {
      id: 'item-5',
      icon: 'mail',
      question: t('items.item-5.question'),
      answer: t('items.item-5.answer'),
    },
    {
      id: 'item-6',
      icon: 'network',
      question: t('items.item-6.question'),
      answer: t('items.item-6.answer'),
    },
    {
      id: 'item-7',
      icon: 'lightbulb',
      question: t('items.item-7.question'),
      answer: t('items.item-7.answer'),
    },
    {
      id: 'item-8',
      icon: 'users',
      question: t('items.item-8.question'),
      answer: t('items.item-8.answer'),
    },
    {
      id: 'item-9',
      icon: 'upload',
      question: t('items.item-9.question'),
      answer: t('items.item-9.answer'),
    },
    {
      id: 'item-10',
      icon: 'shield-question',
      question: t('items.item-10.question'),
      answer: t('items.item-10.answer'),
    },
  ];

  return (
    <section className="relative py-20 text-slate-900">

      <div className="relative z-10 mx-auto max-w-4xl px-4">
        <HeaderSection
          title={t('title')}
          titleAs="h2"
          subtitle={t('subtitle')}
          subtitleAs="p"
          className="text-center mb-16"
        />

        <div className="mx-auto max-w-4xl">
          <Accordion
            type="single"
            collapsible
            className="w-full divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-slate-100 last:border-b-0"
              >
                <AccordionTrigger className="cursor-pointer px-8 py-6 text-left text-base font-medium text-slate-900 hover:no-underline hover:text-indigo-600 data-[state=open]:text-indigo-600">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6 text-base text-slate-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
