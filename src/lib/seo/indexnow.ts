import { getBaseUrl } from '@/lib/urls/urls';
import { getIndexableUrls } from './indexable-urls';

export const INDEXNOW_KEY = 'b5677dd6383c4b7ab4d97adeaec9aedb';
export const INDEXNOW_KEY_FILENAME = `${INDEXNOW_KEY}.txt`;
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export type IndexNowPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

function normalizeBaseUrl() {
  return getBaseUrl().replace(/\/+$/, '');
}

export async function getIndexNowPayload(): Promise<IndexNowPayload> {
  const baseUrl = normalizeBaseUrl();

  return {
    host: new URL(baseUrl).host,
    key: INDEXNOW_KEY,
    keyLocation: `${baseUrl}/${INDEXNOW_KEY_FILENAME}`,
    urlList: await getIndexableUrls(),
  };
}

export async function submitIndexNowUrls(fetchImpl: typeof fetch = fetch) {
  const payload = await getIndexNowPayload();
  const response = await fetchImpl(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const responseText = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    responseText,
    payload,
  };
}
