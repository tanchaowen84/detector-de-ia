import { getSession } from '@/lib/server';
import { loadUserPlanContext } from '@/lib/credits';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Lazy reset + load latest plan/credits
  const planContext = await loadUserPlanContext(session);

  return NextResponse.json({
    success: true,
    data: {
      credits: planContext.credits ?? 0,
      metadata: planContext.metadata ?? {},
      planId: planContext.plan.id,
      isGuest: planContext.isGuest,
    },
  });
}
