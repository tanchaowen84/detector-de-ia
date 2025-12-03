"use client";

import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  ActivityIcon,
  FileSearchIcon,
  SparklesIcon,
  ScissorsIcon,
  ReplaceIcon,
  HashIcon,
  BookOpenCheckIcon,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const TOOL_I18N_KEYS = {
  detector: 'detector',
  plagiarism: 'plagiarism',
  humanizer: 'humanizer',
  summarizer: 'summarizer',
  compare: 'compare',
  counter: 'counter',
  apa: 'apa',
} as const;

type ToolItem = {
  key: keyof typeof TOOL_I18N_KEYS;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const TOOL_ITEMS: ToolItem[] = [
  { key: 'detector', href: '/', icon: ActivityIcon },
  { key: 'plagiarism', href: '/plagiarism-detector', icon: FileSearchIcon },
  { key: 'humanizer', href: '/ai-humanizer', icon: SparklesIcon },
  { key: 'summarizer', href: '/ai-summarizer', icon: ScissorsIcon },
  { key: 'compare', href: '/text-compare', icon: ReplaceIcon },
  { key: 'counter', href: '/word-counter', icon: HashIcon },
  { key: 'apa', href: '/apa-generator', icon: BookOpenCheckIcon },
];

function isActive(pathname: string, locale: string, href: string) {
  // pathname like /es/ai-humanizer
  const base = `/${locale}`;
  if (href === '/') return pathname === base || pathname === `${base}/`;
  return pathname === `${base}${href}` || pathname.startsWith(`${base}${href}/`);
}

function RailItems() {
  const t = useTranslations('Marketing.sidebar');
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <div className="flex flex-col">
      {TOOL_ITEMS.map((item, idx) => {
        const Icon = item.icon;
        const active = isActive(pathname, locale, item.href);
        return (
          <div key={item.key}>
            <LocaleLink href={item.href} className="no-underline">
              <Button
                variant="ghost"
                className={cn(
                  'w-full h-12 flex flex-col items-center justify-center gap-1 rounded-lg border border-transparent bg-transparent text-slate-700 font-medium transition-all duration-150 hover:-translate-y-0.5 hover:drop-shadow-sm',
                  active && 'text-indigo-700 drop-shadow-md'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] leading-tight text-center">{t(`${item.key}.title`)}</span>
              </Button>
            </LocaleLink>
            {idx < TOOL_ITEMS.length - 1 && (
              <div className="mx-auto my-1 h-px w-10 bg-slate-200/70" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ToolRail() {
  const t = useTranslations('Marketing.sidebar');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('tool-rail-collapsed');
    if (stored === '1') setCollapsed(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tool-rail-collapsed', next ? '1' : '0');
    }
  };

  return (
    <>
      {/* Desktop / tablet */}
      <div className="pointer-events-none fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 md:block">
        {collapsed ? (
          <div className="pointer-events-auto flex flex-col items-center gap-2">
            <Button
              size="icon"
              className="h-10 w-10 rounded-full bg-slate-900 text-white shadow-lg"
              onClick={toggle}
            >
              ▶
              <span className="sr-only">{t('trigger')}</span>
            </Button>
          </div>
        ) : (
          <div className="pointer-events-auto w-[88px] rounded-[26px] bg-white/80 p-3 shadow-lg shadow-indigo-100 backdrop-blur">
            <div className="mb-2 flex justify-center">
              <Button
                variant="ghost"
                className="h-6 rounded-full px-2 text-[11px] text-slate-600 hover:text-slate-800"
                onClick={toggle}
              >
                {t('hide')}
              </Button>
            </div>
            <RailItems />
          </div>
        )}
      </div>

      {/* Mobile FAB + sheet */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="h-12 w-12 rounded-full bg-slate-900 text-white shadow-xl">
              ⋯
              <span className="sr-only">{t('trigger')}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] rounded-t-3xl">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <RailItems />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
