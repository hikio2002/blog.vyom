'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Menu, X, Sun, Moon, Search, ChevronDown, Smartphone, Laptop, PenTool, Camera as CameraIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPhoneCategoryIcon } from '@/lib/phone-icons';
import type { Category, PhoneCategory } from '@/types';

const navLinkCls = 'px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800';
const iconBtnCls = 'p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800';

// The 4 device sections — shown as a single "Devices" dropdown instead of
// 4 separate top-level nav items competing for header space.
const DEVICE_TYPES = [
  { href: '/phones',  label: 'Phones',          icon: Smartphone },
  { href: '/laptops', label: 'Laptops',         icon: Laptop },
  { href: '/tablets', label: 'Drawing Tablets', icon: PenTool },
  { href: '/cameras', label: 'Cameras',         icon: CameraIcon },
];

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [phoneCategories, setPhoneCategories] = useState<PhoneCategory[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    fetch('/api/categories?active=true')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data.filter((c: Category) => c.showInNav).slice(0, 8)); })
      .catch(() => {});
    // Phone categories shown as a quick-access shortcut inside the Devices
    // dropdown — Laptops/Tablets/Cameras link to their landing pages directly
    // since they don't need a second-level category preview here.
    fetch('/api/phone-categories?active=true')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPhoneCategories(data.slice(0, 5)); })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400" style={{ fontFamily: 'var(--font-syne)' }}>Vyom</span>
            <span className="text-gray-400 text-sm">.quest</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/" className={navLinkCls}>Home</Link>

            <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button className={cn(navLinkCls, 'flex items-center gap-1')}>
                Categories <ChevronDown size={14} className={cn('transition-transform duration-200', catOpen && 'rotate-180')} />
              </button>
              {catOpen && categories.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 z-50">
                  {categories.map(cat => (
                    <Link key={cat._id} href={`/category/${cat.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </Link>
                  ))}
                  <hr className="my-1 border-gray-100 dark:border-gray-800" />
                  <Link href="/categories" className="block px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                    All categories →
                  </Link>
                </div>
              )}
            </div>

            {/* Devices dropdown — Phones, Laptops, Drawing Tablets, Cameras */}
            <div className="relative" onMouseEnter={() => setDevicesOpen(true)} onMouseLeave={() => setDevicesOpen(false)}>
              <button className={cn(navLinkCls, 'flex items-center gap-1')}>
                Devices <ChevronDown size={14} className={cn('transition-transform duration-200', devicesOpen && 'rotate-180')} />
              </button>
              {devicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-60 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 z-50">
                  {DEVICE_TYPES.map(d => (
                    <Link key={d.href} href={d.href}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors">
                      <d.icon size={15} className="text-indigo-400" />
                      {d.label}
                    </Link>
                  ))}
                  {phoneCategories.length > 0 && (
                    <>
                      <hr className="my-1.5 border-gray-100 dark:border-gray-800" />
                      <p className="px-4 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone Categories</p>
                      {phoneCategories.map(cat => {
                        const Icon = getPhoneCategoryIcon(cat.icon);
                        return (
                          <Link key={cat._id} href={`/phones/category/${cat.slug}`}
                            className="flex items-center gap-2 px-4 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors">
                            <Icon size={12} className="text-indigo-300" />
                            {cat.name}
                          </Link>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            <Link href="/authors" className={navLinkCls}>Authors</Link>
            <Link href="/about" className={navLinkCls}>About</Link>
            <Link href="/advertise" className={navLinkCls}>Advertise</Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Link href="/search" className={iconBtnCls} aria-label="Search"><Search size={18} /></Link>
            {mounted && (
              <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className={iconBtnCls} aria-label="Toggle theme">
                {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className={cn(iconBtnCls, 'lg:hidden')} aria-label="Menu">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3 space-y-0.5 max-h-[80vh] overflow-y-auto">
          {[{href:'/',label:'Home'},{href:'/categories',label:'Categories'},{href:'/authors',label:'Authors'},{href:'/about',label:'About'},{href:'/contact',label:'Contact'},{href:'/advertise',label:'Advertise'}].map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
              {l.label}
            </Link>
          ))}

          <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800">
            <p className="px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Devices</p>
            {DEVICE_TYPES.map(d => (
              <Link key={d.href} href={d.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                <d.icon size={14} className="text-indigo-400" />
                {d.label}
              </Link>
            ))}
          </div>

          {categories.length > 0 && (
            <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800">
              <p className="px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categories</p>
              {categories.slice(0, 6).map(cat => (
                <Link key={cat._id} href={`/category/${cat.slug}`} onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
