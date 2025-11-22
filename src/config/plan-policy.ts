export type PlanId = 'guest' | 'free' | 'trial' | 'hobby' | 'pro' | 'lifetime';

export type PlanPolicy = {
  id: PlanId | string;
  label: string;
  allowText: boolean;
  allowFile: boolean;
  allowUrl: boolean;
  maxChars: number;
  monthlyCredits?: number;
  resetIntervalDays?: number;
  oneTimeCredits?: number;
  oneTimeExpiresDays?: number;
  saveHistory: boolean;
  creditsPerWordDetect: number;
  priceIds?: string[];
  interval?: PlanIntervals;
};

const env =
  typeof process !== 'undefined' && (process as any).env
    ? (process as any).env
    : ({} as Record<string, string | undefined>);

export const planPolicies: Record<string, PlanPolicy> = {
  guest: {
    id: 'guest',
    label: 'Guest',
    allowText: true,
    allowFile: false,
    allowUrl: false,
    maxChars: 1500,
    monthlyCredits: 400,
    resetIntervalDays: 30,
    saveHistory: false,
    creditsPerWordDetect: 1,
  },
  free: {
    id: 'free',
    label: 'Free',
    allowText: true,
    allowFile: false,
    allowUrl: false,
    maxChars: 1500,
    monthlyCredits: 400,
    resetIntervalDays: 30,
    saveHistory: true,
    creditsPerWordDetect: 1,
  },
  trial: {
    id: 'trial',
    label: 'Trial Pack',
    allowText: true,
    allowFile: true,
    allowUrl: true,
    maxChars: 30000,
    oneTimeCredits: 30000,
    oneTimeExpiresDays: 14,
    saveHistory: true,
    creditsPerWordDetect: 1,
    priceIds: [env.NEXT_PUBLIC_CREEM_PRODUCT_ID_TRIAL_PACK].filter(Boolean) as string[],
  },
  hobby: {
    id: 'hobby',
    label: 'Hobby',
    allowText: true,
    allowFile: true,
    allowUrl: true,
    maxChars: 30000,
    monthlyCredits: 100000,
    saveHistory: true,
    creditsPerWordDetect: 1,
    priceIds: [
      env.NEXT_PUBLIC_CREEM_PRODUCT_ID_HOBBY_MONTHLY,
      env.NEXT_PUBLIC_CREEM_PRODUCT_ID_HOBBY_YEARLY,
    ].filter(Boolean) as string[],
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    allowText: true,
    allowFile: true,
    allowUrl: true,
    maxChars: 60000,
    monthlyCredits: 200000,
    saveHistory: true,
    creditsPerWordDetect: 1,
    priceIds: [
      env.NEXT_PUBLIC_CREEM_PRODUCT_ID_PRO_MONTHLY,
      env.NEXT_PUBLIC_CREEM_PRODUCT_ID_PRO_YEARLY,
    ].filter(Boolean) as string[],
  },
  lifetime: {
    id: 'lifetime',
    label: 'Lifetime',
    allowText: true,
    allowFile: true,
    allowUrl: true,
    maxChars: 60000,
    oneTimeCredits: 200000,
    oneTimeExpiresDays: 365 * 5, // generous buffer, adjust later
    saveHistory: true,
    creditsPerWordDetect: 1,
    priceIds: [env.NEXT_PUBLIC_CREEM_PRODUCT_ID_LIFETIME].filter(Boolean) as string[],
  },
};

export function getPlanPolicy(planId?: string | null): PlanPolicy {
  if (planId && planPolicies[planId]) {
    return planPolicies[planId];
  }
  return planPolicies.free;
}

export function getPlanByPriceId(priceId?: string | null): PlanPolicy | undefined {
  if (!priceId) return undefined;
  return Object.values(planPolicies).find((plan) =>
    plan.priceIds?.includes(priceId)
  );
}
