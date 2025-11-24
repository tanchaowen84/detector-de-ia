import { getActiveSubscriptionAction } from '@/actions/get-active-subscription';
import { getLifetimeStatusAction } from '@/actions/get-lifetime-status';
import { getPlanPolicy } from '@/config/plan-policy';
import type { Session } from '@/lib/auth-types';
import { getAllPricePlans } from '@/lib/price-plan';
import type { PricePlan, Subscription } from '@/payment/types';
import { create } from 'zustand';

/**
 * Payment state interface
 */
export interface PaymentState {
  currentPlan: PricePlan | null;
  subscription: Subscription | null;
  creditsRemaining: number | null;
  creditsTotal: number | null;
  creditsResetAt: Date | null;
  isLoading: boolean;
  error: string | null;
  fetchPayment: (user: Session['user'] | null | undefined) => Promise<void>;
  resetState: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  currentPlan: null,
  subscription: null,
  creditsRemaining: null,
  creditsTotal: null,
  creditsResetAt: null,
  isLoading: false,
  error: null,

  fetchPayment: async (user) => {
    if (get().isLoading) return;

    if (!user) {
      set({
        currentPlan: null,
        subscription: null,
        creditsRemaining: null,
        creditsTotal: null,
        creditsResetAt: null,
        error: null,
      });
      return;
    }

    set({ isLoading: true, error: null });

    const plans: PricePlan[] = getAllPricePlans();
    const freePlan = plans.find((plan) => plan.isFree) || null;
    const lifetimePlan = plans.find((plan) => plan.isLifetime) || null;

    // Lifetime check
    let isLifetimeMember = false;
    try {
      const result = await getLifetimeStatusAction({ userId: user.id });
      if (result?.data?.success) {
        isLifetimeMember = result.data.isLifetimeMember || false;
      }
    } catch (error) {
      console.error('get lifetime status error:', error);
    }

    if (isLifetimeMember) {
      set({
        currentPlan: lifetimePlan,
        subscription: null,
        creditsRemaining: null,
        creditsTotal: null,
        creditsResetAt: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      const subResult = await getActiveSubscriptionAction({ userId: user.id });
      if (!subResult?.data?.success) {
        throw new Error(subResult?.data?.error || 'Failed to fetch subscription');
      }

      const activeSubscription = subResult.data.data;
      let plan: PricePlan | null = freePlan;

      if (activeSubscription) {
        plan =
          plans.find((p) =>
            p.prices.find((price) => price.priceId === activeSubscription.priceId)
          ) || freePlan;
      }

      const creditsInfo = await computeCredits(plan, user.id);

      // If there is no active subscription (e.g., one-time Trial Pack), use the plan hinted by credits API
      if (!activeSubscription && creditsInfo.resolvedPlanId) {
        const hintedPlan = plans.find((p) => p.id === creditsInfo.resolvedPlanId);
        if (hintedPlan) {
          plan = hintedPlan;
        }
      }

      set({
        currentPlan: plan,
        subscription: activeSubscription || null,
        ...creditsInfo,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('fetch payment data error:', error);
      set({
        currentPlan: freePlan,
        subscription: null,
        creditsRemaining: null,
        creditsTotal: null,
        creditsResetAt: null,
        isLoading: false,
        error: 'Failed to fetch payment data',
      });
    }
  },

  resetState: () => {
    set({
      currentPlan: null,
      subscription: null,
      creditsRemaining: null,
      creditsTotal: null,
      creditsResetAt: null,
      isLoading: false,
      error: null,
    });
  },
}));

async function computeCredits(plan: PricePlan | null, _userId: string) {
  try {
    const res = await fetch('/api/credits', { cache: 'no-store' });
    if (!res.ok) {
      return {
        creditsRemaining: null,
        creditsTotal: null,
        creditsResetAt: null,
      };
    }
    const json = (await res.json()) as {
      success: boolean;
      data?: { credits: number; metadata: Record<string, any>; planId?: string };
    };
    if (!json.success || !json.data) {
      return {
        creditsRemaining: null,
        creditsTotal: null,
        creditsResetAt: null,
      };
    }
    const credits = json.data.credits ?? 0;
    const metadata = (json.data.metadata as any) || {};

    // Prefer planId from credits API/metadata when available (handles one-time packs like Trial)
    let policy = plan
      ? getPlanPolicy(plan.id)
      : getPlanPolicy(metadata.planId || json.data.planId || 'free');

    // If current plan looks free but credits hint a different plan, adopt it
    if (plan?.isFree && (metadata.planId || json.data.planId)) {
      policy = getPlanPolicy((metadata.planId || json.data.planId) as string);
    }

    const total =
      metadata.oneTimeCredits ??
      policy.oneTimeCredits ??
      policy.monthlyCredits ??
      credits;
    const resetAt = metadata.creditsResetAt
      ? new Date(metadata.creditsResetAt)
      : null;

    return {
      creditsRemaining: credits,
      creditsTotal: total,
      creditsResetAt: resetAt,
      resolvedPlanId: policy.id,
    };
  } catch (error) {
    console.error('computeCredits error', error);
      return {
        creditsRemaining: null,
        creditsTotal: null,
        creditsResetAt: null,
        resolvedPlanId: null,
      };
  }
}
