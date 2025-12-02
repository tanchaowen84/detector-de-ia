"use client";

import { useMemo, useRef, useState, useTransition } from 'react';
import { humanizeTextAction } from '@/actions/humanize-text';
import { PricingTable } from '@/components/pricing/pricing-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LocaleLink } from '@/i18n/navigation';
import { useSession } from '@/hooks/use-session';
import { uploadFileFromBrowser } from '@/storage';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ClipboardPasteIcon, Loader2Icon, UploadCloudIcon } from 'lucide-react';

function countWords(str: string) {
  const cleaned = str.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function HumanizerHero() {
  const t = useTranslations('HumanizerPage');
  const session = useSession();

  const [text, setText] = useState('');
  const [file, setFile] = useState<{ name: string; url: string } | null>(null);
  const [output, setOutput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stats = useMemo(
    () => ({ words: countWords(text), chars: text.length }),
    [text]
  );

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (!clip) {
        toast.error(t('errors.clipboard'));
        return;
      }
      setText(clip);
      toast.success(t('hero.pasted'));
    } catch (error) {
      toast.error(t('errors.clipboard'));
    }
  };

  const handleUpload = async (file: File) => {
    if (!session?.user) {
      toast.error(t('errors.loginForUpload'));
      return;
    }
    setIsUploading(true);
    try {
      const { url } = await uploadFileFromBrowser(file, 'humanizer');
      setFile({ name: file.name, url });
      toast.success(t('input.uploaded', { name: file.name }));
    } catch (error) {
      console.error(error);
      toast.error(t('errors.upload'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRun = () => {
    if (!text.trim() && !file) {
      toast.error(t('errors.missing'));
      return;
    }
    setOutput('');
    startTransition(async () => {
      const res = await humanizeTextAction({
        text: text.trim() || undefined,
        fileUrl: file?.url,
        fileName: file?.name,
      });

      const payload = res?.data;
      if (!payload) {
        toast.error(t('errors.generic'));
        return;
      }

      if (!payload.success) {
        if ((payload as any).errorCode === 'INSUFFICIENT_CREDITS') {
          if (session?.user) {
            setShowUpgradeModal(true);
          } else {
            setShowGuestModal(true);
          }
        }
        toast.error(payload.error ?? t('errors.generic'));
        return;
      }

      setOutput(payload.data.output);
      toast.success(t('hero.done'));
    });
  };

  return (
    <section className="relative py-16">
      <div className="relative z-10 mx-auto max-w-6xl px-4 lg:px-6 space-y-10">
        <div className="flex flex-col gap-3">
          <div className="inline-flex w-fit rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-medium shadow-sm">
            {t('hero.badge')}
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t('hero.title')}
            </h1>
            <p className="text-base text-slate-600 sm:text-lg max-w-3xl">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <div className="flex flex-col h-full">
            <Card className="border-slate-100 bg-white/95 shadow-lg h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  {t('input.title')}
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  {t('input.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col h-full space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={handlePaste}
                    disabled={isPending}
                  >
                    <ClipboardPasteIcon className="h-4 w-4" />
                    {t('input.paste')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending || isUploading || !session?.user}
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
                      const f = event.target.files?.[0];
                      if (f) {
                        void handleUpload(f);
                      }
                      event.target.value = '';
                    }}
                  />
                  {!session?.user ? (
                    <span className="text-xs text-slate-500 self-center">
                      {t('input.loginNotice')}
                    </span>
                  ) : null}
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
                    {file?.name ? (
                      <>
                        <span>·</span>
                        <span className="text-slate-600">{file.name}</span>
                      </>
                    ) : null}
                  </div>
                  <div className="text-slate-500">
                    {t('input.hint')}
                  </div>
                </div>

                <div className="mt-auto">
                  <Button
                    size="lg"
                    className="bg-slate-900 text-white hover:bg-slate-800 px-6 rounded-full"
                    onClick={handleRun}
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
          </div>

          <div className="flex flex-col h-full">
            <Card className="border-slate-100 bg-white/95 shadow-lg h-full flex flex-col">
              <CardHeader className="pb-3">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    {t('output.title')}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    {t('output.subtitle')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex h-full flex-col space-y-3">
                <div
                  className="flex-1 min-h-[260px] overflow-auto rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3"
                  style={{ scrollbarGutter: 'stable' }}
                >
                  {isPending ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-3 w-5/6 rounded bg-slate-200" />
                      <div className="h-3 w-4/6 rounded bg-slate-200" />
                      <div className="h-3 w-3/6 rounded bg-slate-200" />
                    </div>
                  ) : output ? (
                    <div className="prose prose-sm text-slate-800 max-w-none whitespace-pre-wrap">
                      {output}
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
                    disabled={!output}
                    onClick={async () => {
                      if (!output) return;
                      try {
                        await navigator.clipboard.writeText(output);
                        toast.success(t('output.copied'));
                      } catch (error) {
                        toast.error(t('errors.clipboard'));
                      }
                    }}
                    className="text-slate-600 hover:text-slate-800"
                  >
                    {t('output.copy')}
                  </Button>
                </div>

                <div className="mt-auto">
                  <LocaleLink href="/" className="no-underline">
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-full border-slate-200 text-slate-800 hover:bg-slate-100 w-full lg:w-auto"
                    >
                      {t('hero.secondaryCta')}
                    </Button>
                  </LocaleLink>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{t('modals.upgrade.title')}</DialogTitle>
              <DialogDescription>{t('modals.upgrade.subtitle')}</DialogDescription>
            </DialogHeader>
            <PricingTable variant="modal" />
          </DialogContent>
        </Dialog>

        <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('modals.guest.title')}</DialogTitle>
              <DialogDescription>{t('modals.guest.subtitle')}</DialogDescription>
            </DialogHeader>
            <div className="text-sm text-slate-600">{t('modals.guest.body')}</div>
            <div className="flex justify-end">
              <LocaleLink href="/auth/login" className="no-underline">
                <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-full">
                  {t('modals.guest.cta')}
                </Button>
              </LocaleLink>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 -top-20 h-64 w-64 rounded-full bg-purple-200 blur-3xl opacity-40" />
        <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-amber-200 blur-3xl opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(99,102,241,0.05)_1px,_transparent_1px)] bg-[length:24px_24px]" />
      </div>
    </section>
  );
}
