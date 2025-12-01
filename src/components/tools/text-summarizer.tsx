"use client";

import { useMemo, useRef, useState, useTransition } from 'react';
import { summarizeTextAction } from '@/actions/summarize-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { uploadFileFromBrowser } from '@/storage';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ClipboardPasteIcon, Link2Icon, Loader2Icon, UploadCloudIcon } from 'lucide-react';

function countWords(str: string) {
  const cleaned = str.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function TextSummarizerHero() {
  const t = useTranslations('TextSummarizerPage');
  const locale = useLocale();

  const [text, setText] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [lengthPercent, setLengthPercent] = useState<number[]>([50]);
  const [summary, setSummary] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [isUrlOpen, setIsUrlOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stats = useMemo(() => {
    return {
      words: countWords(text),
      chars: text.length,
    };
  }, [text]);

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (!clip) {
        toast.error(t('errors.emptyClipboard'));
        return;
      }
      setText(clip);
      toast.success(t('hero.pasted'));
    } catch (error) {
      toast.error(t('errors.clipboard')); 
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const { url } = await uploadFileFromBrowser(file, 'uploads/summaries');
      setFileUrl(url);
      setFileName(file.name);
      toast.success(t('hero.uploaded', { name: file.name }));
    } catch (error) {
      console.error(error);
      toast.error(t('errors.upload'));
    } finally {
      setIsUploading(false);
    }
  };

  const runSummarize = () => {
    if (!text.trim() && !websiteUrl && !fileUrl) {
      toast.error(t('errors.missing'));
      return;
    }
    setSummary('');
    startTransition(async () => {
      const result = await summarizeTextAction({
        text: text.trim() || undefined,
        websiteUrl: websiteUrl || undefined,
        fileUrl: fileUrl || undefined,
        fileName: fileName || undefined,
        lengthPercent: lengthPercent[0] ?? 50,
        locale,
      });

      const payload = result?.data;
      if (!payload?.success || !payload.data) {
        toast.error(payload?.error ?? t('errors.generic'));
        return;
      }
      setSummary(payload.data.summary);
      toast.success(t('hero.done'));
    });
  };

  return (
    <section className="relative py-16">
      <div className="relative z-10 mx-auto max-w-6xl px-4 lg:px-6 space-y-8">
        <div className="flex flex-col gap-3">
          <div className="text-sm text-slate-500">{t('hero.tagline')}</div>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t('hero.title')}
            </h1>
            <p className="text-base text-slate-600 sm:text-lg max-w-3xl">
              {t('hero.subtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm font-medium text-slate-700">{t('hero.lengthLabel')}</div>
            <div className="flex items-center gap-3 min-w-[200px]">
              <span className="text-xs text-slate-500">{t('hero.lengthShort')}</span>
              <Slider
                value={lengthPercent}
                onValueChange={(v) => setLengthPercent(v)}
                min={0}
                max={100}
              />
              <span className="text-xs text-slate-500">{t('hero.lengthLong')}</span>
              <span className="text-xs text-slate-600 font-medium tabular-nums w-10 text-right">{lengthPercent[0]}%</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-100 bg-white/95 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                {t('input.title')}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {t('input.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Popover open={isUrlOpen} onOpenChange={setIsUrlOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" size="sm" className="gap-2" disabled={isPending}>
                      <Link2Icon className="h-4 w-4" />
                      {t('input.addUrl')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 space-y-3" align="start">
                    <div className="text-sm font-medium text-slate-800">{t('input.urlLabel')}</div>
                    <Input
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder={t('input.urlPlaceholder')}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setWebsiteUrl(''); setIsUrlOpen(false); }}>
                        {t('input.clear')}
                      </Button>
                      <Button size="sm" onClick={() => setIsUrlOpen(false)}>
                        {t('input.apply')}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button variant="secondary" size="sm" className="gap-2" onClick={handlePaste} disabled={isPending}>
                  <ClipboardPasteIcon className="h-4 w-4" />
                  {t('input.paste')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      {t('input.uploading')}
                    </>
                  ) : (
                    <>
                      <UploadCloudIcon className="h-4 w-4" />
                      {t('input.upload')}
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleUpload(file);
                    }
                    event.target.value = '';
                  }}
                />
              </div>

              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('input.placeholder')}
                className="h-64 resize-none"
                disabled={isPending}
              />

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center gap-2">
                  <span>{t('input.stats.words', { value: stats.words })}</span>
                  <span>·</span>
                  <span>{t('input.stats.chars', { value: stats.chars })}</span>
                  {fileName ? (
                    <>
                      <span>·</span>
                      <span className="text-slate-600">{fileName}</span>
                    </>
                  ) : null}
                </div>
                <div className="text-emerald-600 font-medium">{t('input.free')}</div>
              </div>

              <div className="flex justify-end">
                <Button
                  size="lg"
                  className="bg-slate-900 text-white hover:bg-slate-800 px-6 rounded-full"
                  onClick={runSummarize}
                  disabled={isPending || isUploading}
                >
                  {isPending ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      {t('hero.loading')}
                    </>
                  ) : (
                    t('hero.cta')
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white/95 shadow-lg">
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800">{t('output.title')}</CardTitle>
                <CardDescription className="text-sm text-slate-500">{t('output.subtitle')}</CardDescription>
              </div>
              <div className="text-xs text-slate-500 tabular-nums">{lengthPercent[0]}%</div>
            </CardHeader>
            <CardContent className="flex h-full flex-col space-y-3">
              <div
                className="h-64 overflow-auto rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3"
                style={{ scrollbarGutter: 'stable' }}
              >
                {isPending ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-3 w-5/6 rounded bg-slate-200" />
                    <div className="h-3 w-4/6 rounded bg-slate-200" />
                    <div className="h-3 w-3/6 rounded bg-slate-200" />
                  </div>
                ) : summary ? (
                  <div className="prose prose-sm text-slate-800 max-w-none whitespace-pre-wrap">
                    {summary}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">
                    {t('output.empty')}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500">
                <div>{t('output.hint')}</div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!summary}
                  onClick={async () => {
                    if (!summary) return;
                    try {
                      await navigator.clipboard.writeText(summary);
                      toast.success(t('hero.done'));
                    } catch (error) {
                      toast.error(t('errors.clipboard'));
                    }
                  }}
                  className="text-slate-600 hover:text-slate-800"
                >
                  {t('output.copy')}
                </Button>
              </div>
              <div className="mt-auto flex flex-wrap justify-end gap-2 text-xs text-slate-500 pt-2">
                <span>{t('output.stats.sentences')}</span>
                <span>·</span>
                <span>{t('output.stats.words')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
