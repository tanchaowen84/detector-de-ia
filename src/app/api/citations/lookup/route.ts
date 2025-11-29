import { NextResponse } from 'next/server';

// Simple, stable lookup: DOI via Crossref, ISBN via OpenLibrary, URL tries to extract DOI from URL or meta minimal.

const DOI_REGEX = /10\.\d{4,9}\/[-._;()\/A-Z0-9]+/i;
const ISBN_REGEX = /(97(8|9))?\d{9}(\d|X)/i;

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`fetch failed ${res.status}`);
  return res.json();
}

function extractDoiFromUrl(urlStr: string): string | null {
  try {
    const m = urlStr.match(DOI_REGEX);
    return m ? m[0] : null;
  } catch {
    return null;
  }
}

async function lookupDoi(doi: string) {
  const data = await fetchJson(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  const item = data?.message;
  if (!item) throw new Error('no crossref item');
  return {
    sourceType: item['type']?.includes('journal') ? 'journal' : 'web',
    title: Array.isArray(item.title) ? item.title[0] : item.title,
    authors: (item.author || []).map((a: any) => [a.family, a.given].filter(Boolean).join(' ')).join('; '),
    year: item.created?.['date-parts']?.[0]?.[0]?.toString() ?? '',
    journal: Array.isArray(item['container-title']) ? item['container-title'][0] : item['container-title'],
    volume: item.volume ?? '',
    issue: item.issue ?? '',
    pages: item.page ?? '',
    doi,
    url: item.URL ?? '',
  } as Record<string, string>;
}

async function lookupIsbn(isbn: string) {
  const clean = isbn.replace(/[-\s]/g, '');
  const data = await fetchJson(`https://openlibrary.org/isbn/${clean}.json`);
  return {
    sourceType: 'book',
    title: data.title ?? '',
    authors: (data.authors || [])
      .map((a: any) => a?.name)
      .filter(Boolean)
      .join('; '),
    year: (data.publish_date || '').match(/\d{4}/)?.[0] ?? '',
    publisher: Array.isArray(data.publishers) ? data.publishers[0] : data.publishers ?? '',
    pages: data.number_of_pages?.toString() ?? '',
    url: data.url ?? '',
  } as Record<string, string>;
}

async function fetchMetaFromUrl(urlStr: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(urlStr, { signal: controller.signal });
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/property="og:title" content="([^"]+)"/i);
    const metaAuthor = html.match(/name="author" content="([^"]+)"/i);
    const published = html.match(/property="article:published_time" content="([^"]+)"/i);
    const site = html.match(/property="og:site_name" content="([^"]+)"/i);
    const year = published?.[1]?.match(/\d{4}/)?.[0] ?? '';
    return {
      sourceType: 'website',
      title: ogTitleMatch?.[1] ?? titleMatch?.[1] ?? '',
      authors: metaAuthor?.[1] ?? '',
      year,
      site: site?.[1] ?? new URL(urlStr).hostname,
      url: urlStr,
    } as Record<string, string>;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  try {
    const { query } = (await request.json()) as { query?: string };
    if (!query || !query.trim()) {
      return NextResponse.json({ success: false, error: 'Empty query' }, { status: 400 });
    }

    const q = query.trim();
    const doiInQuery = q.match(DOI_REGEX)?.[0];
    const isbnInQuery = q.match(ISBN_REGEX)?.[0];

    if (doiInQuery) {
      const result = await lookupDoi(doiInQuery);
      return NextResponse.json({ success: true, data: result });
    }

    if (isbnInQuery) {
      const result = await lookupIsbn(isbnInQuery);
      return NextResponse.json({ success: true, data: result });
    }

    let url: URL | null = null;
    try {
      url = new URL(q.startsWith('http') ? q : `https://${q}`);
    } catch {
      return NextResponse.json({ success: false, error: 'No DOI/ISBN and not a URL' }, { status: 400 });
    }

    const doiFromUrl = extractDoiFromUrl(url.href);
    if (doiFromUrl) {
      const result = await lookupDoi(doiFromUrl);
      return NextResponse.json({ success: true, data: result });
    }

    // fallback: minimal meta scrape
    const meta = await fetchMetaFromUrl(url.href);
    if (meta.title || meta.authors) {
      return NextResponse.json({ success: true, data: meta });
    }

    return NextResponse.json({ success: false, error: 'No data found' }, { status: 404 });
  } catch (error) {
    console.error('citation lookup error', error);
    return NextResponse.json({ success: false, error: 'Lookup failed' }, { status: 500 });
  }
}

