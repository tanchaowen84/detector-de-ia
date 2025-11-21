'use server';

import { detections } from '@/db/schema';
import { getDb } from '@/db';
import { getSession } from '@/lib/server';
import { detectAIContent } from '@/lib/winston';
import { randomUUID } from 'node:crypto';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';

const actionClient = createSafeActionClient();

const detectSchema = z
  .object({
    text: z
      .string()
      .trim()
      .max(1500, {
        message:
          'El texto supera el límite gratuito de 1500 caracteres. Actualiza tu plan para analizar textos más largos.',
      })
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
    try {
      const result = await detectAIContent({
        text: parsedInput.text && parsedInput.text.length > 0 ? parsedInput.text : undefined,
        fileUrl: parsedInput.fileUrl,
        websiteUrl: parsedInput.websiteUrl,
      });

      const session = await getSession();
      if (session?.user?.id) {
        const sourceType = parsedInput.websiteUrl
          ? 'url'
          : parsedInput.fileUrl
            ? 'file'
            : 'text';

        let preview: string | null = null;
        if (sourceType === 'text') {
          preview = parsedInput.text?.slice(0, 200) ?? null;
        } else if (sourceType === 'file') {
          preview = parsedInput.fileName ?? parsedInput.fileUrl ?? null;
        } else if (sourceType === 'url') {
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
          const db = await getDb();
          await db.insert(detections).values({
            id: randomUUID(),
            userId: session.user.id,
            sourceType,
            inputType: result.input ?? sourceType,
            inputPreview: preview,
            rawScore: result.score,
            aiScore,
            length: detectionLength ?? null,
            sentenceCount: result.sentences.length,
            sentences: result.sentences,
            attackDetected: result.attack_detected ?? null,
            readabilityScore: result.readability_score ?? null,
            creditsUsed: result.credits_used ?? null,
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
      };
    } catch (error) {
      console.error('detectAIContentAction error:', error);
      return {
        success: false,
        error: 'No pudimos analizar el texto. Inténtalo de nuevo.',
      };
    }
  });
