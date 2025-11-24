'use client';

import { useEffect, useState } from 'react';

type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

/**
 * Minimal hook to read cookieconsent categories on client.
 */
export function useCookieConsent() {
  // 默认视为已同意 analytics，保证埋点可工作；实际同意状态以 cookieconsent 读数为准
  const [state, setState] = useState<ConsentState>({ analytics: true, marketing: false });

  useEffect(() => {
    const cc = (window as any).CookieConsent || (window as any).cookieconsent;
    if (!cc || typeof cc.acceptedCategory !== 'function') return;
    const read = () => {
      setState({
        analytics: !!cc.acceptedCategory('analytics'),
        marketing: !!cc.acceptedCategory('marketing'),
      });
    };
    read();
    const handler = (e: Event) => {
      if ('detail' in e && (e as any).detail) {
        read();
      }
    };
    window.addEventListener('cc:onChange', handler);
    window.addEventListener('cc:onAccept', handler);
    return () => {
      window.removeEventListener('cc:onChange', handler);
      window.removeEventListener('cc:onAccept', handler);
    };
  }, []);

  return state;
}
