import Header from './Header';
import Footer from './Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
