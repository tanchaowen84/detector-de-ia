import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import type { ReactNode } from 'react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar scroll={true} />
      <main className="flex-1 relative">{children}</main>
      <Footer className="relative z-20 bg-white/95 backdrop-blur-sm" />
    </div>
  );
}
