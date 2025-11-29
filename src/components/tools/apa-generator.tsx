"use client";

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { LocaleLink } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { Loader2Icon } from 'lucide-react';
import { useRef } from 'react';

type SourceType = 'book' | 'journal' | 'website';

type FieldKey =
  | 'authors'
  | 'year'
  | 'title'
  | 'publisher'
  | 'journal'
  | 'volume'
  | 'issue'
  | 'pages'
  | 'doi'
  | 'url'
  | 'site'
  | 'accessDate';

const defaultFields: Record<SourceType, FieldKey[]> = {
  book: ['authors', 'year', 'title', 'publisher'],
  journal: ['authors', 'year', 'title', 'journal', 'volume', 'issue', 'pages', 'doi'],
  website: ['authors', 'year', 'title', 'site', 'url', 'accessDate'],
};

function parseAuthors(input: string): string[] {
  if (!input.trim()) return [];
  return input
    .split(/\n|;/)
    .map((a) => a.trim())
    .filter(Boolean)
    .map((author) => {
      const makeInitials = (names: string[]) =>
        names
          .filter(Boolean)
          .map((n) => n.trim())
          .filter(Boolean)
          .map((n) => `${n.charAt(0).toUpperCase()}.`)
          .join(' ');

      if (author.includes(',')) {
        const [family, given = ''] = author.split(',').map((s) => s.trim());
        const initials = makeInitials(given.split(/\s+/));
        return initials ? `${family}, ${initials}` : family;
      }

      const parts = author.split(/\s+/);
      if (parts.length === 1) return author;
      const last = parts.pop();
      const initials = makeInitials(parts);
      return `${last}, ${initials}`;
    });
}

function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return '';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  if (authors.length <= 20) {
    const head = authors.slice(0, authors.length - 1).join(', ');
    return `${head}, & ${authors.at(-1)}`;
  }
  const first = authors.slice(0, 19).join(', ');
  return `${first}, … ${authors.at(-1)}`;
}

