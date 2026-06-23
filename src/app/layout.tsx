import type { Metadata } from 'next';
import { Inter, Syne } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { getSiteSettings } from '@/lib/server-api';
import AdBlockDetector from '@/components/common/AdBlockDetector';
import '@/styles/globals.css';

export const revalidate = 60;

// next/font self-hosts these at build time — no external Google Fonts
// request, no render-blocking <link>, and font-display:swap is applied
// automatically. Variable names match the --font-inter / --font-syne
// custom properties already used throughout globals.css and components,
// so no other file needs to change.
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: `${settings.siteName} – ${settings.siteTagline}`,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.metaDescription,
    metadataBase: new URL(settings.siteUrl),
    openGraph: {
      type: 'website',
      siteName: settings.siteName,
      locale: 'en_US',
      title: `${settings.siteName} – ${settings.siteTagline}`,
      description: settings.metaDescription,
    },
    twitter: {
      card: 'summary_large_image',
      site: settings.socialLinks.twitter || undefined,
      title: `${settings.siteName} – ${settings.siteTagline}`,
      description: settings.metaDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const adsenseId = settings.adsensePublisherId || process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${syne.variable}`}>
      <head>
        {/* AdSense — async so it never blocks rendering */}
        {adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}

        {/* Google Analytics — deferred, non-blocking */}
        {settings.googleAnalyticsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${settings.googleAnalyticsId}',{send_page_view:false});`,
              }}
            />
          </>
        )}
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="vyom-theme"
          disableTransitionOnChange
        >
          {children}
          <AdBlockDetector />
          <Toaster
            position="top-right"
            toastOptions={{ className: '!text-sm', duration: 4000 }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
