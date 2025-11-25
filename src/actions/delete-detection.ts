'use server';

import { deleteAllDetections, deleteDetectionById } from '@/lib/detections';
import { getSession } from '@/lib/server';
import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';

const actionClient = createSafeActionClient();

const deleteSchema = z.object({
  id: z.string().uuid(),
});

export const deleteDetectionAction = actionClient
  .schema(deleteSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      await deleteDetectionById(session.user.id, parsedInput.id);
      return { success: true };
    } catch (error) {
      console.error('deleteDetectionAction error:', error);
      return { success: false, error: 'Failed to delete detection' };
    }
  });

export const deleteAllDetectionsAction = actionClient.action(async () => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }
  try {
    await deleteAllDetections(session.user.id);
    return { success: true };
  } catch (error) {
    console.error('deleteAllDetectionsAction error:', error);
    return { success: false, error: 'Failed to delete detections' };
  }
});
