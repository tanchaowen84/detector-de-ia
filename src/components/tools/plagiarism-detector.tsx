"use client";

import { useMemo, useRef, useState, useTransition } from 'react';
import { detectPlagiarismAction } from '@/actions/detect-plagiarism';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { uploadFileFromBrowser } from '@/storage';
import { cn } from '@/lib/utils';
import type { PlagiarismResponse } from '@/lib/winston';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  ClipboardPasteIcon,
  Globe2Icon,
  Link2Icon,
  Loader2Icon,
  ShieldAlertIcon,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react';

type PlagiarismResult = PlagiarismResponse;

export function PlagiarismDetector() {
  const t = useTranslations('PlagiarismPage');
  const [text, setText] = useState('');
  const [file, setFile] = useState<{ name: string; url: string } | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [websiteInput, setWebsiteInput] = useState('');
  const [isWebsiteOpen, setWebsiteOpen] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [sources, setSources] = useState<PlagiarismResult['sources'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const hasInput = text.trim().length > 0 || file || website;
  const plagiarismScore = result?.result?.score ?? null;

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (!clip) {
        toast.info(t('errors.clipboardEmpty'));
        return;
      }
      setText(clip);
      setFile(null);
      setWebsite(null);
      setResult(null);
      setSources(null);
    } catch {
      toast.error(t('errors.clipboardFail'));
    }
  };

  const handleUpload = () => {
    if (isPending) return;
    fileRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      toast.loading(t('uploading'), { id: 'uploading' });
      const uploaded = await uploadFileFromBrowser(f, 'plagiarism');
      setFile({ name: f.name, url: uploaded.url });
      setText('');
      setWebsite(null);
      setResult(null);
      setSources(null);
      toast.success(t('uploadSuccess'), { id: 'uploading' });
    } catch (err) {
      console.error(err);
      toast.error(t('uploadFail'), { id: 'uploading' });
    } finally {
      e.target.value = '';
    }
  };

  const applyWebsite = () => {
    const value = websiteInput.trim();
    if (!value) {
      setWebsite(null);
      setWebsiteOpen(false);
      return;
    }
    try {
      const url = new URL(value.startsWith('http') ? value : `https://${value}`);
      setWebsite(url.href);
      setWebsiteOpen(false);
      setText('');
      setFile(null);
      setResult(null);
      setSources(null);
      toast.success(t('urlReady'));
    } catch {
      toast.error(t('errors.invalidUrl'));
    }
  };

  const clearWebsite = () => {
    setWebsite(null);
    setWebsiteInput('');
  };

  const clearAll = () => {
    setText('');
    setFile(null);
    setWebsite(null);
    setWebsiteInput('');
    setResult(null);
    setSources(null);
    setError(null);
  };

  const handleDetect = () => {
    if (!hasInput) {
      toast.warning(t('errors.noInput'));
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await detectPlagiarismAction({
          text: text.trim() || undefined,
          fileUrl: file?.url,
          fileName: file?.name,
          websiteUrl: website ?? undefined,
        });
        const payload = res?.data;

        if (!payload) {
          const msg = (res as any)?.serverError ?? t('errors.generic');
          setError(msg);
          toast.error(msg);
          return;
        }

        if (!payload.success) {
          const msg = payload.error ?? t('errors.generic');
          setError(msg);
          toast.error(msg);
          return;
        }

        setResult(payload.result as PlagiarismResult);
        setSources(payload.result?.sources ?? null);
        toast.success(t('success'));
      } catch (err) {
        console.error(err);
        setError(t('errors.generic'));
        toast.error(t('errors.generic'));
      }
    });
  };

  const sentencesFound = result?.result?.totalPlagiarismWords ?? 0;
  const summaryChips = useMemo(() => {
    if (!result) return [];
    return [
      {
        label: t('summary.sources', { value: result.result?.sourceCounts ?? 0 }),
      },
      {
        label: t('summary.words', { value: result.result?.totalPlagiarismWords ?? 0 }),
      },
      {
        label: t('summary.identical', { value: result.result?.identicalWordCounts ?? 0 }),
      },
      {
        label: t('summary.similar', { value: result.result?.similarWordCounts ?? 0 }),
      },
    ];
  }, [result, t]);

  return (
    <section className="relative py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-white to-purple-50" aria-hidden />

      <div className="relative z-10 mx-auto max-w-6xl px-4 lg:px-6 space-y-10">
        <div className="flex flex-col gap-3 text-center">
          <div className="flex justify-center">
            <Badge className="border-purple-200 bg-purple-50 text-purple-700">
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

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-slate-100 bg-white/95 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-800">
                {t('input.title')}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {t('input.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="gap-2 rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={() => setWebsiteOpen(true)}
                  disabled={isPending}
                >
                  <Link2Icon className="h-4 w-4" />
                  {t('input.url')}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={handleUpload}
                  disabled={isPending}
                >
                  <UploadCloudIcon className="h-4 w-4" />
                  {t('input.file')}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 rounded-full border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={handlePaste}
                  disabled={isPending}
                >
                  <ClipboardPasteIcon className="h-4 w-4" />
                  {t('input.paste')}
                </Button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".txt,.pdf,.doc,.docx,.md,.rtf"
                className="hidden"
                onChange={onFileChange}
              />

              <Popover open={isWebsiteOpen} onOpenChange={setWebsiteOpen}>
                <PopoverTrigger asChild>
                  <span />
                </PopoverTrigger>
                <PopoverContent className="w-80 space-y-3">
                  <Input
                    value={websiteInput}
                    onChange={(e) => setWebsiteInput(e.target.value)}
                    placeholder="https://ejemplo.com/articulo"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={clearWebsite}>
                      {t('input.urlClear')}
                    </Button>
                    <Button size="sm" onClick={applyWebsite}>
                      {t('input.urlApply')}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {(file || website) && (
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  {file && (
                    <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                      <UploadCloudIcon className="h-3.5 w-3.5" />
                      <span className="truncate">{file.name}</span>
                      <button onClick={() => setFile(null)} aria-label="clear file">
                        <XIcon className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </span>
                  )}
                  {website && (
                    <span className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                      <Globe2Icon className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[240px]">{website}</span>
                      <button onClick={clearWebsite} aria-label="clear website">
                        <XIcon className="h-3.5 w-3.5 text-indigo-500" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              <Textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setResult(null);
                  setSources(null);
                  setError(null);
                }}
                rows={10}
                placeholder={t('input.placeholder')}
                className="min-h-[240px] resize-none border-slate-200 bg-white/90"
              />
              {error && <p className="text-sm text-rose-500">{error}</p>}

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                <span>
                  {t('input.count', { value: text.length.toLocaleString() })}
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={clearAll} className="text-slate-600" disabled={isPending}>
                    <XIcon className="mr-2 h-4 w-4" />
                    {t('controls.clear')}
                  </Button>
                  <Button
                    onClick={handleDetect}
                    disabled={isPending || !hasInput}
                    className="bg-purple-600 text-white hover:bg-purple-500"
                  >
                    {isPending ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> {t('controls.detecting')}
                      </>
                    ) : (
                      t('controls.detect')
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white/95 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                {t('results.title')}
                {result?.attackDetected && (
                  <Badge variant="outline" className="border-amber-200 text-amber-700 gap-1">
                    <ShieldAlertIcon className="h-4 w-4" /> {t('results.attack')}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">{t('results.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center">
                <p className="text-sm text-slate-500">{t('results.scoreLabel')}</p>
                <p className="text-5xl font-semibold text-slate-900">
                  {plagiarismScore !== null ? `${plagiarismScore.toFixed(1)}%` : '--'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {result?.scanInformation?.language ?? 'auto'}
                </p>
              </div>

              {result && (
                <div className="flex flex-wrap gap-2">
                  {summaryChips.map((chip, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-700">
                      {chip.label}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-inner min-h-[160px] space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{t('results.sources')}</span>
                  <span className="text-xs">{sources?.length ?? 0} {t('results.count')}</span>
                </div>
                {sources?.length ? (
                  <div className="space-y-3 max-h-72 overflow-auto pr-1">
                    {sources.map((src, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 p-3 bg-slate-50/80">
                        <div className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-800">
                          <span className="truncate">{src.title || src.url || t('results.untitled')}</span>
                          <span className="text-purple-700 font-bold">{(src.score ?? 0).toFixed(1)}%</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{src.url}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                          {src.plagiarismWords !== undefined && (
                            <Badge variant="outline" className="border-slate-200 text-slate-600">
                              {t('results.matchWords', { value: src.plagiarismWords })}
                            </Badge>
                          )}
                          {src.identicalWordCounts !== undefined && (
                            <Badge variant="outline" className="border-slate-200 text-slate-600">
                              {t('results.identicalWords', { value: src.identicalWordCounts })}
                            </Badge>
                          )}
                          {src.similarWordCounts !== undefined && (
                            <Badge variant="outline" className="border-slate-200 text-slate-600">
                              {t('results.similarWords', { value: src.similarWordCounts })}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">{t('results.placeholder')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
