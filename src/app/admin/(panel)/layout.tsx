'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard, FileText, Tag, Users, FolderOpen,
  Settings, MessageSquare, LogOut, Menu, Sun, Moon, ExternalLink,
  Smartphone, Layers, Laptop, PenTool, Camera as CameraIcon,
  ChevronDown, FolderKanban, Inbox,
} from 'lucide-react';
import Cookies from 'js-cookie';

// Flat top-level items (no sub-items)
const TOP_NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/messages', label: 'Inbox', icon: Inbox },
];

// Grouped nav — each group renders as a collapsible section with sub-links.
// This replaces the old flat 13-item list, which had become cluttered as
// device types (Phones, Laptops, Tablets, Cameras) were added.
const NAV_GROUPS = [
  {
    id: 'content',
    label: 'Content',
    icon: FolderKanban,
    items: [
      { href: '/admin/articles',   label: 'Articles',   icon: FileText },
      { href: '/admin/categories', label: 'Article Categories', icon: FolderOpen },
      { href: '/admin/authors',    label: 'Authors',    icon: Users },
      { href: '/admin/tags',       label: 'Tags',        icon: Tag },
    ],
  },
  {
    id: 'devices',
    label: 'Devices',
    icon: Smartphone,
    items: [
      { href: '/admin/phones',            label: 'Phones',             icon: Smartphone },
      { href: '/admin/phone-categories',  label: 'Phone Categories',   icon: Layers },
      { href: '/admin/laptops',           label: 'Laptops',            icon: Laptop },
      { href: '/admin/laptop-categories', label: 'Laptop Categories',  icon: Layers },
      { href: '/admin/tablets',           label: 'Drawing Tablets',    icon: PenTool },
      { href: '/admin/tablet-categories', label: 'Tablet Categories',  icon: Layers },
      { href: '/admin/cameras',           label: 'Cameras',            icon: CameraIcon },
      { href: '/admin/camera-categories', label: 'Camera Categories',  icon: Layers },
    ],
  },
];

const BOTTOM_NAV = [
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const ALL_HREFS_BY_GROUP: Record<string, string[]> = NAV_GROUPS.reduce((acc, g) => {
  acc[g.id] = g.items.map(i => i.href);
  return acc;
}, {} as Record<string, string[]>);

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const [userName,    setUserName]    = useState('Admin');
  const [userEmail,   setUserEmail]   = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeReady,  setThemeReady]  = useState(false);
  const [authed,      setAuthed]      = useState(false);

  // Track which groups are expanded. A group auto-opens if the current
  // route is inside it, so refreshing/deep-linking never hides the active page.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setThemeReady(true);

    const token = Cookies.get('vyom_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    setAuthed(true);

    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(u => {
        if (u) {
          setUserName(u.name  || 'Admin');
          setUserEmail(u.email || '');
        } else {
          Cookies.remove('vyom_token');
          router.replace('/admin/login');
        }
      })
      .catch(() => {});
  }, [router]);

  // Auto-expand whichever group contains the active route
  useEffect(() => {
    setOpenGroups(prev => {
      const next = { ...prev };
      for (const [groupId, hrefs] of Object.entries(ALL_HREFS_BY_GROUP)) {
        if (hrefs.some(h => pathname === h || pathname.startsWith(h + '/'))) {
          next[groupId] = true;
        }
      }
      return next;
    });
  }, [pathname]);

  const logout = () => {
    fetch('/api/auth', { method: 'DELETE' }).catch(() => {});
    Cookies.remove('vyom_token');
    router.replace('/admin/login');
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const toggleGroup = (id: string) =>
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  const linkCls = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  const SidebarInner = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <Link href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 group">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400"
            style={{ fontFamily: 'var(--font-syne)' }}>Vyom</span>
          <span className="text-gray-400 text-xs">.quest</span>
          <ExternalLink size={10} className="text-gray-300 group-hover:text-indigo-400 ml-1" />
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {TOP_NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
            className={linkCls(isActive(href, exact))}>
            <Icon size={16} />{label}
          </Link>
        ))}

        {NAV_GROUPS.map(group => {
          const GroupIcon = group.icon;
          const isOpen = !!openGroups[group.id];
          const groupActive = group.items.some(i => isActive(i.href));

          return (
            <div key={group.id} className="pt-1">
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  groupActive && !isOpen
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <GroupIcon size={16} />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="mt-0.5 ml-3 pl-3 border-l border-gray-100 dark:border-gray-800 space-y-0.5">
                  {group.items.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                      className={linkCls(isActive(href))}>
                      <Icon size={14} />
                      <span className="text-[13px]">{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-1">
          {BOTTOM_NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={linkCls(isActive(href))}>
              <Icon size={16} />{label}
            </Link>
          ))}
        </div>
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{userName}</p>
          {userEmail && <p className="text-xs text-gray-400 truncate">{userEmail}</p>}
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut size={16} />Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 fixed h-full z-30">
        <SidebarInner />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white dark:bg-gray-900 flex flex-col z-50">
            <SidebarInner />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            {themeReady && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
            <Link href="/admin/articles/new" className="btn-primary text-xs px-3 py-2">
              + New Article
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
