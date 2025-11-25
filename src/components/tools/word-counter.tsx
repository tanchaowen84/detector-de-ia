"use client";

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CopyIcon, SparklesIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

type Stats = {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingMinutes: number;
};

function computeStats(text: string): Stats {
  const trimmed = text.trim();
  const words = trimmed ? (trimmed.match(/[^\s]+/g) || []).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s+/g, '').length;
  const sentences = trimmed ? (trimmed.split(/[.!?¡¿。！？]+/).filter(Boolean).length) : 0;
  const paragraphs = trimmed ? (trimmed.split(/\n\s*\n/).filter(Boolean).length || 1) : 0;
  const readingMinutes = words > 0 ? words / 200 : 0;

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingMinutes,
  };
}

export function WordCounter() {
  const t = useTranslations('WordCounterPage');
  const [text, setText] = useState('');
  const stats = useMemo(() => computeStats(text), [text]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('hero.copied'));
    } catch (error) {
      toast.error('No se pudo copiar');
    }
  };

  return (
    <section className="relative py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-amber-50" aria-hidden />

      <div className="relative z-10 mx-auto max-w-5xl px-4 lg:px-6">
        <div className="flex flex-col gap-3 text-center">
          <div className="flex justify-center">
            <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
              {t('hero.badge')}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t('hero.title')}
          </h1>
          <p className="text-base text-slate-600 sm:text-lg">
            {t('hero.subtitle')}
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <Card className="border-slate-100 bg-white/95 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-800">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-indigo-500" />
                  {t('hero.title')}
                </div>
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {t('footer.free')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('hero.placeholder')}
                rows={12}
                className="min-h-[260px] resize-none border-slate-200 bg-white/90"
              />
              <div className="flex flex-wrap gap-2 justify-end text-sm">
                <Button
                  variant="ghost"
                  className="text-slate-500 hover:text-slate-800"
                  onClick={() => setText('')}
                  disabled={!text}
                >
                  <XIcon className="mr-2 h-4 w-4" />
                  {t('hero.clear')}
                </Button>
                <Button
                  variant="outline"
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  onClick={handleCopy}
                  disabled={!text}
                >
                  <CopyIcon className="mr-2 h-4 w-4" />
                  {t('hero.copy')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white/95 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-800">
                {t('stats.title')}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {t('footer.privacy')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm sm:text-base">
                <Stat label={t('stats.words')} value={stats.words} />
                <Stat label={t('stats.characters')} value={stats.characters} />
                <Stat label={t('stats.charactersNoSpaces')} value={stats.charactersNoSpaces} />
                <Stat label={t('stats.sentences')} value={stats.sentences} />
                <Stat label={t('stats.paragraphs')} value={stats.paragraphs} />
                <Stat label={t('stats.readingTime')} value={t('stats.minutes', { value: stats.readingMinutes.toFixed(1) })} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

interface StatProps {
  label: string;
  value: number | string;
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-slate-700 shadow-inner">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
