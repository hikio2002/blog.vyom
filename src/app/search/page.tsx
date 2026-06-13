import { Suspense } from 'react';
import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import SearchClient from './SearchClient';

export const metadata: Metadata = { title: 'Search Articles' };

export default function SearchPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[50vh]" />}>
        <SearchClient />
      </Suspense>
    </PublicLayout>
  );
}
