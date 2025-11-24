import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = 'force-static';
export const revalidate = false;

export async function generateStaticParams() {
  return [];
}

export default function BlockCategoryPage() {
  notFound();
}
