'use server';
import { getSession } from '@/lib/server';
import { loadUserPlanContext, deductUserCredits, getClientIp } from '@/lib/credits';
import { headers } from 'next/headers';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';

const actionClient = createSafeActionClient();

const summarizeSchema = z
  .object({
    text: z
      .string()
      .trim()
      .optional(),
    websiteUrl: z
      .string()
      .url({ message: 'La URL no es válida.' })
      .optional(),
    fileUrl: z
      .string()
      .url({ message: 'El enlace del archivo no es válido.' })
      .optional(),
    fileName: z.string().max(255).optional(),
    lengthPercent: z.number().min(0).max(100).default(50),
    locale: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasText = typeof data.text === 'string' && data.text.trim().length > 0;
      return hasText || !!data.fileUrl || !!data.websiteUrl;
    },
    {
      message: 'Por favor proporciona un texto, archivo o URL para resumir.',
      path: ['text'],
    }
  );

type SummarizeResult = {
  summary: string;
  tokens?: number;
};

async function fetchFileContent(fileUrl: string): Promise<{ content: string; length: number }> {
  const res = await fetch(fileUrl);
  if (!res.ok) {
    throw new Error('No se pudo obtener el archivo para resumir.');
  }
  const contentType = res.headers.get('content-type') ?? '';
  // Only allow text-ish files for this first version
  if (!contentType.startsWith('text/') && !contentType.includes('json')) {
    throw new Error('Solo se admiten archivos de texto para resumir.');
  }
  const text = await res.text();
  return { content: text, length: text.length };
}

async function callOpenRouter({
  inputText,
  websiteUrl,
  lengthPercent,
  locale,
}: {
  inputText: string;
  websiteUrl?: string;
  lengthPercent: number;
  locale?: string;
}): Promise<SummarizeResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured');
  }

  const baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const model = process.env.OPENROUTER_MODEL || 'x-ai/grok-4-fast';
  const referer = process.env.OPENROUTER_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const title = process.env.OPENROUTER_SITE_NAME || 'VeriIA';

  const systemPrompt = `Eres un asistente que resume texto en el mismo idioma de entrada. Devuelve un único resumen conciso y legible, sin viñetas si no se piden, sin prefacios ni disculpas. Ajusta la longitud según un control deslizante (0 muy corto, 100 más largo).`;

  const userParts = [
    websiteUrl ? `URL de referencia (puedes acceder en línea): ${websiteUrl}` : null,
    `Longitud deseada (0-100): ${lengthPercent}`,
    inputText ? `Texto a resumir:\n\n${inputText}` : null,
  ].filter(Boolean);

  const body = {
    model,
    temperature: 0.3,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userParts.join('\n\n') },
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
  const summary: string = data?.choices?.[0]?.message?.content ?? '';
  return {
    summary: summary.trim(),
    tokens: data?.usage?.total_tokens,
  };
}

export const summarizeTextAction = actionClient
  .schema(summarizeSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    const planContext = await loadUserPlanContext(session);
    const activePlan = planContext.plan;
    let availableCredits = planContext.credits;

    const sourceType = parsedInput.websiteUrl ? 'url' : parsedInput.fileUrl ? 'file' : 'text';

    // Plan gates
    if (sourceType === 'file' && !activePlan.allowFile) {
      return { success: false, error: 'Tu plan no permite subir archivos.' } as const;
    }
    if (sourceType === 'url' && !activePlan.allowUrl) {
      return { success: false, error: 'Tu plan no permite analizar URLs.' } as const;
    }
    if (sourceType === 'text') {
      const textLength = parsedInput.text?.length ?? 0;
      if (activePlan.maxChars && textLength > activePlan.maxChars) {
        return {
          success: false,
          error: `El texto supera el límite de ${activePlan.maxChars.toLocaleString()} caracteres para tu plan.`,
        } as const;
      }
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

    // Billing: 0.01 credit per char, minimum 1 credit; URL-only uses fallback length
    const charCount = contentText.length || (parsedInput.websiteUrl ? 1000 : 0);
    let requiredCredits = Math.max(1, Math.ceil(charCount * 0.01));

    if (planContext.isGuest) {
      const ip = await getClientIp();
      const ua = (await headers()).get('user-agent');
      const deduction = await (async () => {
        const res = await import('@/lib/credits');
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
        } as const;
      }
      availableCredits = deduction.creditsLeft;
    } else if (session?.user?.id) {
      const deduction = await deductUserCredits(session.user.id, activePlan, requiredCredits, {});
      if (!deduction.ok) {
        return {
          success: false,
          error: deduction.message,
        } as const;
      }
      availableCredits = deduction.creditsLeft;
    }

    // Call model
    try {
      const result = await callOpenRouter({
        inputText: contentText,
        websiteUrl: parsedInput.websiteUrl ?? undefined,
        lengthPercent: parsedInput.lengthPercent,
        locale: parsedInput.locale,
      });

      return {
        success: true,
        data: {
          summary: result.summary,
          tokens: result.tokens,
          creditsUsed: requiredCredits,
          creditsLeft: availableCredits,
          lengthPercent: parsedInput.lengthPercent,
        },
      } as const;
    } catch (error) {
      console.error('summarize error', error);
      return {
        success: false,
        error: 'No se pudo generar el resumen. Inténtalo de nuevo.',
      } as const;
    }
  });
