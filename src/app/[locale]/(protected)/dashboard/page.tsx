import {
  deleteAllDetectionsAction,
  deleteDetectionAction,
} from '@/actions/delete-detection';
import { setRetentionAction } from '@/actions/set-retention';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DetectionHistoryTable } from '@/components/detections/detection-history-table';
import { DeleteAllButton } from '@/components/detections/delete-all-button';
import { RetentionForm } from '@/components/detections/retention-form';
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
          <RetentionForm
            initialRetention={retentionDays}
            label={t('retention.label')}
            option0={t('retention.option0')}
            option30={t('retention.option30')}
            option90={t('retention.option90')}
            saveLabel={t('retention.save')}
          />
          <DeleteAllButton label={t('clearAll')} />
        </div>

        <DetectionHistoryTable items={history.items} total={history.total} />
      </div>
    </>
  );
}
