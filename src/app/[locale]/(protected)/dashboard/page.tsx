import { DetectionHistoryTable } from '@/components/detections/detection-history-table';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { getUserDetectionsSummary } from '@/lib/detections';
import { getSession } from '@/lib/server';
import { getLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const [t, locale, history] = await Promise.all([
    getTranslations('Dashboard.history'),
    getLocale(),
    getUserDetectionsSummary({ userId: session.user.id }),
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
      <div className="flex flex-1 flex-col py-6">
        <DetectionHistoryTable
          items={history.items}
          total={history.total}
          t={t}
          locale={locale}
        />
      </div>
    </>
  );
}
