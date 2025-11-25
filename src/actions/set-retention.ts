'use server';

import { getDb } from '@/db';
import { user } from '@/db/schema';
import { getSession } from '@/lib/server';
import { eq } from 'drizzle-orm';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';

const actionClient = createSafeActionClient();

const schema = z.object({
  retentionDays: z.enum(['30', '90']),
});

export const setRetentionAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }
    const db = await getDb();
    const days = Number(parsedInput.retentionDays);
    try {
      await db
        .update(user)
        .set({
          metadata: {
            ...((session.user as any).metadata ?? {}),
            retentionDays: days,
          },
          updatedAt: new Date(),
        } as any)
        .where(eq(user.id, session.user.id));

      return { success: true };
    } catch (error) {
      console.error('setRetentionAction error', error);
      return { success: false, error: 'Failed to save preference' };
    }
  });