function sentenceCase(text: string) {
  if (!text) return '';
  const lower = text.trim();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function formatInText(authors: string[], year: string) {
  const safeYear = year || 's.f.';
  if (authors.length === 0) return `(Título, ${safeYear})`;
  if (authors.length === 1) return `(${authors[0].split(',')[0]}, ${safeYear})`;
  if (authors.length === 2) return `(${authors[0].split(',')[0]} & ${authors[1].split(',')[0]}, ${safeYear})`;
  return `(${authors[0].split(',')[0]} et al., ${safeYear})`;
}

function formatReference(type: SourceType, fields: Record<FieldKey, string>) {
  const authors = parseAuthors(fields.authors || '');
  const authorsText = authors.length ? `${formatAuthors(authors)} ` : '';
  const yearText = fields.year?.trim() ? `(${fields.year.trim()}).` : '(s.f.).';

  if (type === 'book') {
    return `${authorsText}${yearText} ${sentenceCase(fields.title)}. ${fields.publisher?.trim() || ''}`.trim();
  }

  if (type === 'journal') {
    const vol = fields.volume?.trim();
    const issue = fields.issue?.trim();
    const pages = fields.pages?.trim();
    const doi = fields.doi?.trim();
    const journal = fields.journal?.trim();
    const volIssue = vol ? `${vol}${issue ? `(${issue})` : ''}` : '';
    const pagesText = pages ? `, ${pages}` : '';
    const doiText = doi ? ` https://doi.org/${doi.replace(/^https?:\/\//, '')}` : '';
    return `${authorsText}${yearText} ${sentenceCase(fields.title)}. ${journal ? `${journal}, ` : ''}${volIssue}${pagesText}.${doiText}`.trim();
  }

  // website
  const site = fields.site?.trim();
  const url = fields.url?.trim();
  const access = fields.accessDate?.trim();
  const accessText = access ? ` Recuperado ${access} de` : '';
  return `${authorsText}${yearText} ${sentenceCase(fields.title)}. ${site ? `${site}.` : ''}${accessText} ${url || ''}`.trim();
}

export function ApaGenerator() {
  const t = useTranslations('ApaGeneratorPage');
  const [sourceType, setSourceType] = useState<SourceType>('book');
  const [fields, setFields] = useState<Record<FieldKey, string>>({
    authors: '',
    year: '',
    title: '',
    publisher: '',
    journal: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    url: '',
    site: '',
    accessDate: '',
  });
  const [lookupInput, setLookupInput] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);

  const reference = useMemo(() => formatReference(sourceType, fields), [sourceType, fields]);
  const inText = useMemo(
    () => formatInText(parseAuthors(fields.authors || ''), fields.year?.trim() || ''),
    [fields.authors, fields.year]
  );

  const handleChange = (key: FieldKey, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const copyText = async (text: string, label: string) => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('form.copied', { target: label }));
    } catch (err) {
      console.error('copy failed', err);
      toast.error(t('form.copyError'));
    }
  };

  const visibleFields = defaultFields[sourceType];

  const fieldLabel = (key: FieldKey) => t(`form.fields.${key}`);
  const fieldPlaceholder = (key: FieldKey) => t(`form.placeholders.${key}`);

  const handleLookup = async () => {
    const query = lookupInput.trim();
    if (!query) {
      toast.info(t('lookup.empty'));
      return;
    }
    try {
      setIsLookingUp(true);
      const res = await fetch('/api/citations/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!data?.success) {
        toast.error(t('lookup.notFound'));
        return;
      }
      const d = data.data as Record<string, string>;
      setSourceType((d.sourceType as SourceType) || 'website');
      setFields((prev) => ({
        ...prev,
        authors: d.authors ?? prev.authors,
        year: d.year ?? prev.year,
        title: d.title ?? prev.title,
        publisher: d.publisher ?? prev.publisher,
        journal: d.journal ?? prev.journal,
        volume: d.volume ?? prev.volume,
        issue: d.issue ?? prev.issue,
        pages: d.pages ?? prev.pages,
        doi: d.doi ?? prev.doi,
        url: d.url ?? prev.url,
        site: d.site ?? prev.site,
      }));
      toast.success(t('lookup.filled'));
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('lookup error', err);
      toast.error(t('lookup.error'));
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <section className="relative py-16">
      <div className="relative z-10 mx-auto max-w-6xl px-4 lg:px-6 space-y-8">
        <div className="flex flex-col gap-3 text-center">
          <div className="flex justify-center">
            <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
              {t('hero.badge')}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t('hero.title')}
          </h1>
          <p className="text-base text-slate-600 sm:text-lg max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>

        <div className="relative w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 whitespace-nowrap">
              <span>{t('hero.styleLabel')}</span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">APA 7</span>
            </div>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="flex-1">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <input
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder={t('hero.searchPlaceholder')}
                  className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-300"
                />
              </div>
            </div>
            <Button
              type="button"
              className="h-11 flex-shrink-0 rounded-full bg-indigo-600 px-5 text-white hover:bg-indigo-500"
              onClick={handleLookup}
              disabled={isLookingUp}
            >
              {isLookingUp ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('hero.searchCta')}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
          <div className="flex-1 h-px bg-slate-200" />
          <span>{t('hero.manualLabel')}</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr] items-start" ref={formRef}>
          <Card className="border-slate-100 bg-white/95 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-800">
                {t('form.title')}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {t('form.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('form.sourceType')}
                  </label>
                  <select
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as SourceType)}
                  >
                    <option value="book">{t('form.types.book')}</option>
                    <option value="journal">{t('form.types.journal')}</option>
                    <option value="website">{t('form.types.website')}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">
                    {fieldLabel('authors')}
                  </label>
                  <Textarea
                    rows={3}
                    value={fields.authors}
                    onChange={(e) => handleChange('authors', e.target.value)}
                    placeholder={fieldPlaceholder('authors')}
                    className="resize-none"
                  />
                  <p className="text-xs text-slate-500">{t('form.hints.authors')}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">{fieldLabel('year')}</label>
                  <Input
                    value={fields.year}
                    onChange={(e) => handleChange('year', e.target.value)}
                    placeholder={fieldPlaceholder('year')}
                  />
                </div>
                {visibleFields.includes('publisher') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">{fieldLabel('publisher')}</label>
                    <Input
                      value={fields.publisher}
                      onChange={(e) => handleChange('publisher', e.target.value)}
                      placeholder={fieldPlaceholder('publisher')}
                    />
                  </div>
                )}
                {visibleFields.includes('journal') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">{fieldLabel('journal')}</label>
                    <Input
                      value={fields.journal}
                      onChange={(e) => handleChange('journal', e.target.value)}
                      placeholder={fieldPlaceholder('journal')}
                    />
                  </div>
                )}
                {visibleFields.includes('volume') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">{fieldLabel('volume')}</label>
                    <Input
                      value={fields.volume}
                      onChange={(e) => handleChange('volume', e.target.value)}
                      placeholder={fieldPlaceholder('volume')}
                    />
                  </div>
                )}
                {visibleFields.includes('issue') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">{fieldLabel('issue')}</label>
                    <Input
                      value={fields.issue}
                      onChange={(e) => handleChange('issue', e.target.value)}
                      placeholder={fieldPlaceholder('issue')}
                    />
                  </div>
                )}
                {visibleFields.includes('pages') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">{fieldLabel('pages')}</label>
                    <Input
                      value={fields.pages}
                      onChange={(e) => handleChange('pages', e.target.value)}
                      placeholder={fieldPlaceholder('pages')}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">{fieldLabel('title')}</label>
                  <Textarea
                    rows={2}
                    value={fields.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder={fieldPlaceholder('title')}
                    className="resize-none"
                  />
                </div>

                {visibleFields.includes('doi') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">{fieldLabel('doi')}</label>
                    <Input
                      value={fields.doi}
                      onChange={(e) => handleChange('doi', e.target.value)}
                      placeholder={fieldPlaceholder('doi')}
                    />
                  </div>
                )}
                {visibleFields.includes('url') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">{fieldLabel('url')}</label>
                    <Input
                      value={fields.url}
                      onChange={(e) => handleChange('url', e.target.value)}
                      placeholder={fieldPlaceholder('url')}
                    />
                  </div>
                )}
                {visibleFields.includes('site') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">{fieldLabel('site')}</label>
                    <Input
                      value={fields.site}
                      onChange={(e) => handleChange('site', e.target.value)}
                      placeholder={fieldPlaceholder('site')}
                    />
                  </div>
                )}
                {visibleFields.includes('accessDate') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">{fieldLabel('accessDate')}</label>
                    <Input
                      value={fields.accessDate}
                      onChange={(e) => handleChange('accessDate', e.target.value)}
                      placeholder={fieldPlaceholder('accessDate')}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 justify-end pt-2">
                <Button
                  variant="ghost"
                  className="text-slate-600"
                  onClick={() => {
                    setFields({
                      authors: '',
                      year: '',
                      title: '',
                      publisher: '',
                      journal: '',
                      volume: '',
                      issue: '',
                      pages: '',
                      doi: '',
                      url: '',
                      site: '',
                      accessDate: '',
                    });
                  }}
                >
                  {t('form.clear')}
                </Button>
                <Button
                  className="bg-indigo-600 text-white hover:bg-indigo-500"
                  onClick={() => {
                    if (!reference.trim()) {
                      toast.info(t('form.emptyWarning'));
                    } else {
                      toast.success(t('form.generated'));
                    }
                  }}
                >
                  {t('form.generate')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white/95 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-800">
                {t('result.title')}
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                {t('result.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-800 min-h-[140px]">
                {reference ? reference : <p className="text-slate-400">{t('result.empty')}</p>}
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('result.inText')}</p>
                <p>{inText}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  className="bg-indigo-600 text-white hover:bg-indigo-500"
                  disabled={!reference.trim()}
                  onClick={() => copyText(reference, t('result.title'))}
                >
                  {t('result.copyReference')}
                </Button>
                <Button
                  variant="outline"
                  disabled={!inText.trim()}
                  onClick={() => copyText(inText, t('result.inText'))}
                >
                  {t('result.copyInText')}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 text-sm">
                <Button asChild variant="ghost" className="text-indigo-600 hover:bg-indigo-50">
                  <LocaleLink href={Routes.PlagiarismDetector}>{t('cta.plagiarism')}</LocaleLink>
                </Button>
                <Button asChild variant="ghost" className="text-indigo-600 hover:bg-indigo-50">
                  <LocaleLink href={Routes.Root}>{t('cta.detector')}</LocaleLink>
                </Button>
                <Button asChild variant="ghost" className="text-indigo-600 hover:bg-indigo-50">
                  <LocaleLink href={Routes.TextCompare}>{t('cta.compare')}</LocaleLink>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
