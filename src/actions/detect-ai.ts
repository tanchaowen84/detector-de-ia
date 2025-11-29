'use server';

import { detections } from '@/db/schema';
import { getDb } from '@/db';
import { getSession } from '@/lib/server';
import { detectAIContent } from '@/lib/winston';
import {
  countWords,
  deductUserCredits,
  estimateWordsFromChars,
  loadUserPlanContext,
} from '@/lib/credits';
import { getClientIp } from '@/lib/credits';
import { headers } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';

const actionClient = createSafeActionClient();

const detectSchema = z
  .object({
    text: z
      .string()
      .trim()
      .optional(),
    fileUrl: z
      .string()
      .url({ message: 'El enlace del archivo no es válido.' })
      .optional(),
    fileName: z.string().max(255).optional(),
    websiteUrl: z
      .string()
      .url({ message: 'La URL no es válida.' })
      .optional(),
  })
  .refine(
    (data) => {
      const hasText = typeof data.text === 'string' && data.text.trim().length > 0;
      return hasText || !!data.fileUrl || !!data.websiteUrl;
    },
    {
      message: 'Por favor proporciona un texto, archivo o URL para analizar.',
      path: ['text'],
    }
  );

export const detectAIContentAction = actionClient
  .schema(detectSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const db = await getDb();
    let detectionId: string | null = null;

    // Lazy reset and current credits
    const planContext = await loadUserPlanContext(session);
    const activePlan = planContext.plan;
    let availableCredits = planContext.credits;

    // Input gating by plan
    const sourceType = parsedInput.websiteUrl ? 'url' : parsedInput.fileUrl ? 'file' : 'text';
    if (sourceType === 'file' && !activePlan.allowFile) {
      return {
        success: false,
        error: 'Tu plan no permite subir archivos. Activa Trial Pack para continuar.',
        errorCode: 'PLAN_GATE_BLOCKED' as const,
      };
    }
    if (sourceType === 'url' && !activePlan.allowUrl) {
      return {
        success: false,
        error: 'Tu plan no permite analizar URLs. Activa Trial Pack para continuar.',
        errorCode: 'PLAN_GATE_BLOCKED' as const,
      };
    }

    const textLength = parsedInput.text?.length ?? 0;
    if (sourceType === 'text' && activePlan.maxChars && textLength > activePlan.maxChars) {
      return {
        success: false,
        error: `El texto supera el límite de ${activePlan.maxChars.toLocaleString()} caracteres para tu plan.`,
        errorCode: 'PLAN_GATE_BLOCKED' as const,
      };
    }

    // Pre-calc required credits for text inputs
    let requiredCredits = 0;
    if (sourceType === 'text') {
      requiredCredits = countWords(parsedInput.text ?? '') * activePlan.creditsPerWordDetect;
      if (requiredCredits <= 0) {
        return {
          success: false,
          error: 'Por favor proporciona texto válido.',
        };
      }
      if (availableCredits < requiredCredits) {
        return {
          success: false,
          error: 'Créditos insuficientes. Actualiza tu plan.',
          errorCode: 'INSUFFICIENT_CREDITS' as const,
        };
      }
    }

    try {
      const result = await detectAIContent({
        text: parsedInput.text && parsedInput.text.length > 0 ? parsedInput.text : undefined,
        fileUrl: parsedInput.fileUrl,
        websiteUrl: parsedInput.websiteUrl,
      });

      // Calculate credits based on response (for file/url we only know after)
      if (requiredCredits === 0) {
        const responseChars =
          result.length ??
          result.sentences.reduce(
            (sum, s) => sum + (s.length ?? s.text?.length ?? 0),
            0
          );
        const words = estimateWordsFromChars(responseChars);
        requiredCredits = Math.max(1, words * activePlan.creditsPerWordDetect);
      }

      if (requiredCredits <= 0) {
        requiredCredits = 1;
      }

      // Deduct credits
      if (planContext.isGuest) {
        const ip = await getClientIp();
        const ua = (await headers()).get('user-agent');
        const deduction = await (async () => {
          const res = await import('@/lib/credits');
          // use db-based guest deduction
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fn: any = (res as any).deductGuestCreditsDb ?? (res as any).defaultGuestDeduct;
          if (!fn) {
            return {
              ok: false,
              errorCode: 'INSUFFICIENT_CREDITS' as const,
              message: 'Créditos insuficientes. Crea cuenta para obtener más.',
            };
          }
          return fn(ip, ua, requiredCredits);
        })();

        if (!deduction.ok) {
          return {
            success: false,
            error: deduction.message,
            errorCode: deduction.errorCode,
          };
        }
        availableCredits = deduction.creditsLeft;
      } else if (session?.user?.id) {
        const deduction = await deductUserCredits(session.user.id, activePlan, requiredCredits, {
          planId: activePlan.id,
          creditsResetAt: planContext.metadata.creditsResetAt,
          oneTimeExpiresAt: planContext.metadata.oneTimeExpiresAt,
        });
        if (!deduction.ok) {
          return {
            success: false,
            error: deduction.message,
            errorCode: deduction.errorCode,
          };
        }
        availableCredits = deduction.creditsLeft;
      }

      if (session?.user?.id && activePlan.saveHistory && planContext.metadata?.retentionDays !== 0) {
        const sourceTypeComputed = parsedInput.websiteUrl
          ? 'url'
          : parsedInput.fileUrl
            ? 'file'
            : 'text';

        let preview: string | null = null;
        if (sourceTypeComputed === 'text') {
          preview = parsedInput.text?.slice(0, 200) ?? null;
        } else if (sourceTypeComputed === 'file') {
          preview = parsedInput.fileName ?? parsedInput.fileUrl ?? null;
        } else if (sourceTypeComputed === 'url') {
          preview = parsedInput.websiteUrl ?? null;
          if (preview) {
            try {
              const url = new URL(preview);
              preview = `${url.host}${url.pathname}` || url.href;
            } catch (error) {
              // keep original preview
            }
          }
        }

        const aiScore = Math.max(0, Math.min(100, 100 - result.score));
        const detectionLength = result.length ?? parsedInput.text?.length ?? null;

        try {
          detectionId = randomUUID();

          await db.insert(detections).values({
            id: detectionId,
            userId: session.user.id,
            sourceType: sourceTypeComputed,
            inputType: result.input ?? sourceTypeComputed,
            inputPreview: preview,
            rawScore: result.score,
            aiScore,
            length: detectionLength ?? null,
            sentenceCount: result.sentences.length,
            sentences: result.sentences,
            attackDetected: result.attack_detected ?? null,
            readabilityScore: result.readability_score ?? null,
            creditsUsed: requiredCredits,
            creditsRemaining: result.credits_remaining ?? null,
            version: result.version ?? null,
            language: result.language ?? null,
          });
        } catch (dbError) {
          console.error('Failed to store detection record:', dbError);
        }
      }

      return {
        success: true,
        result,
        creditsUsed: requiredCredits,
        creditsLeft: availableCredits,
        plan: activePlan.id,
        detectionId,
      };
    } catch (error) {
      console.error('detectAIContentAction error:', error);
      return {
        success: false,
        error: 'No pudimos analizar el texto. Inténtalo de nuevo.',
      };
    }
  });
