const WINSTON_API_URL = 'https://api.gowinston.ai/v2/ai-content-detection';
const WINSTON_COMPARE_URL = 'https://api.gowinston.ai/v2/text-compare';
const WINSTON_PLAGIARISM_URL = 'https://api.gowinston.ai/v2/plagiarism';

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

// Text compare types
export interface TextCompareItem {
  type: string;
  word_count: number;
  index_start: number;
  length: number;
}

export interface TextCompareSide {
  total_word_count: number;
  matching_word_count: number;
  similarity_percentage: number;
  items?: TextCompareItem[];
}

export interface TextCompareResponse {
  status?: number;
  similarity_score: number;
  first_text: TextCompareSide;
  second_text: TextCompareSide;
  credits_used?: number;
  credits_remaining?: number;
}

// Plagiarism types
export interface PlagiarismScanInformation {
  service?: string;
  scanTime?: string;
  inputType?: string;
  language?: string;
}

export interface PlagiarismSourceMatch {
  startIndex: number;
  endIndex: number;
  sequence: string;
}

export interface PlagiarismSource {
  score: number;
  canAccess?: boolean;
  url?: string;
  title?: string;
  plagiarismWords?: number;
  identicalWordCounts?: number;
  similarWordCounts?: number;
  totalNumberOfWords?: number;
  author?: string;
  description?: string;
  publishedDate?: number;
  source?: string;
  citation?: boolean;
  plagiarismFound?: PlagiarismSourceMatch[];
  is_excluded?: boolean;
}

export interface PlagiarismResultSummary {
  score: number;
  sourceCounts?: number;
  textWordCounts?: number;
  totalPlagiarismWords?: number;
  identicalWordCounts?: number;
  similarWordCounts?: number;
}

export interface PlagiarismResponse {
  status?: number;
  scanInformation?: PlagiarismScanInformation;
  result: PlagiarismResultSummary;
  sources?: PlagiarismSource[];
  attackDetected?: WinstonAttackDetected;
  text?: string;
  similarWords?: { index: number; word: string }[];
  citations?: string[];
  indexes?: PlagiarismSourceMatch[];
  credits_used?: number;
  credits_remaining?: number;
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

export async function compareTexts({
  firstText,
  secondText,
}: {
  firstText: string;
  secondText: string;
}): Promise<TextCompareResponse> {
  const apiKey = process.env.WINSTON_API_KEY;

  if (!apiKey) {
    throw new Error('Winston API key is not configured');
  }

  const payload = {
    first_text: firstText,
    second_text: secondText,
  };

  const response = await fetch(WINSTON_COMPARE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as TextCompareResponse;

  if (!response.ok) {
    console.error('Winston text compare failed:', {
      status: response.status,
      statusText: response.statusText,
      body: data,
    });
    throw new Error('Failed to compare texts');
  }

  return data;
}

export async function detectPlagiarism({
  text,
  fileUrl,
  websiteUrl,
  excludedSources,
  language = 'auto',
  country = 'us',
}: {
  text?: string;
  fileUrl?: string;
  websiteUrl?: string;
  excludedSources?: string[];
  language?: string;
  country?: string;
}): Promise<PlagiarismResponse> {
  const apiKey = process.env.WINSTON_API_KEY;

  if (!apiKey) {
    throw new Error('Winston API key is not configured');
  }

  const payload: Record<string, unknown> = {
    language,
    country,
  };

  if (excludedSources?.length) {
    payload.excluded_sources = excludedSources;
  }

  if (websiteUrl) {
    payload.website = websiteUrl;
  } else if (fileUrl) {
    payload.file = fileUrl;
  } else if (text) {
    payload.text = text;
  } else {
    throw new Error('No input provided for Winston plagiarism detection');
  }

  const response = await fetch(WINSTON_PLAGIARISM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as PlagiarismResponse;

  if (!response.ok) {
    console.error('Winston plagiarism detection failed:', {
      status: response.status,
      statusText: response.statusText,
      body: data,
    });
    throw new Error('Failed to detect plagiarism');
  }

  return data;
}
