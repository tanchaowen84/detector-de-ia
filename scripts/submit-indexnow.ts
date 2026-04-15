import { parseArgs } from 'node:util';

const DEFAULT_KEY = 'b5677dd6383c4b7ab4d97adeaec9aedb';
const DEFAULT_ENDPOINT = 'https://api.indexnow.org/indexnow';

type SitemapEntry = {
  url: string | URL;
};

function normalizeBaseUrl(input?: string): string {
  if (!input) {
    throw new Error(
      'Missing base URL. Pass --base-url=https://detectordeia.pro or set NEXT_PUBLIC_BASE_URL.'
    );
  }

  const normalized = input.endsWith('/') ? input.slice(0, -1) : input;
  const url = new URL(normalized);

  return url.origin;
}

function extractLocEntries(xml: string): string[] {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}

async function loadSitemapUrls(baseUrl: string): Promise<string[]> {
  const origin = new URL(baseUrl).origin;
  const sitemapUrl = new URL('/sitemap.xml', `${baseUrl}/`).toString();
  const response = await fetch(sitemapUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap.xml from ${sitemapUrl}.`);
  }

  const xml = await response.text();
  const entries = extractLocEntries(xml).map((url) => ({
    url,
  })) as SitemapEntry[];

  return [...new Set(entries.map((entry) => String(entry.url)))]
    .filter((url) => new URL(url).origin === origin)
    .sort();
}

async function main() {
  const args = process.argv.slice(2).filter((argument) => argument !== '--');
  const { values } = parseArgs({
    args,
    options: {
      'base-url': {
        type: 'string',
      },
      endpoint: {
        type: 'string',
      },
      key: {
        type: 'string',
      },
      submit: {
        type: 'boolean',
      },
      'dry-run': {
        type: 'boolean',
      },
    },
  });

  const submit = values.submit ?? false;
  const baseUrl = normalizeBaseUrl(
    values['base-url'] ?? process.env.NEXT_PUBLIC_BASE_URL
  );
  const key = values.key ?? process.env.INDEXNOW_KEY ?? DEFAULT_KEY;
  const endpoint = values.endpoint ?? DEFAULT_ENDPOINT;
  const host = new URL(baseUrl).host;
  const keyLocation = new URL(`/${key}.txt`, `${baseUrl}/`).toString();
  const urlList = await loadSitemapUrls(baseUrl);

  if (urlList.length === 0) {
    throw new Error(`No sitemap URLs found for host ${host}.`);
  }

  const payload = {
    host,
    key,
    keyLocation,
    urlList,
  };

  if (!submit) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          endpoint,
          count: urlList.length,
          ...payload,
        },
        null,
        2
      )
    );
    return;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  console.log(
    JSON.stringify(
      {
        mode: 'submit',
        endpoint,
        count: urlList.length,
        keyLocation,
        status: response.status,
        response: responseText,
      },
      null,
      2
    )
  );

  if (!response.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        message: error instanceof Error ? error.message : String(error),
      },
      null,
      2
    )
  );
  process.exit(1);
});
