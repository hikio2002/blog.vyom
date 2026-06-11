import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-right" toastOptions={{ className: '!text-sm', duration: 4000 }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
