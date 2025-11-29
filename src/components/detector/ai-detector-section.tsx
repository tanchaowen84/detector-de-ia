'use client';

import { detectAIContentAction } from '@/actions/detect-ai';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import type { DetectAIContentResult } from '@/lib/winston';
import { useSession } from '@/hooks/use-session';
import { authClient } from '@/lib/auth-client';
import { getUrlWithLocaleInCallbackUrl } from '@/lib/urls/urls';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { useLocale } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PricingTable } from '@/components/pricing/pricing-table';
import { GoogleIcon } from '@/components/icons/google';
import { GitHubIcon } from '@/components/icons/github';
import {
  ClipboardPasteIcon,
  FingerprintIcon,
  Link2Icon,
  Loader2Icon,
  SparklesIcon,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react';
import type { CSSProperties, ChangeEvent, UIEvent } from 'react';
import { useMemo, useRef, useState, useTransition } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { uploadFileFromBrowser } from '@/storage';

type TranslationFunction = (key: string) => string;

const MAX_CHARS_GUEST = 1000;
const MAX_CHARS_AUTH = 4000;

type SampleTextKey = 'sampleTexts.iaEssay' | 'sampleTexts.humanArticle' | 'sampleTexts.mixedEmail';

const samplePresets = [
  {
    value: 'ia-ensayo',
    labelKey: 'samples.iaEssay' as const,
    textKey: 'sampleTexts.iaEssay' as SampleTextKey,
  },
  {
    value: 'humano-articulo',
    labelKey: 'samples.humanArticle' as const,
    textKey: 'sampleTexts.humanArticle' as SampleTextKey,
  },
  {
    value: 'correo-mixto',
    labelKey: 'samples.mixedEmail' as const,
    textKey: 'sampleTexts.mixedEmail' as SampleTextKey,
  },
];

type EvaluationKey = 'evaluation.aiLikely' | 'evaluation.mixedContent' | 'evaluation.humanLikely';
type ExplanationKey = 'evaluation.aiExplanation' | 'evaluation.mixedExplanation' | 'evaluation.humanExplanation';

const evaluationCopy = [
  {
    threshold: 75,
    labelKey: 'evaluation.aiLikely' as EvaluationKey,
    variant: 'destructive' as const,
    explanationKey: 'evaluation.aiExplanation' as ExplanationKey,
  },
  {
    threshold: 40,
    labelKey: 'evaluation.mixedContent' as EvaluationKey,
    variant: 'secondary' as const,
    explanationKey: 'evaluation.mixedExplanation' as ExplanationKey,
  },
  {
    threshold: 0,
    labelKey: 'evaluation.humanLikely' as EvaluationKey,
    variant: 'default' as const,
    explanationKey: 'evaluation.humanExplanation' as ExplanationKey,
  },
];

type TrustIndicatorKey = 'report.trustIndicators.encrypted' | 'report.trustIndicators.notShared' | 'report.trustIndicators.noTraining';

const trustIndicators = [
  {
    labelKey: 'report.trustIndicators.encrypted' as TrustIndicatorKey,
  },
  {
    labelKey: 'report.trustIndicators.notShared' as TrustIndicatorKey,
  },
  {
    labelKey: 'report.trustIndicators.noTraining' as TrustIndicatorKey,
  },
];

function getEvaluation(aiScore: number, t: TranslationFunction) {
  const evaluation = evaluationCopy.find((item) => aiScore >= item.threshold) ??
    evaluationCopy.at(-1)!;

  return {
    ...evaluation,
    label: t(evaluation.labelKey),
    explanation: t(evaluation.explanationKey),
  };
}

function sentenceTone(aiScore: number) {
  if (aiScore >= 75) {
    return 'border-red-200/70 bg-red-50 text-red-900 dark:border-red-500/20 dark:bg-red-500/10';
  }
  if (aiScore >= 40) {
    return 'border-amber-200/70 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10';
  }
  return 'border-emerald-200/70 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10';
}

function GaugeArc({ value, t }: { value: number | null; t: TranslationFunction }) {
  const safeValue = Math.max(0, Math.min(100, value ?? 0));
  const radius = 92;
  const arcLength = Math.PI * radius;
  const dashOffset = arcLength - (safeValue / 100) * arcLength;
  const pointerAngle = Math.PI * (safeValue / 100);
  const pointerX = 130 + radius * Math.cos(Math.PI - pointerAngle);
  const pointerY = 150 - radius * Math.sin(Math.PI - pointerAngle);

  return (
    <svg viewBox="0 0 260 200" className="h-48 w-full">
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>
      <line
        x1="130"
        y1="20"
        x2="130"
        y2="160"
        stroke="rgba(148,163,184,0.3)"
        strokeDasharray="6 6"
        strokeWidth={1}
      />
      <line
        x1="30"
        y1="150"
        x2="230"
        y2="150"
        stroke="rgba(148,163,184,0.25)"
        strokeDasharray="6 6"
        strokeWidth={1}
      />
      <path
        d="M38 148 A92 92 0 0 1 222 148"
        fill="none"
        stroke="rgba(148,163,184,0.2)"
        strokeWidth={18}
        strokeLinecap="round"
      />
      <path
        d="M38 148 A92 92 0 0 1 222 148"
        fill="none"
        stroke="url(#gaugeGradient)"
        strokeWidth={18}
        strokeLinecap="round"
        strokeDasharray={arcLength}
        strokeDashoffset={dashOffset}
      />
      <circle
        cx="130"
        cy="150"
        r="17"
        fill="rgba(255,255,255,0.85)"
        stroke="rgba(148,163,184,0.3)"
        strokeWidth={1}
      />
      <circle
        cx="130"
        cy="150"
        r="15"
        fill="none"
        stroke="rgba(148,163,184,0.25)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <FingerprintIcon
        x={120}
        y={140}
        size={20}
        strokeWidth={1.1}
        color="rgba(124,58,237,0.7)"
      />
      <circle
        cx={pointerX}
        cy={pointerY}
        r={8}
        fill="#7c3aed"
        stroke="white"
        strokeWidth={3}
      />
      <text x="36" y="168" fontSize="12" fill="#94a3b8">
        {t('gauge.low')}
      </text>
      <text x="224" y="168" fontSize="12" fill="#94a3b8" textAnchor="end">
        {t('gauge.high')}
      </text>
    </svg>
  );
}

export function AiDetectorSection() {
  const t = useTranslations('HomePage.aiDetector');
  const session = useSession();
  const locale = useLocale();
  const pathname = usePathname();
  const [text, setText] = useState('');
  const [result, setResult] = useState<DetectAIContentResult | null>(null);
  const [detectionId, setDetectionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [scrollState, setScrollState] = useState({ top: 0, left: 0 });
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [websiteInput, setWebsiteInput] = useState('');
  const [isWebsitePopoverOpen, setIsWebsitePopoverOpen] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'github' | null>(null);

  const charCount = text.length;
  const maxChars = session?.user ? MAX_CHARS_AUTH : MAX_CHARS_GUEST;
  const hasReachedLimit = charCount >= maxChars;
  const hasAltSource = !!uploadedFile || !!websiteUrl;
  const canDetect = text.trim().length > 0 || hasAltSource;

  const triggerLoginModal = () => {
    setShowGuestModal(true);
  };

  const handlePasteFromClipboard = async () => {
    if (isPending) {
      return;
    }
    if (!navigator?.clipboard?.readText) {
      toast.error(t('errors.clipboardNotSupported'));
      return;
    }
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText) {
        toast.info(t('errors.clipboardEmpty'));
        return;
      }
      setText(clipboardText);
      setResult(null);
      setDetectionId(null);
      setError(null);
      setSelectedSample(null);
      setUploadedFile(null);
      setWebsiteUrl(null);
      toast.success(t('errors.pasteSuccess'));
    } catch (clipError) {
      console.error('Clipboard read failed:', clipError);
      toast.error(t('errors.clipboardReadFailed'));
    }
  };

  const handleSampleSelect = (value: string) => {
    setSelectedSample(value);
    const preset = samplePresets.find((sample) => sample.value === value);
    if (preset) {
      setText(t(preset.textKey));
      setResult(null);
      setDetectionId(null);
      setError(null);
      setUploadedFile(null);
      setWebsiteUrl(null);
    }
  };

  const handleUploadButtonClick = () => {
    if (isPending || isUploadingFile) {
      return;
    }

    if (!session?.user) {
      triggerLoginModal();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!session?.user) {
      triggerLoginModal();
      event.target.value = '';
      return;
    }

    setIsUploadingFile(true);
    try {
      const uploadResult = await uploadFileFromBrowser(file, 'winston-detections');
      setUploadedFile({ name: file.name, url: uploadResult.url });
      setWebsiteUrl(null);
      setWebsiteInput('');
      setText('');
      setResult(null);
      setDetectionId(null);
      toast.success(t('fileReady'));
    } catch (uploadError) {
      console.error('File upload failed:', uploadError);
      toast.error(t('errors.uploadFailed'));
    } finally {
      setIsUploadingFile(false);
      event.target.value = '';
    }
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
  };

  const handleApplyWebsite = () => {
    const value = websiteInput.trim();
    if (!value) {
      setWebsiteUrl(null);
      setIsWebsitePopoverOpen(false);
      return;
    }

    if (!session?.user) {
      triggerLoginModal();
      return;
    }

    try {
      const normalized = new URL(value.startsWith('http') ? value : `https://${value}`);
      if (!['http:', 'https:'].includes(normalized.protocol)) {
        throw new Error('Invalid protocol');
      }
      setWebsiteUrl(normalized.href);
      setWebsiteInput(normalized.href);
      setUploadedFile(null);
      setText('');
      setResult(null);
      setDetectionId(null);
      toast.success(t('websiteReady'));
      setIsWebsitePopoverOpen(false);
    } catch (urlError) {
      console.error('Invalid URL:', urlError);
      toast.error(t('errors.invalidUrl'));
    }
  };

  const clearWebsite = () => {
    setWebsiteUrl(null);
    setWebsiteInput('');
    setDetectionId(null);
  };

  const handleDetect = () => {
    const trimmedText = text.trim();
    if (!trimmedText && !uploadedFile && !websiteUrl) {
      setError(t('errors.noInputSource'));
      toast.warning(t('errors.addTextWarning'));
      return;
    }

    if (charCount > maxChars) {
      if (session?.user) {
        setShowUpgradeModal(true);
      } else {
        triggerLoginModal();
      }
      return;
    }

    startTransition(async () => {
      setError(null);

      try {
        const response = await detectAIContentAction({
          text: trimmedText || undefined,
          fileUrl: uploadedFile?.url,
          fileName: uploadedFile?.name,
          websiteUrl: websiteUrl ?? undefined,
        });

        if (!response?.data?.success) {
          const message =
            response?.data?.error ?? t('errors.analysisFailed');
          setError(message);
          setDetectionId(null);
          toast.error(message);

          const errorCode = response?.data?.errorCode;
          if (errorCode === 'INSUFFICIENT_CREDITS') {
            if (session?.user) {
              setShowUpgradeModal(true);
            } else {
              setShowGuestModal(true);
            }
          }
          return;
        }

        setResult(response.data.result ?? null);
        setDetectionId(response.data.detectionId ?? null);
        toast.success(t('errors.analysisComplete'));
      } catch (err) {
        console.error('AiDetectorSection error:', err);
        const message = t('errors.unexpectedError');
        setError(message);
        setDetectionId(null);
        toast.error(message);
      }
    });
  };

  const aiScore = result
    ? Math.max(0, Math.min(100, 100 - result.score))
    : null;
  const evaluation =
    typeof aiScore === 'number' ? getEvaluation(aiScore, t as TranslationFunction) : null;
  const isLoggedIn = !!session?.user;
  const hasReportLink = isLoggedIn && !!detectionId;
  const loginHref = `${Routes.Login}?callbackUrl=${encodeURIComponent(pathname ?? '/')}`;

  const showLowCreditsBanner = !isLoggedIn && typeof result?.creditsRemaining === 'number'
    ? result.creditsRemaining < 150
    : false;

  // free tier should not allow URL; upgrade modal will block it
  const planAllowsUrl = false;
  const highlightedSegments = useMemo(() => {
    if (!result?.sentences?.length) {
      return [{ text, tone: null, key: 'full-text' }];
    }

    const segments: { text: string; tone: string | null; key: string }[] = [];
    let cursor = 0;

    result.sentences.forEach((sentence, index) => {
      const sentenceText = sentence.text.trim();
      if (!sentenceText) {
        return;
      }

      const matchIndex = text.indexOf(sentenceText, cursor);
      if (matchIndex === -1) {
        return;
      }

      if (matchIndex > cursor) {
        segments.push({
          text: text.slice(cursor, matchIndex),
          tone: null,
          key: `plain-${cursor}-${matchIndex}`,
        });
      }

      const sentenceAIScore = Math.max(0, Math.min(100, 100 - sentence.score));
      segments.push({
        text: sentence.text,
        tone: sentenceTone(sentenceAIScore),
        key: `sentence-${index}-${matchIndex}`,
      });

      cursor = matchIndex + sentence.text.length;
    });

    if (cursor < text.length) {
      segments.push({
        text: text.slice(cursor),
        tone: null,
        key: `plain-${cursor}-${text.length}`,
      });
    }

    return segments.length ? segments : [{ text, tone: null, key: 'fallback' }];
  }, [result, text]);

  const handleTextareaScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = event.currentTarget;
    setScrollState({ top: scrollTop, left: scrollLeft });
  };
  const handlePlaceholderClick = () => {
    textareaRef.current?.focus();
  };

  const callbackUrl = getUrlWithLocaleInCallbackUrl(DEFAULT_LOGIN_REDIRECT, locale);
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setSocialLoading(provider);
      await authClient.signIn.social(
        {
          provider,
          callbackURL: callbackUrl,
          errorCallbackURL: Routes.AuthError,
        },
        {
          onError: () => setSocialLoading(null),
          onSuccess: () => setSocialLoading(null),
        }
      );
    } catch (err) {
      console.error('social login error', err);
      setSocialLoading(null);
    }
  };

  return (
    <>
    <section id="detector" className="relative py-20 text-slate-900">
      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        {showLowCreditsBanner && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span>{t('lowCreditsBanner.message')}</span>
            </div>
            <Button
              size="sm"
              className="h-9 rounded-lg bg-indigo-600 px-3 text-white hover:bg-indigo-500"
              onClick={triggerLoginModal}
            >
              {t('lowCreditsBanner.cta')}
            </Button>
          </div>
        )}
        <div className="mb-0 flex flex-col items-center gap-4 text-center">
          <Badge className="border-purple-200 bg-purple-50 text-xs uppercase tracking-[0.2em] text-purple-700">
            {t('badge')}
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl text-slate-800 drop-shadow-sm">
              {t('title')}
            </h1>
            <p className="max-w-4xl text-base text-slate-600 sm:text-lg">
              {t('description')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3" />
        </div>

        <div className="grid gap-6 pt-0 lg:grid-cols-[1.4fr_0.8fr]">
          <Card className="min-w-0 rounded-[28px] border-white/10 bg-white/95 text-slate-900 shadow-[0px_20px_80px_rgba(15,23,42,0.12)]">
            <CardHeader className="pb-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:flex-nowrap">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleUploadButtonClick}
                    disabled={isPending || isUploadingFile}
                    variant="outline"
                    className="h-10 rounded-full border-[#d9b061]/40 bg-white px-4 text-sm font-medium text-[#9b6000] shadow-none hover:bg-[#fff8ed] flex-shrink-0"
                  >
                    {isUploadingFile ? (
                      <>
                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                        {t('uploadingFile')}
                      </>
                    ) : (
                      <>
                        <UploadCloudIcon className="size-4" /> {t('uploadFile')}
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Popover
                    open={isWebsitePopoverOpen}
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsWebsitePopoverOpen(false);
                        return;
                      }

                      if (!session?.user) {
                        triggerLoginModal();
                        return;
                      }

                      // Logged in but free tier: URL not allowed -> show upgrade modal
                      if (session?.user && !planAllowsUrl) {
                        setShowUpgradeModal(true);
                        return;
                      }

                      setIsWebsitePopoverOpen(true);
                      setWebsiteInput(websiteUrl ?? '');
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'h-10 rounded-full border-[#d9b061]/40 bg-white px-4 text-sm font-medium text-[#9b6000] shadow-none hover:bg-[#fff8ed]',
                          websiteUrl && 'border-indigo-300 text-indigo-600',
                          'flex-shrink-0'
                        )}
                      >
                        <Link2Icon className="size-4" /> {t('pasteUrl')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 space-y-3">
                      <Input
                        value={websiteInput}
                        onChange={(event) => setWebsiteInput(event.target.value)}
                        placeholder={t('urlPlaceholder')}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setWebsiteInput('');
                            setWebsiteUrl(null);
                            setIsWebsitePopoverOpen(false);
                          }}
                        >
                          {t('urlClear')}
                        </Button>
                        <Button size="sm" onClick={handleApplyWebsite}>
                          {t('urlApply')}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Select
                  value={selectedSample ?? undefined}
                  onValueChange={handleSampleSelect}
                >
                  <SelectTrigger className="h-10 min-w-[200px] max-w-[340px] flex-1 rounded-full border-slate-200 bg-white px-4 text-sm text-slate-600">
                    <SelectValue placeholder={t('trySamples')} className="truncate" />
                  </SelectTrigger>
                  <SelectContent>
                    {samplePresets.map((sample) => (
                      <SelectItem key={sample.value} value={sample.value}>
                        {t(sample.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  asChild
                  variant="ghost"
                  className="ml-auto h-10 rounded-full px-3 text-xs text-slate-500 hover:bg-slate-100"
                >
                  <LocaleLink href={Routes.Dashboard}>{t('scanHistory')}</LocaleLink>
                </Button>
              </div>
              {(uploadedFile || websiteUrl) && (
                <div className="flex flex-wrap items-center gap-2 px-1 pb-2 pt-3 text-xs text-slate-600">
                  {uploadedFile && (
                    <div className="flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                      <UploadCloudIcon className="size-3.5 text-slate-500" />
                      <span className="truncate text-slate-600">{uploadedFile.name}</span>
                      <button
                        type="button"
                        onClick={clearUploadedFile}
                        className="text-slate-500 transition hover:text-slate-800"
                        aria-label={t('clearSource')}
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    </div>
                  )}
                  {websiteUrl && (
                    <div className="flex max-w-full items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                      <Link2Icon className="size-3.5" />
                      <span className="truncate">{websiteUrl}</span>
                      <button
                        type="button"
                        onClick={clearWebsite}
                        className="text-indigo-500 transition hover:text-indigo-700"
                        aria-label={t('clearSource')}
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="min-w-0 px-6 pb-4 pt-1 sm:px-8">
              <div className="mb-2 h-px w-full bg-slate-100" />
              <div
                className="relative flex min-h-[360px] min-w-0 items-center justify-center rounded-3xl border border-slate-200 bg-white/90"
                style={
                  {
                    '--detector-pad-x': '1.25rem',
                    '--detector-pad-top': '2rem',
                    '--detector-pad-bottom': '1.5rem',
                    '--detector-font-size': '1rem',
                    '--detector-line-height': '1.75rem',
                  } as CSSProperties
                }
              >
                <div
                  className={cn(
                    'absolute inset-0 z-10 w-full max-w-full overflow-hidden rounded-3xl',
                    text ? 'pointer-events-none' : 'pointer-events-auto'
                  )}
                  onClick={!text ? handlePlaceholderClick : undefined}
                >
                  <div
                    className={cn(
                      'w-full max-w-full whitespace-pre-wrap break-words text-slate-900 [font:inherit]',
                      text ? 'min-h-full' : 'flex h-full flex-col items-center justify-center gap-5 text-center'
                    )}
                    style={{
                      padding:
                        'var(--detector-pad-top) var(--detector-pad-x) var(--detector-pad-bottom)',
                      fontSize: 'var(--detector-font-size)',
                      lineHeight: 'var(--detector-line-height)',
                      transform: text
                        ? `translate(${-scrollState.left}px, ${-scrollState.top}px)`
                        : 'none',
                    }}
                    aria-hidden
                  >
                    {text ? (
                      highlightedSegments.map((segment) => (
                        <span
                          key={segment.key}
                          className={cn(
                            'rounded-sm px-0.5',
                            segment.tone ?? 'bg-transparent'
                          )}
                        >
                          {segment.text}
                        </span>
                      ))
                    ) : (
                      <>
                        <div>
                          <p className="text-base font-semibold text-slate-500">
                            {t('placeholder.title')}
                          </p>
                          <p className="text-sm text-slate-400">
                            {t('placeholder.subtitle')}
                          </p>
                        </div>
                        <div className="flex gap-4">
                        <Button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handlePasteFromClipboard();
                          }}
                          disabled={isPending}
                          className="h-16 w-28 flex-col rounded-2xl bg-[#6b4de6] text-white transition hover:bg-[#5b3fd3] disabled:opacity-60"
                        >
                          <ClipboardPasteIcon className="size-5" />
                          {t('paste')}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleUploadButtonClick();
                          }}
                          disabled={isPending || isUploadingFile}
                          className="h-16 w-28 flex-col rounded-2xl border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                        >
                          <UploadCloudIcon className="size-5" />
                          {isUploadingFile ? t('uploadingFile') : t('upload')}
                        </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    if (result) {
                      setResult(null);
                      setDetectionId(null);
                    }
                    if (error) {
                      setError(null);
                    }
                  }}
                  rows={13}
                  placeholder={t('placeholder.textareaPlaceholder')}
                  maxLength={maxChars}
                  className="relative h-[360px] w-full min-w-0 resize-none rounded-3xl border border-transparent bg-transparent text-transparent caret-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-0"
                  style={{
                    WebkitTextFillColor: 'transparent',
                    padding:
                      'var(--detector-pad-top) var(--detector-pad-x) var(--detector-pad-bottom)',
                    fontSize: 'var(--detector-font-size)',
                    lineHeight: 'var(--detector-line-height)',
                  }}
                  onScroll={handleTextareaScroll}
                />
              </div>
              <div className="mt-2 h-px w-full bg-slate-100" />
              {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}
            </CardContent>
            <CardFooter className="py-4">
              <div className="flex w-full flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1 text-left">
                  <span>
                    {t('characterCount', {
                      count: charCount.toLocaleString(),
                    })}
                  </span>
                  {hasReachedLimit && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>
                        {isLoggedIn ? t('limitUpgradePrompt') : t('limitLoginPrompt')}
                      </span>
                      {isLoggedIn ? (
                        <Button
                          asChild
                          variant="link"
                          size="sm"
                          className="h-auto px-0 text-indigo-600"
                        >
                          <LocaleLink href={Routes.Pricing}>
                            {t('upgradeCta')}
                          </LocaleLink>
                        </Button>
                      ) : (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto px-0 text-indigo-600"
                          onClick={triggerLoginModal}
                        >
                          {t('loginCta')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setText('');
                      setResult(null);
                      setDetectionId(null);
                      setError(null);
                      setSelectedSample(null);
                      setUploadedFile(null);
                      setWebsiteUrl(null);
                      setWebsiteInput('');
                    }}
                    disabled={
                      isPending || (!text && !result && !uploadedFile && !websiteUrl)
                    }
                    className="text-slate-500 hover:bg-slate-100"
                  >
                    {t('clear')}
                  </Button>
                  <Button
                    onClick={handleDetect}
                    disabled={isPending || !canDetect}
                    className="rounded-full bg-indigo-600 px-6 text-white hover:bg-indigo-500"
                  >
                    {isPending ? (
                      <>
                        <Loader2Icon className="mr-2 size-4 animate-spin" />{' '}
                        {t('analyzing')}
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="mr-2 size-4" /> {t('detect')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className="min-w-0 rounded-[28px] border-white/10 bg-white/95 text-slate-900 shadow-[0px_20px_60px_rgba(15,23,42,0.15)] gap-1">
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                    {t('report.title')}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t('report.subtitle')}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-indigo-100 bg-indigo-50 text-indigo-700"
                >
                  {t('report.realTime')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex flex-col items-center gap-0.5 text-center">
                <GaugeArc value={aiScore} t={t as TranslationFunction} />
                <div className="text-center">
                  <p className="text-4xl font-semibold text-slate-900">
                    {aiScore !== null ? `${aiScore.toFixed(1)}%` : '--%'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {result
                      ? `${evaluation?.label ?? t('evaluation.mixedContent')} · ${t('report.confidence')}`
                      : t('defaultConfidence')}
                  </p>
                  {evaluation && result && (
                    <p className="mt-1 text-xs text-slate-400">
                      {evaluation.explanation}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {result ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-600 text-center">
                      {isLoggedIn ? t('report.nextSteps') : t('report.loginPrompt')}
                    </p>
                    <div className="flex flex-col gap-2">
                      <Button
                        asChild
                        disabled={isLoggedIn && !hasReportLink}
                        className="h-11 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
                      >
                        <LocaleLink
                          href={isLoggedIn
                            ? hasReportLink
                              ? `/dashboard/detections/${detectionId}`
                              : Routes.Dashboard
                            : loginHref}
                        >
                          {isLoggedIn ? t('report.viewReport') : t('report.loginToView')}
                        </LocaleLink>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        className="h-11 rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                      >
                        <LocaleLink href={Routes.PlagiarismDetector}>
                          {t('report.checkPlagiarism')}
                        </LocaleLink>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-center">
                    <p className="text-sm font-semibold text-slate-600">
                      {t('report.secureText')}
                    </p>
                    <div className="space-y-2">
                      {trustIndicators.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-2xl bg-[#ede8ff] px-4 py-3 text-sm text-slate-700"
                        >
                          <span className="text-emerald-500">✅</span>
                          <p className="font-semibold">{t(item.labelKey)}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      {t.rich('report.terms', {
                        terms: (children) => <span className="underline">{children}</span>,
                        privacy: (children) => <span className="underline">{children}</span>,
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    {/* Guest CTA Modal */}
    <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {t('guestModal.title')}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {t('guestModal.subtitle')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Button
            className="h-11 justify-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
            onClick={() => handleSocialLogin('google')}
            disabled={socialLoading === 'google'}
          >
            {socialLoading === 'google' ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <GoogleIcon className="size-4" />
            )}
            {t('guestModal.google')}
          </Button>
          <Button
            variant="outline"
            className="h-11 justify-center gap-2 rounded-xl"
            onClick={() => handleSocialLogin('github')}
            disabled={socialLoading === 'github'}
          >
            {socialLoading === 'github' ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <GitHubIcon className="size-4" />
            )}
            {t('guestModal.github')}
          </Button>
        </div>
        <DialogFooter className="text-[11px] text-slate-400">
          {t('guestModal.footer')}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Upgrade / Pricing Modal */}
    <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
      <DialogContent className="sm:max-w-4xl max-h-[82vh] overflow-y-auto pt-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-900">
            {t('upgradeModal.title')}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {t('upgradeModal.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <PricingTable className="pb-4" />
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
