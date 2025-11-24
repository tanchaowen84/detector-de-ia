import { HeaderSection } from '@/components/layout/header-section';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type * as React from 'react';

export default function HowItWorksSection() {
  const t = useTranslations('HomePage.howItWorks');

  return (
    <section id="how-it-works" className="px-4 py-16">
      <div className="mx-auto max-w-6xl space-y-8 lg:space-y-20">
        <HeaderSection
          title={t('title')}
          subtitle={t('subtitle')}
          subtitleAs="p"
          description={t('description' as any)}
          descriptionAs="p"
        />

        <div className="grid items-center gap-12 lg:grid-cols-5 lg:gap-24">
          <div className="lg:col-span-2">
            <ul className="divide-y border-y *:flex *:items-start *:gap-4 *:py-4">
              {[1, 2, 3].map((num) => {
                const key = `step-${num}` as const;
                const step = t.raw((`steps.${key}` as any)) as {
                  label: string;
                  items: { title: string; description: string }[];
                };
                return (
                  <li key={key}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0 mt-1">
                      {num}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">{step.label}</h3>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {step.items.map((item) => (
                          <li key={item.title} className="flex flex-col gap-1">
                            <p className="text-sm text-slate-900 font-semibold">
                              {item.title}
                            </p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {item.description}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-border/50 relative rounded-3xl border p-3 lg:col-span-3">
            <div className="bg-linear-to-b aspect-[4/3] relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
              <div className="h-full w-full rounded-[15px] bg-gradient-to-br from-muted/50 to-background overflow-hidden">
                <Image
                  src="https://cdn.flowchartai.org/static/blocks/howitworks1.png"
                  className="h-full w-full object-cover object-center"
                  alt="How FlowChart AI Works - Step by Step Process"
                  width={800}
                  height={600}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="gap-2">
            <LocaleLink href="/canvas">
              {t('getStarted' as any)}
              <ChevronRight className="!size-4" />
            </LocaleLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
