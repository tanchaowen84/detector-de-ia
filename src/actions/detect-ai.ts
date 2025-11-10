'use server';

import { detectAIContent } from '@/lib/winston';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';

const actionClient = createSafeActionClient();

const detectSchema = z.object({
  text: z
    .string()
    .trim()
    .min(300, { message: 'Por favor ingresa al menos 300 caracteres.' })
    .max(150000, {
      message: 'El texto es demasiado largo. Límite: 150000 caracteres.',
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
