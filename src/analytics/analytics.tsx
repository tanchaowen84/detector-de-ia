'use client';

import { websiteConfig } from '@/config/website';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useEffect, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Allow analytics to run in all environments so we can test integrations
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* google analytics */}
      <GoogleAnalytics />

      {/* plausible analytics */}
      <PlausibleAnalytics />

      {/* microsoft clarity */}
      <ClarityAnalytics />

      {/* ahrefs analytics */}
      <AhrefsAnalytics />

      {/* vercel analytics */}
      {websiteConfig.analytics.enableVercelAnalytics && <VercelAnalytics />}

      {/* speed insights */}
      {websiteConfig.analytics.enableSpeedInsights && <SpeedInsights />}
    </>
  );
}
