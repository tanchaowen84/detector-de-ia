const WINSTON_API_URL = 'https://api.gowinston.ai/v2/ai-content-detection';

type WinstonSentence = {
  text: string;
  score: number;
  length?: number;
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
  length?: number;
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
  text?: string;
  fileUrl?: string;
  websiteUrl?: string;
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

  // 如果是单个对象且符合格式
  if (
    typeof sentences === 'object' &&
    sentences !== null &&
    'text' in sentences &&
    'score' in sentences &&
    typeof (sentences as any).text === 'string' &&
    typeof (sentences as any).score === 'number'
  ) {
    return [sentences as WinstonSentence];
  }

  // 否则作为 Record 处理
  return Object.values(sentences as Record<string, WinstonSentence>);
}

export async function detectAIContent({
  text,
  fileUrl,
  websiteUrl,
  language = 'auto',
  version = 'latest',
}: DetectAIContentParams): Promise<DetectAIContentResult> {
  const apiKey = process.env.WINSTON_API_KEY;

  if (!apiKey) {
    throw new Error('Winston API key is not configured');
  }

  const payload: Record<string, unknown> = {
    sentences: true,
    language,
    version,
  };

  if (websiteUrl) {
    payload.website = websiteUrl;
  } else if (fileUrl) {
    payload.file = fileUrl;
  } else if (text) {
    payload.text = text;
  } else {
    throw new Error('No input provided for Winston detection');
  }

  const response = await fetch(WINSTON_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
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
