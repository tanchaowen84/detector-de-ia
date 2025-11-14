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
import { cn } from '@/lib/utils';
import type { DetectAIContentResult } from '@/lib/winston';
import {
  ClipboardPasteIcon,
  FingerprintIcon,
  Link2Icon,
  Loader2Icon,
  SparklesIcon,
  UploadCloudIcon,
} from 'lucide-react';
import type { CSSProperties, UIEvent } from 'react';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

const MIN_CHARS = 300;
const MAX_CHARS = 150000;

const samplePresets = [
  {
    value: 'ia-ensayo',
    label: 'Ensayo generado por IA',
    text: 'Este ensayo fue generado con un modelo de IA y utiliza frases de relleno para construir una narrativa que suena convincente pero ligeramente repetitiva. El texto insiste en los mismos argumentos, recicla conectores como "por otro lado" y evita los detalles concretos, lo que genera una estructura agradable aunque predecible. Puedes usarlo para probar cómo se comporta el detector frente a un texto claramente sintético y verificar la visualización de colores por oración.',
  },
  {
    value: 'humano-articulo',
    label: 'Artículo escrito a mano',
    text: 'Este artículo fue redactado por una editora humana que toma notas en entrevistas reales y luego las incorpora en párrafos de longitud media. Cada sección se centra en ejemplos específicos, menciona nombres propios y cita fechas o cifras concretas. El estilo introduce frases más cortas para subrayar ideas clave y alterna preguntas retóricas con observaciones personales. Esa mezcla de ritmo da al texto un tono auténtico que suele obtener una probabilidad baja de IA.',
  },
  {
    value: 'correo-mixto',
    label: 'Correo con partes mezcladas',
    text: 'Hola equipo, adjunto el informe que preparé esta mañana. Reorganicé las tablas según la retroalimentación de ayer y agregué dos secciones que redacté con IA para ahorrar tiempo; en ellas notarás un lenguaje más formal y redondo. El resto del mensaje lo escribí manualmente para mantener nuestra voz cercana. Avísenme si prefieren que reemplace los fragmentos automatizados antes de enviarlo al cliente.',
  },
];

const evaluationCopy = [
  {
    threshold: 75,
    label: 'Más probable IA',
    variant: 'destructive' as const,
    explanation:
      'Style is highly repetitive and similar to typical AI-generated text.',
  },
  {
    threshold: 40,
    label: 'Contenido mixto',
    variant: 'secondary' as const,
    explanation:
      'Signals are mixed. Manual review recommended to confirm authorship.',
  },
  {
    threshold: 0,
    label: 'Más probable humano',
    variant: 'default' as const,
    explanation:
      'Structure and variation look closer to human-written content.',
  },
];

const trustIndicators = [
  {
    label: 'Encriptado',
  },
  {
    label: 'Nunca compartido',
  },
  {
    label: 'No entrena modelos',
  },
];

function getEvaluation(aiScore: number) {
  return (
    evaluationCopy.find((item) => aiScore >= item.threshold) ??
    evaluationCopy.at(-1)!
  );
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

function GaugeArc({ value }: { value: number | null }) {
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
        Low
      </text>
      <text x="224" y="168" fontSize="12" fill="#94a3b8" textAnchor="end">
        High
      </text>
    </svg>
  );
}

