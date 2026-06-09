'use client';
import { shareUrl } from '@/lib/utils';
import { Twitter, Facebook, Linkedin, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const copy = () => { navigator.clipboard.writeText(url); toast.success('Link copied!'); };
  return (
    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Share:</span>
      {[
        { icon: Twitter, platform: 'twitter', label: 'Twitter', color: 'hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/20 dark:hover:text-sky-400' },
        { icon: Facebook, platform: 'facebook', label: 'Facebook', color: 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400' },
        { icon: Linkedin, platform: 'linkedin', label: 'LinkedIn', color: 'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300' },
      ].map(({ icon: Icon, platform, label, color }) => (
        <a key={platform} href={shareUrl(platform, url, title)} target="_blank" rel="noopener noreferrer" aria-label={label}
          className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors ${color}`}>
          <Icon size={16} />
        </a>
      ))}
      <button onClick={copy} aria-label="Copy link" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-colors">
        <Link2 size={16} />
      </button>
    </div>
  );
}
