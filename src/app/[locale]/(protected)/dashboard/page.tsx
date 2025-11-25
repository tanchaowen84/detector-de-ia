import {
  deleteAllDetectionsAction,
  deleteDetectionAction,
} from '@/actions/delete-detection';
import { setRetentionAction } from '@/actions/set-retention';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DetectionHistoryTable } from '@/components/detections/detection-history-table';
import { DeleteAllButton } from '@/components/detections/delete-all-button';
import { Button } from '@/components/ui/button';
import { getDb } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUserDetectionsSummary } from '@/lib/detections';
import { getSession } from '@/lib/server';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const db = await getDb();
  const userRow = session.user?.id
    ? await db
        .select({ metadata: user.metadata })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1)
    : [];
  const retentionDays = Number(
    (userRow[0]?.metadata as any)?.retentionDays ?? 30
  );

  const [t, history] = await Promise.all([
    getTranslations('Dashboard.history'),
    getUserDetectionsSummary({ userId: session.user.id, retentionDays }),
  ]);

  const breadcrumbs = [
    {
      label: t('breadcrumbs.history'),
      isCurrentPage: true,
    },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col py-6 px-4 sm:px-6 lg:px-8 gap-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <form
            action={async (formData) => {
              'use server';
              const value = (formData.get('retention') ?? '30') as '30' | '90';
              await setRetentionAction({
                retentionDays: value,
              });
            }}
            className="flex flex-wrap items-center gap-3"
          >
            <label className="text-sm text-slate-600" htmlFor="retention-select">
              {t('retention.label')}
            </label>
            <select
              id="retention-select"
              name="retention"
              defaultValue={String(retentionDays)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="30">{t('retention.option30')}</option>
              <option value="90">{t('retention.option90')}</option>
            </select>
            <Button variant="outline" type="submit" size="sm">
              {t('retention.save')}
            </Button>
          </form>
          <DeleteAllButton label={t('clearAll')} />
        </div>

        <DetectionHistoryTable items={history.items} total={history.total} />
      </div>
    </>
  );
}
