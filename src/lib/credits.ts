import { cookies, headers } from 'next/headers';
import { randomUUID, createHmac } from 'node:crypto';
import { sql, and, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { user, payment, creditsHistory } from '@/db/schema';
import { getPlanByPriceId, getPlanPolicy, type PlanPolicy } from '@/config/plan-policy';
import { findPlanByPriceId } from '@/lib/price-plan';
import { type Session } from '@/lib/auth-types';

type UserMetadata = Record<string, any> & {
  planId?: string;
  creditsResetAt?: string | null;
  oneTimeExpiresAt?: string | null;
};

type GuestBucket = {
  credits: number;
  resetAt: string;
};

export type PlanContext = {
  plan: PlanPolicy;
  credits: number;
  metadata: UserMetadata;
  isGuest: boolean;
};

export type CreditCheckResult =
  | { ok: true; creditsLeft: number }
  | { ok: false; errorCode: 'INSUFFICIENT_CREDITS' | 'PLAN_GATE_BLOCKED'; message: string };

const FIVE_CHARS_AVG_WORD = 5;

export function countWords(text: string): number {
  if (!text) return 0;
  // Split on whitespace, filter empties
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateWordsFromChars(chars: number | null | undefined): number {
  if (!chars || chars <= 0) return 0;
  return Math.max(1, Math.ceil(chars / FIVE_CHARS_AVG_WORD));
}

export function getClientIp(): string {
  const h = headers();
  const xfwd = h.get('x-forwarded-for');
  if (xfwd) return xfwd.split(',')[0]?.trim() || 'unknown';
  const realIp = h.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

function getSigningSecret() {
  return process.env.BETTER_AUTH_SECRET || process.env.WINSTON_API_KEY || 'fallback-secret';
}

function signPayload(payload: string) {
  return createHmac('sha256', getSigningSecret()).update(payload).digest('hex');
}

function parseGuestCookie(value: string | undefined): GuestBucket | null {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = signPayload(payload);
  if (expected !== signature) return null;
  try {
    const json = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json) as GuestBucket;
  } catch {
    return null;
  }
}

function serializeGuestCookie(bucket: GuestBucket) {
  const payload = Buffer.from(JSON.stringify(bucket)).toString('base64');
  const sig = signPayload(payload);
  return `${payload}.${sig}`;
}

function getGuestBucket(): GuestBucket {
  const store = cookies();
  const parsed = parseGuestCookie(store.get('guest_credits')?.value);
  const now = new Date();
  if (parsed) {
    const resetAt = new Date(parsed.resetAt);
    if (resetAt > now) return parsed;
  }
  const reset = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return { credits: 400, resetAt: reset.toISOString() };
}

function saveGuestBucket(bucket: GuestBucket) {
  const store = cookies();
  store.set('guest_credits', serializeGuestCookie(bucket), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    expires: new Date(bucket.resetAt),
  });
}

export async function resolvePlanForUser(session: Session | null): Promise<PlanPolicy> {
  if (!session?.user) return getPlanPolicy('guest');

  const db = await getDb();
  const userRecord = await db
    .select({
      id: user.id,
      metadata: user.metadata,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  const metadata = (userRecord[0]?.metadata as UserMetadata | undefined) ?? {};
  if (metadata.planId && getPlanPolicy(metadata.planId)) {
    return getPlanPolicy(metadata.planId);
  }

  // Fallback to payment mapping
  const activePayment = await db
    .select({
      priceId: payment.priceId,
      status: payment.status,
      type: payment.type,
      createdAt: payment.createdAt,
    })
    .from(payment)
    .where(eq(payment.userId, session.user.id))
    .orderBy(desc(payment.createdAt))
    .limit(1);

  if (activePayment.length > 0) {
    const planFromPrice = getPlanByPriceId(activePayment[0].priceId);
    if (planFromPrice) return planFromPrice;
    const legacyPlan = findPlanByPriceId(activePayment[0].priceId);
    if (legacyPlan) return getPlanPolicy(legacyPlan.id);
  }

  return getPlanPolicy('free');
}

export async function loadUserPlanContext(session: Session | null): Promise<PlanContext> {
  if (!session?.user) {
    const plan = getPlanPolicy('guest');
    const bucket = getGuestBucket();
    return { plan, credits: bucket.credits, metadata: {}, isGuest: true };
  }

  const db = await getDb();
  const rows = await db
    .select({
      id: user.id,
      credits: user.credits,
      metadata: user.metadata,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!rows.length) {
    return { plan: getPlanPolicy('guest'), credits: 0, metadata: {}, isGuest: true };
  }

  const metadata = (rows[0].metadata as UserMetadata | undefined) ?? {};
  let plan = await resolvePlanForUser(session);
  const now = new Date();
  let credits = rows[0].credits ?? 0;
  let updatedMetadata = { ...metadata };
  let shouldPersist = false;

  // Handle reset for monthly/free
  if (plan.monthlyCredits) {
    const resetAt = metadata.creditsResetAt ? new Date(metadata.creditsResetAt) : null;
    if (!resetAt || resetAt <= now) {
      credits = plan.monthlyCredits;
      const nextReset = new Date(now);
      nextReset.setMonth(nextReset.getMonth() + 1);
      updatedMetadata.creditsResetAt = nextReset.toISOString();
      updatedMetadata.planId = plan.id;
      shouldPersist = true;
    }
  } else if (plan.resetIntervalDays) {
    const resetAt = metadata.creditsResetAt ? new Date(metadata.creditsResetAt) : null;
    if (!resetAt || resetAt <= now) {
      credits = plan.monthlyCredits ?? 400;
      const nextReset = new Date(now.getTime() + plan.resetIntervalDays * 24 * 60 * 60 * 1000);
      updatedMetadata.creditsResetAt = nextReset.toISOString();
      updatedMetadata.planId = plan.id;
      shouldPersist = true;
    }
  }

  // One-time expiry (trial pack / lifetime)
  if (plan.oneTimeExpiresDays && updatedMetadata.oneTimeExpiresAt) {
    const expireAt = new Date(updatedMetadata.oneTimeExpiresAt);
    if (expireAt <= now) {
      credits = 0;
      updatedMetadata.oneTimeExpiresAt = null;
      plan = getPlanPolicy('free');
      updatedMetadata.planId = plan.id;
      shouldPersist = true;
    }
  }

  if (shouldPersist) {
    await db
      .update(user)
      .set({
        credits,
        metadata: updatedMetadata,
        updatedAt: new Date(),
      } as any)
      .where(eq(user.id, session.user.id));
  }

  return { plan, credits, metadata: updatedMetadata, isGuest: false };
}

export async function deductUserCredits(
  userId: string,
  plan: PlanPolicy,
  required: number,
  metadataPatch: Partial<UserMetadata> = {}
): Promise<CreditCheckResult> {
  if (required <= 0) return { ok: true, creditsLeft: 0 };
  const db = await getDb();

  try {
    const result = await db.transaction(async (tx) => {
      const userRow = await tx
        .select({
          credits: user.credits,
          metadata: user.metadata,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!userRow.length) {
        throw new Error('User not found');
      }

      const currentCredits = userRow[0].credits ?? 0;
      if (currentCredits < required) {
        return null;
      }

      const mergedMetadata: UserMetadata = {
        ...(userRow[0].metadata as UserMetadata | undefined),
        ...metadataPatch,
        planId: plan.id,
      };

      const updated = await tx
        .update(user)
        .set({
          credits: sql`${user.credits} - ${required}`,
          metadata: mergedMetadata,
          updatedAt: new Date(),
        } as any)
        .where(and(eq(user.id, userId), sql`${user.credits} >= ${required}`))
        .returning({ credits: user.credits });

      if (!updated.length) {
        return null;
      }

      await tx.insert(creditsHistory).values({
        id: randomUUID(),
        userId,
        amount: required,
        type: 'subtract',
        description: `AI detection (${plan.id})`,
        createdAt: new Date(),
        metadata: { planId: plan.id },
      });

      return updated[0].credits;
    });

    if (result === null) {
      return {
        ok: false,
        errorCode: 'INSUFFICIENT_CREDITS',
        message: 'No tienes créditos suficientes. Actualiza tu plan.',
      };
    }

    return { ok: true, creditsLeft: result };
  } catch (error) {
    console.error('deductUserCredits error:', error);
    return {
      ok: false,
      errorCode: 'INSUFFICIENT_CREDITS',
      message: 'No tienes créditos suficientes. Inténtalo de nuevo.',
    };
  }
}

export function deductGuestCredits(required: number): CreditCheckResult {
  if (required <= 0) return { ok: true, creditsLeft: 0 };
  const bucket = getGuestBucket();
  if (bucket.credits < required) {
    return {
      ok: false,
      errorCode: 'INSUFFICIENT_CREDITS',
      message: 'Créditos insuficientes. Crea cuenta para obtener más.',
    };
  }
  bucket.credits -= required;
  saveGuestBucket(bucket);
  return { ok: true, creditsLeft: bucket.credits };
}
