import Header from './Header';
import Footer from './Footer';
import AdBanner from '@/components/common/AdBanner';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />

      {/* Header banner ad — hidden entirely if no active ad */}
      <AdBanner placement="header" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4" />

      <main className="flex-1">{children}</main>

      {/* Footer banner ad — hidden entirely if no active ad */}
      <AdBanner placement="footer" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6" />

      <Footer />
    </div>
  );
}