export function AiDetectorSection() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<DetectAIContentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [scrollState, setScrollState] = useState({ top: 0, left: 0 });
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const charCount = text.length;
  const isTooShort = text.trim().length > 0 && text.trim().length < MIN_CHARS;

  const handlePasteFromClipboard = async () => {
    if (isPending) {
      return;
    }
    if (!navigator?.clipboard?.readText) {
      toast.error('Tu navegador no permite leer el portapapeles.');
      return;
    }
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText) {
        toast.info('El portapapeles está vacío.');
        return;
      }
      setText(clipboardText);
      setResult(null);
      setError(null);
      setSelectedSample(null);
      toast.success('Texto pegado desde el portapapeles.');
    } catch (clipError) {
      console.error('Clipboard read failed:', clipError);
      toast.error('No pudimos leer tu portapapeles.');
    }
  };

  const handleSampleSelect = (value: string) => {
    setSelectedSample(value);
    const preset = samplePresets.find((sample) => sample.value === value);
    if (preset) {
      setText(preset.text);
      setResult(null);
      setError(null);
    }
  };

  const handleDetect = () => {
    if (!text.trim()) {
      setError('Por favor pega un texto en español.');
      toast.warning('Añade un texto antes de analizar.');
      return;
    }

    startTransition(async () => {
      setError(null);

      try {
        const response = await detectAIContentAction({ text });

        if (!response?.data?.success) {
          const message =
            response?.data?.error ?? 'No pudimos analizar el texto.';
          setError(message);
          toast.error(message);
          return;
        }

        setResult(response.data.result);
        toast.success('Análisis completado');
      } catch (err) {
        console.error('AiDetectorSection error:', err);
        const message = 'Ocurrió un error inesperado.';
        setError(message);
        toast.error(message);
      }
    });
  };

  const aiScore = result
    ? Math.max(0, Math.min(100, 100 - result.score))
    : null;
  const evaluation =
    typeof aiScore === 'number' ? getEvaluation(aiScore) : null;
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

  return (
    <section className="relative isolate overflow-hidden bg-[#140b3c] py-20 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[length:20px_20px]" />
      </div>
      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        <div className="mb-0 flex flex-col items-center gap-4 text-center">
          <Badge className="border-white/30 bg-white/10 text-xs uppercase tracking-[0.2em] text-white">
            Detecta contenido de IA con 99% de exactitud
          </Badge>
          <div className="space-y-4">
            <h2 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              El detector de IA más exacto
            </h2>
            <p className="max-w-4xl text-base text-white/80 sm:text-lg">
              Disponible gratis en esta página para evaluar textos de ChatGPT,
              GPT-4o, Gemini, Claude y otros modelos populares. Analiza ensayos
              o correos sin salir de tu navegador y obtén claridad inmediata.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3" />
        </div>

        <div className="grid gap-6 pt-0 lg:grid-cols-[1.4fr_0.8fr]">
          <Card className="rounded-[28px] border-white/10 bg-white/95 text-slate-900 shadow-[0px_20px_80px_rgba(15,23,42,0.12)]">
            <CardHeader className="pb-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:flex-nowrap">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-full border-[#d9b061]/40 bg-white px-4 text-sm font-medium text-[#9b6000] shadow-none hover:bg-[#fff8ed]"
                >
                  <UploadCloudIcon className="size-4" /> Subir archivo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-full border-[#d9b061]/40 bg-white px-4 text-sm font-medium text-[#9b6000] shadow-none hover:bg-[#fff8ed]"
                >
                  <Link2Icon className="size-4" /> Pegar URL
                </Button>
                <Select
                  value={selectedSample ?? undefined}
                  onValueChange={handleSampleSelect}
                >
                  <SelectTrigger className="h-10 min-w-[180px] rounded-full border-slate-200 bg-white px-4 text-sm text-slate-600">
                    <SelectValue placeholder="Probar muestras" />
                  </SelectTrigger>
                  <SelectContent>
                    {samplePresets.map((sample) => (
                      <SelectItem key={sample.value} value={sample.value}>
                        {sample.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  className="ml-auto h-10 rounded-full px-3 text-xs text-slate-500 hover:bg-slate-100"
                >
                  Historial de escaneos
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-4 pt-1 sm:px-8">
              <div className="mb-2 h-px w-full bg-slate-100" />
              <div
                className="relative flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-white/90"
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
                    'absolute inset-0 z-10 overflow-hidden rounded-3xl',
                    text ? 'pointer-events-none' : 'pointer-events-auto'
                  )}
                >
                  <div
                    className="whitespace-pre-wrap break-words text-slate-900 [font:inherit]"
                    style={{
                      padding:
                        'var(--detector-pad-top) var(--detector-pad-x) var(--detector-pad-bottom)',
                      fontSize: 'var(--detector-font-size)',
                      lineHeight: 'var(--detector-line-height)',
                      transform: text
                        ? `translate(${-scrollState.left}px, ${-scrollState.top}px)`
                        : 'none',
                      display: text ? 'block' : 'flex',
                      alignItems: text ? undefined : 'center',
                      justifyContent: text ? undefined : 'center',
                      height: '100%',
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
                      <div className="flex flex-col items-center justify-center gap-5 text-center">
                        <div>
                          <p className="text-base font-semibold text-slate-500">
                            Arrastra tu archivo o pega el contenido aquí
                          </p>
                          <p className="text-sm text-slate-400">
                            Aceptamos .txt, .docx y texto plano. Los colores
                            aparecerán por oración.
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            onClick={handlePasteFromClipboard}
                            disabled={isPending}
                            className="h-16 w-28 flex-col rounded-2xl bg-[#6b4de6] text-white transition hover:bg-[#5b3fd3] disabled:opacity-60"
                          >
                            <ClipboardPasteIcon className="size-5" />
                            Pegar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-16 w-28 flex-col rounded-2xl border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                          >
                            <UploadCloudIcon className="size-5" />
                            Subir
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Textarea
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    if (result) {
                      setResult(null);
                    }
                    if (error) {
                      setError(null);
                    }
                  }}
                  rows={13}
                  placeholder="Pega aquí tu ensayo o artículo en español..."
                  maxLength={MAX_CHARS}
                  className="relative h-[360px] resize-none rounded-3xl border border-transparent bg-transparent text-transparent caret-indigo-600 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                <div className="flex flex-wrap items-center gap-3">
                  <span>
                    {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}{' '}
                    caracteres · mínimo {MIN_CHARS}
                  </span>
                  {isTooShort && (
                    <span className="text-amber-600">
                      Añade más texto para un resultado confiable.
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setText('');
                      setResult(null);
                      setError(null);
                      setSelectedSample(null);
                    }}
                    disabled={isPending || (!text && !result)}
                    className="text-slate-500 hover:bg-slate-100"
                  >
                    Limpiar
                  </Button>
                  <Button
                    onClick={handleDetect}
                    disabled={isPending || text.trim().length < MIN_CHARS}
                    className="rounded-full bg-indigo-600 px-6 text-white hover:bg-indigo-500"
                  >
                    {isPending ? (
                      <>
                        <Loader2Icon className="mr-2 size-4 animate-spin" />{' '}
                        Analizando...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="mr-2 size-4" /> Detectar ahora
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className="rounded-[28px] border-white/10 bg-white/95 text-slate-900 shadow-[0px_20px_60px_rgba(15,23,42,0.15)] gap-1">
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                    Originality report
                  </p>
                  <p className="text-xs text-slate-400">
                    Observa la probabilidad de IA en un vistazo.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-indigo-100 bg-indigo-50 text-indigo-700"
                >
                  Tiempo real
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex flex-col items-center gap-0.5 text-center">
                <GaugeArc value={aiScore} />
                <p className="text-sm text-slate-500">
                  {result
                    ? `${evaluation?.label ?? 'Resultado mixto'} · Confianza estimada`
                    : '--% Confident that’s AI'}
                </p>
                {evaluation && result && (
                  <p className="mt-1 text-xs text-slate-400">
                    {evaluation.explanation}
                  </p>
                )}
              </div>

              <div className="space-y-3 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  Tu texto está seguro…
                </p>
                <div className="space-y-2">
                  {trustIndicators.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-2xl bg-[#ede8ff] px-4 py-3 text-sm text-slate-700"
                    >
                      <span className="text-emerald-500">✅</span>
                      <p className="font-semibold">{item.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  Al continuar aceptas nuestros{' '}
                  <span className="underline">Términos</span> y{' '}
                  <span className="underline">Política de Privacidad</span>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
