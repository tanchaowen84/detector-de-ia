'use server';

import { detectPlagiarism } from '@/lib/winston';
import { countWords, deductGuestCreditsDb, deductUserCredits, loadUserPlanContext } from '@/lib/credits';
import { getSession } from '@/lib/server';
import { getDb } from '@/db';
import { detections } from '@/db/schema';
import { headers } from 'next/headers';
import { createSafeActionClient } from 'next-safe-action';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const actionClient = createSafeActionClient();

const plagiarismSchema = z
  .object({
    text: z.string().trim().optional(),
    fileUrl: z.string().url().optional(),
    fileName: z.string().max(255).optional(),
    websiteUrl: z.string().url().optional(),
    excludedSources: z.array(z.string().trim()).optional(),
    language: z.string().optional(),
    country: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasText = typeof data.text === 'string' && data.text.trim().length > 0;
      return hasText || !!data.fileUrl || !!data.websiteUrl;
    },
    { message: 'Proporciona texto, archivo o URL para analizar.', path: ['text'] }
  );

export const detectPlagiarismAction = actionClient
  .schema(plagiarismSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const planContext = await loadUserPlanContext(session);
    const activePlan = planContext.plan;
    let availableCredits = planContext.credits;
    const db = await getDb();

    const sourceType = parsedInput.websiteUrl ? 'url' : parsedInput.fileUrl ? 'file' : 'text';

    if (sourceType === 'file' && !activePlan.allowFile) {
      return {
        success: false,
        error: 'Tu plan no permite subir archivos. Actualiza tu plan.',
        errorCode: 'PLAN_GATE_BLOCKED' as const,
      };
    }
    if (sourceType === 'url' && !activePlan.allowUrl) {
      return {
        success: false,
        error: 'Tu plan no permite analizar URLs. Actualiza tu plan.',
        errorCode: 'PLAN_GATE_BLOCKED' as const,
      };
    }

    if (sourceType === 'text' && activePlan.maxChars && (parsedInput.text?.length ?? 0) > activePlan.maxChars) {
      return {
        success: false,
        error: `El texto supera el límite de ${activePlan.maxChars.toLocaleString()} caracteres para tu plan.`,
        errorCode: 'PLAN_GATE_BLOCKED' as const,
      };
    }

    // Pre-check for text inputs using 2 credits/word; for file/url skip estimate
    let estimatedCredits = 0;
    if (sourceType === 'text') {
      estimatedCredits = Math.max(1, countWords(parsedInput.text ?? '') * 2);
      if (availableCredits < estimatedCredits) {
        return {
          success: false,
          error: 'Créditos insuficientes. Actualiza tu plan.',
          errorCode: 'INSUFFICIENT_CREDITS' as const,
        };
      }
    }

    const filteredExcluded =
      parsedInput.excludedSources
        ?.map((s) => s.trim())
        .filter(Boolean)
        .filter((s) => {
          try {
            new URL(s.startsWith('http') ? s : `https://${s}`);
            return true;
          } catch {
            return false;
          }
        }) ?? [];

    try {
      const result = await detectPlagiarism({
        text: parsedInput.text || undefined,
        fileUrl: parsedInput.fileUrl,
        websiteUrl: parsedInput.websiteUrl,
        excludedSources: filteredExcluded.length ? filteredExcluded : undefined,
        language: parsedInput.language ?? 'auto',
        country: parsedInput.country ?? 'us',
      });

      const creditsUsed = Math.max(1, result.credits_used ?? estimatedCredits ?? 1);

      if (planContext.isGuest) {
        const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const ua = (await headers()).get('user-agent');
        const deduction = await deductGuestCreditsDb(ip, ua, creditsUsed);
        if (!deduction.ok) {
          return {
            success: false,
            error: deduction.message,
            errorCode: deduction.errorCode,
          };
        }
        availableCredits = deduction.creditsLeft;
      } else if (session?.user?.id) {
        const deduction = await deductUserCredits(session.user.id, activePlan, creditsUsed, {
          planId: activePlan.id,
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

      if (session?.user?.id && activePlan.saveHistory) {
        const preview =
          sourceType === 'text'
            ? parsedInput.text?.slice(0, 200) ?? null
            : sourceType === 'file'
              ? parsedInput.fileName ?? parsedInput.fileUrl ?? null
              : parsedInput.websiteUrl ?? null;

        try {
          await db.insert(detections).values({
            id: randomUUID(),
            userId: session.user.id,
            sourceType,
            inputType: 'plagiarism',
            inputPreview: preview,
            rawScore: result.result.score,
            aiScore: result.result.score,
            length: parsedInput.text?.length ?? null,
            sentenceCount: null,
            sentences: null,
            attackDetected: result.attackDetected ?? null,
            readabilityScore: null,
            creditsUsed,
            creditsRemaining: result.credits_remaining ?? null,
            version: result.scanInformation?.service ?? null,
            language: result.scanInformation?.language ?? null,
          });
        } catch (dbError) {
          console.error('Failed to store plagiarism record:', dbError);
        }
      }

      return {
        success: true,
        result,
        creditsUsed,
        creditsLeft: availableCredits,
      };
    } catch (error) {
      console.error('detectPlagiarismAction error:', error);
      return {
        success: false,
        error: 'No pudimos analizar el plagio. Inténtalo de nuevo.',
      };
    }
  });
