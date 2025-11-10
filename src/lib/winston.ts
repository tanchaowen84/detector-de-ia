const WINSTON_API_URL = 'https://api.gowinston.ai/v2/ai-content-detection';

type WinstonSentence = {
  text: string;
  score: number;
};

type WinstonSentencesField =
  | WinstonSentence
  | WinstonSentence[]
  | Record<string, WinstonSentence>
  | undefined;

type WinstonAttackDetected = {
  zero_width_space?: boolean;
  homoglyph_attack?: boolean;
  [key: string]: boolean | undefined;
};

export interface WinstonDetectionResponse {
  status?: number;
  score: number;
  sentences?: WinstonSentencesField;
  input?: string;
  attack_detected?: WinstonAttackDetected;
  readability_score?: number;
  credits_used?: number;
  credits_remaining?: number;
  version?: string;
  language?: string;
}

export interface DetectAIContentParams {
  text: string;
  language?: string;
  version?: string;
}

export interface DetectAIContentResult extends WinstonDetectionResponse {
  sentences: WinstonSentence[];
}

function normalizeSentences(
  sentences: WinstonSentencesField
): WinstonSentence[] {
  if (!sentences) {
    return [];
  }

  if (Array.isArray(sentences)) {
    return sentences;
  }

  if ('text' in sentences && 'score' in sentences) {
    return [sentences];
  }

  return Object.values(sentences);
}

export async function detectAIContent({
  text,
  language = 'auto',
  version = 'latest',
}: DetectAIContentParams): Promise<DetectAIContentResult> {
  const apiKey = process.env.WINSTON_API_KEY;

  if (!apiKey) {
    throw new Error('Winston API key is not configured');
  }

  const response = await fetch(WINSTON_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      sentences: true,
      language,
      version,
    }),
  });

  const data = (await response.json()) as WinstonDetectionResponse;

  if (!response.ok) {
    console.error('Winston AI detection failed:', {
      status: response.status,
      statusText: response.statusText,
      body: data,
    });
    throw new Error('Failed to detect AI content');
  }

  return {
    ...data,
    sentences: normalizeSentences(data.sentences),
  };
}
