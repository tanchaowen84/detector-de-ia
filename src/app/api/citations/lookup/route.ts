import { NextResponse } from 'next/server';

// Simple, stable lookup: DOI via Crossref, ISBN via OpenLibrary, URL tries to extract DOI or meta data.

const DOI_REGEX = /10\.\d{4,9}\/[-._;()\/A-Z0-9]+/i;
const ISBN_REGEX = /(97(8|9))?\d{9}(\d|X)/i;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_HTML_BYTES = 512 * 1024; // cap read size to avoid huge pages

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
    // store as "Family, Given" so formatter handles initials correctly
    authors: (item.author || [])
      .map((a: any) => [a.family, a.given].filter(Boolean).join(', '))
      .join('; '),
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

function parseMetaTags(html: string) {
  const metaMatches = Array.from(
    html.matchAll(/<meta\s+(?:name|property)=["']([^"']+)["']\s+content=["']([^"']+)["'][^>]*>/gi)
  );
  const meta: Record<string, string | string[]> = {};
  for (const [, name, content] of metaMatches) {
    const key = name.toLowerCase();
    if (meta[key]) {
      const existing = meta[key];
      meta[key] = Array.isArray(existing) ? [...existing, content] : [existing as string, content];
    } else {
      meta[key] = content;
    }
  }
  return meta;
}

function pickFirst(meta: Record<string, string | string[]>, key: string) {
  const v = meta[key];
  if (!v) return '';
  return Array.isArray(v) ? v[0] : v;
}

function ensureArray(meta: Record<string, string | string[]>, key: string) {
  const v = meta[key];
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function parseJsonLd(html: string) {
  const scripts = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  );
  const entries: any[] = [];
  for (const [, body] of scripts) {
    try {
      const json = JSON.parse(body.trim());
      if (Array.isArray(json)) {
        entries.push(...json);
      } else {
        entries.push(json);
      }
    } catch {
      // ignore parse errors
    }
  }
  return entries;
}

async function fetchMetaFromUrl(urlStr: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(urlStr, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (APA Citation Lookup)' },
    });
    const buf = await res.arrayBuffer();
    const slice = buf.byteLength > MAX_HTML_BYTES ? buf.slice(0, MAX_HTML_BYTES) : buf;
    const html = new TextDecoder().decode(slice);

    // Meta tags (OpenGraph, Highwire)
    const meta = parseMetaTags(html);

    // JSON-LD (schema.org Article/ScholarlyArticle)
    const jsonld = parseJsonLd(html);
    const articleLd = jsonld.find(
      (entry) =>
        entry['@type'] === 'Article' ||
        entry['@type'] === 'ScholarlyArticle' ||
        (Array.isArray(entry['@type']) &&
          entry['@type'].some((t: string) => t === 'Article' || t === 'ScholarlyArticle'))
    );

    const titleTag = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? '';
    const ogTitle = pickFirst(meta, 'og:title') || titleTag;
    const ogSite = pickFirst(meta, 'og:site_name');
    const metaAuthor = pickFirst(meta, 'author');
    const citationAuthors = ensureArray(meta, 'citation_author');
    const citationTitle = pickFirst(meta, 'citation_title');
    const citationJournal = pickFirst(meta, 'citation_journal_title');
    const citationDoi = pickFirst(meta, 'citation_doi');
    const citationDate = pickFirst(meta, 'citation_date') || pickFirst(meta, 'citation_publication_date');
    const citationYear = pickFirst(meta, 'citation_year');
    const citationVolume = pickFirst(meta, 'citation_volume');
    const citationIssue = pickFirst(meta, 'citation_issue');
    const citationFirst = pickFirst(meta, 'citation_firstpage');
    const citationLast = pickFirst(meta, 'citation_lastpage');

    const ldTitle = articleLd?.headline || articleLd?.name || '';
    const ldAuthors = Array.isArray(articleLd?.author)
      ? articleLd.author
          .map((a: any) => a?.name)
          .filter(Boolean)
      : articleLd?.author?.name
        ? [articleLd.author.name]
        : [];
    const ldDate = articleLd?.datePublished || articleLd?.dateCreated || '';
    const ldDoi = articleLd?.identifier && typeof articleLd.identifier === 'string'
      ? articleLd.identifier.match(DOI_REGEX)?.[0]
      : null;

    // Prefer explicit DOIs from meta/jsonld
    const doi = citationDoi || ldDoi;

    const yearFromDate = (citationDate || ldDate || '').match(/\d{4}/)?.[0] ?? '';
    const year = citationYear || yearFromDate;
    const pages = citationFirst && citationLast ? `${citationFirst}-${citationLast}` : citationFirst || '';

    // Authors priority: citation_author > ldAuthors > meta author
    const authorsJoined =
      citationAuthors.join('; ') ||
      ldAuthors.join('; ') ||
      metaAuthor ||
      '';

    // Title priority: citation_title > ldTitle > og/title tag
    const title = citationTitle || ldTitle || ogTitle || titleTag;

    const site = ogSite || new URL(urlStr).hostname;

    const inferredSourceType =
      citationJournal || citationVolume || citationIssue ? 'journal' : 'website';

    return {
      sourceType: inferredSourceType,
      title,
      authors: authorsJoined,
      year,
      journal: citationJournal || '',
      volume: citationVolume || '',
      issue: citationIssue || '',
      pages,
      doi: doi || '',
      site,
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
