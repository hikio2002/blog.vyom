import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Item { label: string; href?: string; }
export default function Breadcrumb({ items }: { items: Item[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} />}
          {item.href
            ? <Link href={item.href} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate max-w-xs">{item.label}</Link>
            : <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">{item.label}</span>
          }
        </span>
      ))}
    </nav>
  );
}
