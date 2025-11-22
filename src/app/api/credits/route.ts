import { getDb } from '@/db';
import { user } from '@/db/schema';
import { getSession } from '@/lib/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const result = await db
    .select({
      credits: user.credits,
      metadata: user.metadata,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!result.length) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      credits: result[0].credits ?? 0,
      metadata: result[0].metadata ?? {},
    },
  });
}
