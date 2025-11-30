import { getDb } from '@/db';
import { detections, user } from '@/db/schema';
import { and, desc, eq, gt, lt, sql } from 'drizzle-orm';
import type { DetectionSentence } from '@/db/schema';

export type DetectionSourceType = 'text' | 'file' | 'url';

export interface DetectionListParams {
  userId: string;
  page?: number;
  pageSize?: number;
  sourceType?: DetectionSourceType;
  retentionDays?: number;
}

export async function getUserDetectionsSummary({
  userId,
  page = 0,
  pageSize = 20,
  sourceType,
  retentionDays,
}: DetectionListParams) {
  const db = await getDb();

  let whereClause = eq(detections.userId, userId);
  if (sourceType) {
    whereClause = and(whereClause, eq(detections.sourceType, sourceType))!;
  }
  if (retentionDays && retentionDays > 0) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    // Only keep records within the retention window
    whereClause = and(whereClause, gt(detections.createdAt, cutoff))!;
    // Soft cleanup: delete outdated records for this user
    await db
      .delete(detections)
      .where(and(eq(detections.userId, userId), lt(detections.createdAt, cutoff)));
  }

  const offset = page * pageSize;

  const [items, [{ count }]] = await Promise.all([
    db
      .select({
        id: detections.id,
        sourceType: detections.sourceType,
        inputPreview: detections.inputPreview,
        inputType: detections.inputType,
        aiScore: detections.aiScore,
        rawScore: detections.rawScore,
        sentenceCount: detections.sentenceCount,
        length: detections.length,
        language: detections.language,
        version: detections.version,
        createdAt: detections.createdAt,
      })
      .from(detections)
      .where(whereClause)
      .orderBy(desc(detections.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql`count(*)` })
      .from(detections)
      .where(whereClause),
  ]);

  return {
    items,
    total: Number(count),
    page,
    pageSize,
  };
}

export async function getDetectionById({
  userId,
  detectionId,
}: {
  userId: string;
  detectionId: string;
}) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(detections)
    .where(and(eq(detections.userId, userId), eq(detections.id, detectionId)))
    .limit(1);

  if (!rows.length) return null;

  const record = rows[0];

  return {
    ...record,
    sentences: (record.sentences ?? []) as DetectionSentence[],
  };
}

export async function deleteDetectionById(userId: string, detectionId: string) {
  const db = await getDb();
  await db
    .delete(detections)
    .where(and(eq(detections.userId, userId), eq(detections.id, detectionId)));
}

export async function deleteAllDetections(userId: string) {
  const db = await getDb();
  await db.delete(detections).where(eq(detections.userId, userId));
}
