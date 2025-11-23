import { cookies, headers } from 'next/headers';
import { randomUUID, createHmac } from 'node:crypto';
import { sql, and, eq, desc } from 'drizzle-orm';
import { getDb } from '@/db';
import { user, payment, creditsHistory, guestCredits } from '@/db/schema';
import { getPlanByPriceId, getPlanPolicy, type PlanPolicy } from '@/config/plan-policy';
import { findPlanByPriceId } from '@/lib/price-plan';
import { type Session } from '@/lib/auth-types';

type UserMetadata = Record<string, any> & {
  planId?: string;
  creditsResetAt?: string | null;
  oneTimeExpiresAt?: string | null;
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
const GUEST_DEFAULT_CREDITS = 400;
const GUEST_RESET_DAYS = 30;

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
    const ip = getClientIp();
    const ua = headers().get('user-agent');
    const rec = await getGuestRecord(ip, ua);
    return { plan, credits: rec.credits, metadata: { resetAt: rec.resetAt?.toISOString?.() }, isGuest: true };
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
  // legacy stub; replaced by DB-based guest credits
  return {
    ok: false,
    errorCode: 'INSUFFICIENT_CREDITS',
    message: 'Créditos insuficientes. Crea cuenta para obtener más.',
  };
}

function hashIp(ip: string): string {
  return createHmac('sha256', getSigningSecret()).update(ip).digest('hex');
}

async function getGuestRecord(ip: string, ua: string | null) {
  const db = await getDb();
  const ipHash = hashIp(ip);
  const now = new Date();
  const rows = await db
    .select()
    .from(guestCredits)
    .where(eq(guestCredits.ipHash, ipHash))
    .limit(1);

  if (!rows.length) {
    const reset = new Date(now.getTime() + GUEST_RESET_DAYS * 24 * 60 * 60 * 1000);
    await db.insert(guestCredits).values({
      id: randomUUID(),
      ipHash,
      rawIp: ip,
      credits: GUEST_DEFAULT_CREDITS,
      resetAt: reset,
      userAgent: ua ?? null,
    });
    return { credits: GUEST_DEFAULT_CREDITS, resetAt: reset, ipHash };
  }

  const rec = rows[0];
  if (rec.resetAt <= now) {
    const reset = new Date(now.getTime() + GUEST_RESET_DAYS * 24 * 60 * 60 * 1000);
    await db
      .update(guestCredits)
      .set({ credits: GUEST_DEFAULT_CREDITS, resetAt: reset, updatedAt: now })
      .where(eq(guestCredits.ipHash, ipHash));
    return { credits: GUEST_DEFAULT_CREDITS, resetAt: reset, ipHash };
  }

  return { credits: rec.credits, resetAt: rec.resetAt, ipHash };
}

export async function deductGuestCreditsDb(ip: string, ua: string | null, required: number): Promise<CreditCheckResult> {
  if (required <= 0) return { ok: true, creditsLeft: 0 };
  const db = await getDb();
  const ipHash = hashIp(ip);
  const now = new Date();

  const result = await db.transaction(async (tx) => {
    const recs = await tx
      .select()
      .from(guestCredits)
      .where(eq(guestCredits.ipHash, ipHash))
      .limit(1);

    let rec = recs[0];
    if (!rec) {
      const reset = new Date(now.getTime() + GUEST_RESET_DAYS * 24 * 60 * 60 * 1000);
      await tx.insert(guestCredits).values({
        id: randomUUID(),
        ipHash,
        rawIp: ip,
        credits: GUEST_DEFAULT_CREDITS,
        resetAt: reset,
        userAgent: ua ?? null,
        createdAt: now,
        updatedAt: now,
      });
      rec = { credits: GUEST_DEFAULT_CREDITS, resetAt: reset } as any;
    }

    if (rec.resetAt <= now) {
      rec.credits = GUEST_DEFAULT_CREDITS;
      rec.resetAt = new Date(now.getTime() + GUEST_RESET_DAYS * 24 * 60 * 60 * 1000);
    }

    if (rec.credits < required) {
      return null;
    }

    const updated = await tx
      .update(guestCredits)
      .set({
        credits: sql`${guestCredits.credits} - ${required}`,
        updatedAt: now,
        lastUsedAt: now,
        userAgent: ua ?? rec.userAgent,
      })
      .where(and(eq(guestCredits.ipHash, ipHash), sql`${guestCredits.credits} >= ${required}`))
      .returning({ credits: guestCredits.credits });

    if (!updated.length) return null;
    return updated[0].credits;
  });

  if (result === null) {
    return {
      ok: false,
      errorCode: 'INSUFFICIENT_CREDITS',
      message: 'Créditos insuficientes. Crea cuenta para obtener más.',
    };
  }

  return { ok: true, creditsLeft: result };
}
