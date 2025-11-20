'use server';

import { detectAIContent } from '@/lib/winston';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';

const actionClient = createSafeActionClient();

const detectSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, { message: 'Por favor ingresa un texto para analizar.' })
    .max(1500, {
      message:
        'El texto supera el límite gratuito de 1500 caracteres. Actualiza tu plan para analizar textos más largos.',
    }),
});

export const detectAIContentAction = actionClient
  .schema(detectSchema)
  .action(async ({ parsedInput }) => {
    try {
      const result = await detectAIContent({
        text: parsedInput.text,
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
