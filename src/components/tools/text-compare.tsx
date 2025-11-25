"use client";

import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { diffWords } from 'diff';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { ArrowLeftRightIcon, Loader2Icon, UploadCloudIcon, XIcon } from 'lucide-react';

type DiffPart = {
  value: string;
  added?: boolean;
  removed?: boolean;
};

function countWords(str: string) {
  const cleaned = str.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

export function TextCompare() {
  const t = useTranslations('TextComparePage');
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [parts, setParts] = useState<DiffPart[] | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const fileInputARef = useRef<HTMLInputElement | null>(null);
  const fileInputBRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (event: ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('text/') && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      toast.error(t('errors.fileNotSupported'));
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setter(String(reader.result ?? ''));
    };
    reader.onerror = () => toast.error(t('errors.fileRead'));
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleCompare = () => {
    if (!textA.trim() || !textB.trim()) {
      toast.error(t('errors.missing'));
      return;
    }
    setIsComparing(true);
    try {
      const diff = diffWords(textA, textB);
      setParts(diff);
      toast.success(t('success'));
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (error) {
      console.error('diff error', error);
      toast.error(t('errors.generic'));
    } finally {
      setIsComparing(false);
    }
  };

  const swapTexts = () => {
    setTextA(textB);
    setTextB(textA);
    setParts(null);
  };

  const clearAll = () => {
    setTextA('');
    setTextB('');
    setParts(null);
  };

  const stats = useMemo(() => {
    const additions = parts?.filter((p) => p.added).reduce((sum, p) => sum + countWords(p.value), 0) ?? 0;
    const removals = parts?.filter((p) => p.removed).reduce((sum, p) => sum + countWords(p.value), 0) ?? 0;
    return {
      additions,
      removals,
      wordsA: countWords(textA),
      wordsB: countWords(textB),
    };
  }, [parts, textA, textB]);

  const leftParts = useMemo(() => {
    if (!parts) return null;
    return parts.filter((p) => !p.added);
  }, [parts]);

  const rightParts = useMemo(() => {
    if (!parts) return null;
    return parts.filter((p) => !p.removed);
  }, [parts]);

  return (
    <section className="relative py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-indigo-50" aria-hidden />

      <div className="relative z-10 mx-auto max-w-6xl px-4 lg:px-6 space-y-8">
        <div className="flex flex-col gap-3 text-center">
          <div className="flex justify-center">
            <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
              {t('hero.badge')}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t('hero.title')}
          </h1>
          <p className="text-base text-slate-600 sm:text-lg max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <InputCard
            label={t('input.original')}
            value={textA}
            onChange={setTextA}
            fileRef={fileInputARef}
            onFile={(e) => handleFile(e, setTextA)}
            placeholder={t('input.placeholderA')}
            uploadLabel={t('input.upload')}
          />
          <InputCard
            label={t('input.changed')}
            value={textB}
            onChange={setTextB}
            fileRef={fileInputBRef}
            onFile={(e) => handleFile(e, setTextB)}
            placeholder={t('input.placeholderB')}
            uploadLabel={t('input.upload')}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            <span className="mr-4">{t('stats.wordsA', { value: stats.wordsA })}</span>
            <span>{t('stats.wordsB', { value: stats.wordsB })}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={swapTexts} className="text-slate-600" disabled={isComparing}>
              <ArrowLeftRightIcon className="mr-2 h-4 w-4" />
              {t('controls.swap')}
            </Button>
            <Button variant="ghost" onClick={clearAll} className="text-slate-600" disabled={isComparing}>
              <XIcon className="mr-2 h-4 w-4" />
              {t('controls.clear')}
            </Button>
            <Button onClick={handleCompare} disabled={isComparing} className="bg-indigo-600 text-white hover:bg-indigo-500">
              {isComparing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  {t('hero.loading')}
                </>
              ) : (
                t('controls.compare')
              )}
            </Button>
          </div>
        </div>

        <div ref={resultsRef}>
        <Card className="border-slate-100 bg-white/95 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-3">
              {t('results.title')}
              <Badge variant="outline" className="border-slate-200 text-slate-600">
                {t('results.summary', { additions: stats.additions, removals: stats.removals })}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">{t('results.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            {parts ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <DiffView
                  title={t('results.removals')}
                  parts={leftParts}
                  highlightClass="bg-rose-100/80 text-rose-800"
                  emptyText={t('results.noRemovals')}
                  mode="removals"
                />
                <DiffView
                  title={t('results.additions')}
                  parts={rightParts}
                  highlightClass="bg-emerald-100/80 text-emerald-800"
                  emptyText={t('results.noAdditions')}
                  mode="additions"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-sm text-slate-500">
                {t('results.placeholder')}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </section>
  );
}

type InputCardProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  fileRef: React.RefObject<HTMLInputElement>;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  uploadLabel: string;
};

function InputCard({ label, value, onChange, fileRef, onFile, placeholder, uploadLabel }: InputCardProps) {
  return (
    <Card className="border-slate-100 bg-white/95 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold text-slate-800">{label}</CardTitle>
          <CardDescription className="text-xs text-slate-500">{value ? `${value.length.toLocaleString()} chars` : ''}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,text/plain"
            className="hidden"
            onChange={onFile}
          />
          <Button
            type="button"
            variant="ghost"
            className="gap-2 text-slate-600"
            onClick={() => fileRef.current?.click()}
          >
            <UploadCloudIcon className="h-4 w-4" />
            {uploadLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={14}
          className="min-h-[260px] resize-none border-slate-200 bg-white/90 font-mono"
        />
      </CardContent>
    </Card>
  );
}

type DiffViewProps = {
  title: string;
  parts: DiffPart[] | null;
  highlightClass: string;
  emptyText: string;
  mode: 'additions' | 'removals';
};

function DiffView({ title, parts, highlightClass, emptyText, mode }: DiffViewProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-2 text-sm font-semibold text-slate-700">{title}</div>
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-inner min-h-[160px]">
        {parts && parts.length > 0 ? (
          <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-slate-800">
            {parts.map((part, idx) => {
              const isAdded = !!part.added;
              const isRemoved = !!part.removed;
              const shouldHighlight = (mode === 'additions' && isAdded) || (mode === 'removals' && isRemoved);
              return (
                <span
                  key={idx}
                  className={shouldHighlight ? highlightClass + ' rounded-sm px-0.5' : ''}
                >
                  {part.value}
                </span>
              );
            })}
          </pre>
        ) : (
          <p className="text-sm text-slate-500">{emptyText}</p>
        )}
      </div>
    </div>
  );
}
