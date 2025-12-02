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
  CreditCardIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type ToolItem = {
  key: string;
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
  { key: 'pricing', href: '/pricing', icon: CreditCardIcon },
  { key: 'more', href: '/#features', icon: MoreHorizontalIcon },
];

function isActive(pathname: string, locale: string, href: string) {
  // pathname like /es/ai-humanizer
  const base = `/${locale}`;
  if (href === '/') return pathname === base || pathname === `${base}/`;
  return pathname === `${base}${href}` || pathname.startsWith(`${base}${href}/`);
}

function RailItems({ compact, variant = 'column' }: { compact?: boolean; variant?: 'column' | 'grid' }) {
  const t = useTranslations('Marketing.sidebar');
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <div
      className={cn(
        variant === 'column'
          ? 'flex flex-col gap-2'
          : 'grid grid-cols-3 gap-3'
      )}
    >
      {TOOL_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, locale, item.href);
        return (
          <LocaleLink key={item.key} href={item.href} className="no-underline">
            <Button
              variant="ghost"
              className={cn(
                'w-[72px] flex flex-col items-center gap-1 rounded-2xl border border-transparent bg-white/90 text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-200 backdrop-blur',
                active && 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-md'
              )}
            >
              <Icon className="h-5 w-5" />
              {!compact && (
                <span className="text-[11px] font-medium leading-tight text-center">
                  {t(`${item.key}.title`)}
                </span>
              )}
            </Button>
          </LocaleLink>
        );
      })}
    </div>
  );
}

export function ToolRail() {
  const t = useTranslations('Marketing.sidebar');

  return (
    <>
      {/* Desktop / tablet */}
      <div className="pointer-events-none fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 md:block">
        <div className="pointer-events-auto rounded-[28px] border border-slate-100 bg-white/90 p-3 shadow-xl backdrop-blur">
          <RailItems />
        </div>
      </div>

      {/* Mobile FAB + sheet */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="h-12 w-12 rounded-full bg-slate-900 text-white shadow-xl">
              <MoreHorizontalIcon className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{t('more.title')}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] rounded-t-3xl">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-200" />
            <RailItems compact variant="grid" />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
