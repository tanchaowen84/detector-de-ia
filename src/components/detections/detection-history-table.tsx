import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LocaleLink } from '@/i18n/navigation';
import { Routes } from '@/routes';

export type DetectionSummaryItem = {
  id: string;
  sourceType: string;
  inputType: string;
  inputPreview: string | null;
  aiScore: number;
  rawScore: number;
  sentenceCount: number | null;
  length: number | null;
  language: string | null;
  version: string | null;
  createdAt: Date;
};

interface DetectionHistoryTableProps {
  items: DetectionSummaryItem[];
  total: number;
  t: (key: string, values?: Record<string, string | number>) => string;
  locale: string;
}

const sourceBadgeVariants: Record<string, string> = {
  text: 'bg-slate-100 text-slate-700',
  file: 'bg-blue-100 text-blue-700',
  url: 'bg-emerald-100 text-emerald-700',
};

function formatDateTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function DetectionHistoryTable({ items, total, t, locale }: DetectionHistoryTableProps) {
  return (
    <Card className="min-w-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold text-slate-900">
          {t('title')}
        </CardTitle>
        <p className="text-sm text-slate-500">
          {t('description', { total })}
        </p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center">
            <div>
              <p className="text-lg font-semibold text-slate-800">
                {t('empty.title')}
              </p>
              <p className="text-sm text-slate-500">{t('empty.subtitle')}</p>
            </div>
            <Button asChild className="rounded-full px-6">
              <LocaleLink href={Routes.Root}>{t('empty.cta')}</LocaleLink>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.columns.input')}</TableHead>
                  <TableHead>{t('table.columns.source')}</TableHead>
                  <TableHead>{t('table.columns.score')}</TableHead>
                  <TableHead>{t('table.columns.language')}</TableHead>
                  <TableHead>{t('table.columns.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="text-sm">
                    <TableCell>
                      <div className="max-w-[320px] truncate text-slate-900">
                        {item.inputPreview ?? t('table.unknownInput')}
                      </div>
                      <p className="text-xs text-slate-400">
                        {item.sentenceCount ?? 0} {t('table.sentences')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={sourceBadgeVariants[item.sourceType] ?? 'bg-slate-100 text-slate-700'}>
                        {t(`table.source.${item.sourceType}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">
                        {item.aiScore.toFixed(1)}%
                      </div>
                      <p className="text-xs text-slate-400">
                        {t('table.rawScore', { value: item.rawScore.toFixed(2) })}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-900">{item.language?.toUpperCase() ?? '--'}</div>
                      <p className="text-xs text-slate-400">{item.version ?? '—'}</p>
                    </TableCell>
                    <TableCell>
                      <div className="text-slate-900">
                        {formatDateTime(item.createdAt, locale)}
                      </div>
                      <p className="text-xs text-slate-400">
                        {item.length
                          ? t('table.characters', { value: item.length })
                          : t('table.charactersUnknown')}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
