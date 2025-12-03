'use server';

import { getSession } from '@/lib/server';
import {
  countWords,
  deductGuestCreditsDb,
  deductUserCredits,
  getClientIp,
  loadUserPlanContext,
} from '@/lib/credits';
import { SYSTEM_PROMPT } from '@/prompts/humanizer';
import { headers } from 'next/headers';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';

const actionClient = createSafeActionClient();

const humanizeSchema = z
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
  })
  .refine(
    (data) => {
      const hasText = typeof data.text === 'string' && data.text.trim().length > 0;
      return hasText || !!data.fileUrl;
    },
    {
      message: 'Por favor proporciona un texto o archivo para humanizar.',
      path: ['text'],
    }
  );

type HumanizeResult = {
  output: string;
  tokens?: number;
};

async function fetchFileContent(fileUrl: string): Promise<{ content: string; length: number }> {
  const res = await fetch(fileUrl);
  if (!res.ok) {
    throw new Error('No se pudo obtener el archivo.');
  }

  const contentType = res.headers.get('content-type') ?? '';
  // Only allow text-ish files for this version
  if (!contentType.startsWith('text/') && !contentType.includes('json')) {
    throw new Error('Solo se admiten archivos de texto.');
  }

  const text = await res.text();
  return { content: text, length: text.length };
}

async function callOpenRouterHumanizer(inputText: string): Promise<HumanizeResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured');
  }

  const baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const model = process.env.OPENROUTER_MODEL || 'x-ai/grok-4-fast';
  const referer = process.env.OPENROUTER_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const title = process.env.OPENROUTER_SITE_NAME || 'VeriIA';

  const body = {
    model,
    temperature: 0.7,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: inputText },
    ],
  } as const;

  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(referer ? { 'HTTP-Referer': referer } : {}),
      ...(title ? { 'X-Title': title } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`OpenRouter error: ${res.status} ${errorText}`);
  }

  const data = (await res.json()) as any;
  const output: string = data?.choices?.[0]?.message?.content ?? '';
  return {
    output: output.trim(),
    tokens: data?.usage?.total_tokens,
  };
}

export const humanizeTextAction = actionClient
  .schema(humanizeSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const planContext = await loadUserPlanContext(session);
    const activePlan = planContext.plan;
    let availableCredits = planContext.credits;

    // Guest users cannot upload files
    if (planContext.isGuest && parsedInput.fileUrl) {
      return {
        success: false,
        error: 'Inicia sesión para subir archivos.',
        errorCode: 'GUEST_FILE_NOT_ALLOWED' as const,
      } as const;
    }

    // Plan gating
    if (parsedInput.fileUrl && !activePlan.allowFile) {
      return {
        success: false,
        error: 'Tu plan no permite subir archivos.',
        errorCode: 'PLAN_GATE_BLOCKED' as const,
      } as const;
    }

    // Prepare content
    let contentText = parsedInput.text?.trim() ?? '';
    if (!contentText && parsedInput.fileUrl) {
      try {
        const { content } = await fetchFileContent(parsedInput.fileUrl);
        contentText = content;
      } catch (error) {
        return { success: false, error: (error as Error).message } as const;
      }
    }

    if (!contentText) {
      return { success: false, error: 'Agrega texto para humanizar.' } as const;
    }

    // Billing: 0.5 credit per word, minimum 1
    const wordCount = countWords(contentText);
    const requiredCredits = Math.max(1, Math.ceil(wordCount * 0.5));

    // Deduct credits
    if (planContext.isGuest) {
      const ip = await getClientIp();
      const ua = (await headers()).get('user-agent');
      const deduction = await deductGuestCreditsDb(ip, ua, requiredCredits);
      if (!deduction.ok) {
        return {
          success: false,
          error: deduction.message,
          errorCode: deduction.errorCode,
        } as const;
      }
      availableCredits = deduction.creditsLeft;
    } else if (session?.user?.id) {
      const deduction = await deductUserCredits(session.user.id, activePlan, requiredCredits, {});
      if (!deduction.ok) {
        return {
          success: false,
          error: deduction.message,
          errorCode: deduction.errorCode,
        } as const;
      }
      availableCredits = deduction.creditsLeft;
    }

    // Call model
    try {
      const result = await callOpenRouterHumanizer(contentText);

      return {
        success: true,
        data: {
          output: result.output,
          tokens: result.tokens,
          creditsUsed: requiredCredits,
          creditsLeft: availableCredits,
        },
      } as const;
    } catch (error) {
      console.error('humanize error', error);
      return {
        success: false,
        error: 'No se pudo humanizar el texto. Inténtalo de nuevo.',
      } as const;
    }
  });
