'use client';

import { detectAIContentAction } from '@/actions/detect-ai';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { DetectAIContentResult } from '@/lib/winston';
import { Loader2Icon, SparklesIcon } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

const MIN_CHARS = 300;
const MAX_CHARS = 150000;

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

export function AiDetectorSection() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<DetectAIContentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const charCount = text.length;
  const isTooShort = text.trim().length > 0 && text.trim().length < MIN_CHARS;

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

  return (
    <section className="py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8 flex flex-col gap-2 text-center">
          <Badge variant="outline" className="mx-auto">
            MVP · Detector de IA
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Pega tu texto y detecta IA en segundos
          </h2>
          <p className="text-muted-foreground">
            Usamos Winston AI API para estimar qué tan probable es que tu
            contenido haya sido generado por IA.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Texto a analizar</CardTitle>
              <CardDescription>
                Soporta entre {MIN_CHARS.toLocaleString()} y{' '}
                {MAX_CHARS.toLocaleString()} caracteres. Sólo pegamos texto
                plano por ahora.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={12}
                placeholder="Pega aquí tu ensayo o artículo en español..."
                maxLength={MAX_CHARS}
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}{' '}
                  caracteres
                </span>
                {isTooShort && (
                  <span className="text-destructive">
                    Necesitas al menos {MIN_CHARS} caracteres para un resultado
                    confiable.
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleDetect}
                  disabled={isPending || text.trim().length < MIN_CHARS}
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
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setText('');
                    setResult(null);
                    setError(null);
                  }}
                  disabled={isPending || (!text && !result)}
                >
                  Limpiar
                </Button>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
              <CardDescription>
                Mostramos la probabilidad estimada de IA y los detalles por
                oración.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result ? (
                <div className="space-y-4">
                  {evaluation && (
                    <div className="space-y-3 rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            AI Score
                          </p>
                          <p className="text-3xl font-semibold">
                            {aiScore?.toFixed(0)}%
                          </p>
                        </div>
                        <Badge variant={evaluation.variant}>
                          {evaluation.label}
                        </Badge>
                      </div>
                      <Progress value={aiScore ?? 0} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        {evaluation.explanation}
                      </p>
                    </div>
                  )}

                  <div className="grid gap-3 rounded-xl border p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Lecturabilidad
                      </span>
                      <span className="font-medium">
                        {result.readability_score ?? '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Idioma detectado
                      </span>
                      <span className="font-medium uppercase">
                        {result.language ?? 'auto'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Versión del modelo
                      </span>
                      <span className="font-medium">
                        {result.version ?? 'latest'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Créditos restantes
                      </span>
                      <span className="font-medium">
                        {result.credits_remaining ?? '—'}
                      </span>
                    </div>
                    {result.attack_detected && (
                      <div className="space-y-1">
                        <Separator />
                        <p className="text-muted-foreground">
                          Ataques detectados
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(result.attack_detected)
                            .filter(([, value]) => value)
                            .map(([key]) => (
                              <Badge
                                key={key}
                                variant="outline"
                                className="capitalize"
                              >
                                {key.replaceAll('_', ' ')}
                              </Badge>
                            ))}
                          {Object.values(result.attack_detected).every(
                            (flag) => !flag
                          ) && (
                            <span className="text-sm text-muted-foreground">
                              Sin señales.
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Detalle por oración</p>
                    {result.sentences.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No recibimos detalle por oración para este texto.
                      </p>
                    ) : (
                      <ScrollArea className="h-64">
                        <div className="space-y-3 pr-2">
                          {result.sentences.map((sentence, index) => {
                            const sentenceAIScore = Math.max(
                              0,
                              Math.min(100, 100 - sentence.score)
                            );
                            return (
                              <div
                                key={`${sentence.text}-${index}`}
                                className={cn(
                                  'rounded-lg border p-3 text-sm shadow-xs transition-colors',
                                  sentenceTone(sentenceAIScore)
                                )}
                              >
                                <div className="mb-2 flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-wide">
                                  <span>Oración {index + 1}</span>
                                  <span>{sentenceAIScore.toFixed(0)}% AI</span>
                                </div>
                                <p className="text-sm leading-relaxed text-foreground">
                                  {sentence.text}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Los resultados aparecerán aquí después de ejecutar la
                  detección.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
