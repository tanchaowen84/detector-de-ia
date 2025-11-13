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
  const radius = 80;
  const arcLength = Math.PI * radius;
  const dashOffset = arcLength - (safeValue / 100) * arcLength;

  return (
    <svg viewBox="0 0 200 120" className="h-44 w-full">
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <path
        d="M20 100 A80 80 0 0 1 180 100"
        fill="none"
        stroke="rgba(148, 163, 184, 0.35)"
        strokeWidth={18}
        strokeLinecap="round"
      />
      <path
        d="M20 100 A80 80 0 0 1 180 100"
        fill="none"
        stroke="url(#gaugeGradient)"
        strokeWidth={18}
        strokeLinecap="round"
        strokeDasharray={arcLength}
        strokeDashoffset={dashOffset}
      />
      <circle cx={20} cy={100} r={9} fill="rgba(148,163,184,0.25)" />
      <circle cx={180} cy={100} r={9} fill="rgba(148,163,184,0.25)" />
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
        <div className="mb-12 flex flex-col items-center gap-6 text-center">
          <Badge className="border-white/30 bg-white/10 text-xs uppercase tracking-[0.2em] text-white">
            Detecta contenido de IA con 99% de exactitud
          </Badge>
          <div className="space-y-4">
            <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              El detector de IA más exacto
            </h2>
            <p className="max-w-3xl text-base text-white/80 sm:text-lg">
              Disponible gratis en esta página para evaluar textos de ChatGPT,
              GPT-4o, Gemini, Claude y otros modelos populares. Analiza ensayos,
              artículos web o correos sin salir de tu navegador.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button className="rounded-full bg-white px-6 py-2 text-base font-semibold text-indigo-700 hover:bg-white/90">
              Comenzar gratis
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-white/40 bg-white/10 px-6 py-2 text-base text-white hover:bg-white/20"
            >
              Ver demo en vivo
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Card className="rounded-[28px] border-white/10 bg-white/95 text-slate-900 shadow-[0px_20px_80px_rgba(15,23,42,0.12)]">
            <CardHeader className="pb-1">
              <div className="flex flex-wrap items-center gap-3">
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
                  <SelectTrigger className="h-10 rounded-full border-slate-200 bg-white px-4 text-sm text-slate-600">
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
            <CardContent className="px-6 pb-4 pt-2 sm:px-8">
              <div className="mb-4 h-px w-full bg-slate-100" />
              <div
                className="relative min-h-[240px] rounded-3xl border border-slate-200 bg-white/90"
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
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                  <div
                    className="whitespace-pre-wrap break-words text-slate-900 [font:inherit]"
                    style={{
                      padding:
                        'var(--detector-pad-top) var(--detector-pad-x) var(--detector-pad-bottom)',
                      fontSize: 'var(--detector-font-size)',
                      lineHeight: 'var(--detector-line-height)',
                      transform: `translate(${-scrollState.left}px, ${-scrollState.top}px)`,
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
                      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
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
                          <Button className="h-16 w-24 flex-col rounded-2xl bg-[#6b4de6] text-white hover:bg-[#5b3fd3]">
                            <UploadCloudIcon className="size-5" />
                            Pegar
                          </Button>
                          <Button
                            variant="outline"
                            className="h-16 w-24 flex-col rounded-2xl border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
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
                  className="relative h-[240px] resize-none rounded-3xl border border-transparent bg-transparent text-transparent caret-indigo-600 focus-visible:ring-0 focus-visible:ring-offset-0"
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
              <div className="mt-4 h-px w-full bg-slate-100" />
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

          <Card className="rounded-[28px] border-white/10 bg-white/95 text-slate-900 shadow-[0px_30px_120px_rgba(15,23,42,0.28)]">
            <CardHeader className="border-b border-slate-100 pb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    Originality report
                  </p>
                  <CardDescription className="mt-1 text-sm text-slate-500">
                    Observa la probabilidad de IA en un vistazo.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="border-indigo-100 bg-indigo-50 text-indigo-700"
                >
                  Tiempo real
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="rounded-3xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-6 text-center shadow-inner">
                <GaugeArc value={aiScore} />
                <p className="mt-4 text-4xl font-semibold text-slate-900">
                  {result ? `${aiScore?.toFixed(0)}%` : '-- %'}
                </p>
                <p className="text-sm text-slate-500">
                  {result
                    ? (evaluation?.label ?? 'Resultado mixto')
                    : 'Tu Score aparecerá aquí'}
                </p>
                {evaluation && result && (
                  <p className="mt-2 text-xs text-slate-400">
                    {evaluation.explanation}
                  </p>
                )}
              </div>

              {result?.attack_detected && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">
                  <p className="text-slate-400">Ataques detectados:</p>
                  <p className="mt-1 font-semibold text-slate-600">
                    {Object.entries(result.attack_detected)
                      .filter(([, value]) => value)
                      .map(([key]) => key.replaceAll('_', ' '))
                      .join(', ') || 'sin señales'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
