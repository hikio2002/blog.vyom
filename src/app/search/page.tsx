import { Suspense } from 'react';
import type { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = { title: 'Search Articles' };

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-gray-950" />}>
      <SearchClient />
    </Suspense>
  );
}
