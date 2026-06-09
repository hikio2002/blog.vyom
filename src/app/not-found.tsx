import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <p className="text-8xl font-black text-brand-100 dark:text-brand-900" style={{ fontFamily: 'var(--font-syne)' }}>404</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2" style={{ fontFamily: 'var(--font-syne)' }}>Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3">
          <Link href="/" className="btn-primary">Go Home</Link>
          <Link href="/search" className="btn-outline">Search Articles</Link>
        </div>
      </div>
    </PublicLayout>
  );
}
