import type { Metadata } from 'next';
import { Inter, Syne } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['400','500','600','700','800'], display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Vyom – Your Tech Universe', template: '%s | Vyom' },
  description: 'Vyom is your go-to source for tech news, smartphone reviews, laptop guides, and AI insights.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vyom.quest'),
  openGraph: { type: 'website', siteName: 'Vyom', locale: 'en_US' },
  twitter: { card: 'summary_large_image', site: '@vyomquest' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${syne.variable}`}>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-right" toastOptions={{ className: '!text-sm', duration: 4000 }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
