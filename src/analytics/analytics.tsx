'use client';

import { websiteConfig } from '@/config/website';
import { useCookieConsent } from '@/hooks/use-cookie-consent';
import { useEffect, useState } from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AhrefsAnalytics } from './ahrefs-analytics';
import { ClarityAnalytics } from './clarity-analytics';
import DataFastAnalytics from './data-fast-analytics';
import GoogleAnalytics from './google-analytics';
import OpenPanelAnalytics from './open-panel-analytics';
import { PlausibleAnalytics } from './plausible-analytics';
import { SelineAnalytics } from './seline-analytics';
import { UmamiAnalytics } from './umami-analytics';

/**
 * Client-side analytics wrapper with consent gate.
 */
export function Analytics() {
  const consent = useCookieConsent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      {/* google analytics */}
      {consent.analytics && <GoogleAnalytics />}

      {/* umami analytics (no cookie; allow always) */}
      <UmamiAnalytics />

      {/* plausible analytics (respect analytics consent) */}
      {consent.analytics && <PlausibleAnalytics />}

      {/* microsoft clarity */}
      {consent.analytics && <ClarityAnalytics />}

      {/* ahrefs analytics */}
      {consent.analytics && <AhrefsAnalytics />}

      {/* datafast analytics */}
      {consent.analytics && <DataFastAnalytics />}

      {/* openpanel analytics */}
      {consent.analytics && <OpenPanelAnalytics />}

      {/* seline analytics */}
      {consent.analytics && <SelineAnalytics />}

      {/* vercel analytics */}
      {websiteConfig.analytics.enableVercelAnalytics && consent.analytics && (
        <VercelAnalytics />
      )}

      {/* speed insights */}
      {websiteConfig.analytics.enableSpeedInsights && consent.analytics && (
        <SpeedInsights />
      )}
    </>
  );
}
