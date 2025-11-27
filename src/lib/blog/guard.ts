import { websiteConfig } from '@/config/website';
import { notFound } from 'next/navigation';

/**
 * Guard blog routes behind a feature flag.
 * Call at the top of any blog page to return 404 when the blog is disabled.
 */
export function ensureBlogEnabled() {
  if (!websiteConfig.features.enableBlogPage) {
    notFound();
  }
}
