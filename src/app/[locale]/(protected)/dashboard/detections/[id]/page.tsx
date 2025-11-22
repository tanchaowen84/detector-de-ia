import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDetectionById } from '@/lib/detections';
import { getSession } from '@/lib/server';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { getLocale, getTranslations } from 'next-intl/server';
import { redirect, notFound } from 'next/navigation';
import { Routes } from '@/routes';
import Link from 'next/link';

type DetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function DetectionDetailPage(props: DetailPageProps) {
  const { locale, id } = await props.params;
  const session = await getSession();
  if (!session?.user) {
    redirect(Routes.Login);
  }

  const t = await getTranslations('Dashboard.history.detail');
  const record = await getDetectionById({ userId: session.user.id, detectionId: id });

  if (!record) {
    notFound();
  }

  const localeObj = locale === 'es' ? es : enUS;
  const created = record.createdAt
    ? formatDistanceToNow(new Date(record.createdAt), { addSuffix: true, locale: localeObj })
    : '--';

  const aiScore = record.aiScore?.toFixed(1);
  const toneForScore = (score: number) => {
    if (score >= 75) {
      return 'border-red-200/70 bg-red-50 text-red-900 dark:border-red-500/20 dark:bg-red-500/10';
    }
    if (score >= 40) {
      return 'border-amber-200/70 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10';
    }
    return 'border-emerald-200/70 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10';
  };

  return (
    <div className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {t('title')}
          </h1>
          <p className="text-sm text-slate-500">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={Routes.Dashboard}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {t('back')}
          </Link>
          <Badge variant="outline" className="text-slate-700">
            {record.sourceType.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('score')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold text-slate-900">
              {aiScore ? `${aiScore}%` : '--'}
            </div>
            <p className="text-sm text-slate-500">
              {t('rawScore', { value: record.rawScore?.toFixed(2) ?? '--' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('metadata')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-700">
            <div>{t('length', { value: record.length ?? t('unknown') })}</div>
            <div>{t('sentences', { value: record.sentenceCount ?? 0 })}</div>
            <div>{t('language', { value: record.language ?? '--' })}</div>
            <div>{t('version', { value: record.version ?? '--' })}</div>
            <div>{t('created', { value: created })}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('credits')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-700">
            <div>{t('creditsUsed', { value: record.creditsUsed ?? '--' })}</div>
            <div>{t('creditsRemaining', { value: record.creditsRemaining ?? '--' })}</div>
            <div>{t('inputType', { value: record.inputType ?? record.sourceType })}</div>
            <div className="truncate text-slate-500">{record.inputPreview ?? t('noPreview')}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('sentencesTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {record.sentences?.length ? (
            record.sentences.map((sentence, idx) => {
              const tone = toneForScore(100 - sentence.score);
              return (
                <div
                  key={idx}
                  className={`rounded-lg border px-3 py-2 text-sm leading-relaxed ${tone}`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{t('sentence')} #{idx + 1}</span>
                    <span>{t('prob', { value: (100 - sentence.score).toFixed(1) })}%</span>
                  </div>
                  <div>{sentence.text}</div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">{t('noSentences')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
