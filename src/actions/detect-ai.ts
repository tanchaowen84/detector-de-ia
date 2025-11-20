'use server';

import { detectAIContent } from '@/lib/winston';
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
        text: parsedInput.text,
        fileUrl: parsedInput.fileUrl,
        websiteUrl: parsedInput.websiteUrl,
      });

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
