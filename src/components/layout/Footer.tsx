import Link from 'next/link';
import { Twitter, Facebook, Instagram, Youtube, Rss, Mail } from 'lucide-react';
import { getFooterCategories, getSiteSettings } from '@/lib/server-api';
import NewsletterForm from './NewsletterForm';

/**
 * Server component — settings and categories are fetched during SSR,
 * so the footer renders with correct values on first paint (no client-side
 * fetch, no "Your Tech Universe" flash before the real tagline loads).
 */
export default async function Footer() {
  const [categories, settings] = await Promise.all([
    getFooterCategories(),
    getSiteSettings(),
  ]);

  const socials = settings.socialLinks;

  const legal = [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
    { href: '/disclaimer', label: 'Disclaimer' },
    { href: '/editorial-policy', label: 'Editorial Policy' },
    { href: '/cookie-policy', label: 'Cookie Policy' },
    { href: '/advertise', label: 'Advertise With Us' },
  ];

  const links = [
    { href: '/', label: 'Home' }, { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' }, { href: '/authors', label: 'Authors' },
    { href: '/categories', label: 'Categories' }, { href: '/sitemap', label: 'Sitemap' },
  ];

  return (
    <footer className="bg-gray-950 text-gray-400 mt-16">
      {/* Newsletter */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>Stay in the loop</h3>
              <p className="text-sm mt-1">Get the latest tech news delivered to your inbox weekly.</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-syne)' }}>{settings.siteName}</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">{settings.siteTagline}</p>
            <div className="flex gap-2">
              {[
                { Icon: Twitter,   href: socials.twitter },
                { Icon: Facebook,  href: socials.facebook },
                { Icon: Instagram, href: socials.instagram },
                { Icon: Youtube,   href: socials.youtube },
                { Icon: Rss,       href: '/api/seo/rss' },
              ].filter(s => s.href).map(({ Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-indigo-600 rounded-lg transition-colors text-gray-400 hover:text-white">
                  <Icon size={13} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2">
              {(categories as any[]).map(c => (
                <li key={String(c._id)}><Link href={`/category/${c.slug}`} className="text-sm hover:text-white transition-colors">{c.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {links.map(l => (
                <li key={l.href}><Link href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              {legal.map(l => (
                <li key={l.href}><Link href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
          <a href={`mailto:${settings.siteEmail}`} className="flex items-center gap-1 hover:text-white transition-colors">
            <Mail size={11} /> {settings.siteEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
