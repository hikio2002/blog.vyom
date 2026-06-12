'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Ad {
  _id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;
  placement: string;
  isActive: boolean;
  opensInNewTab: boolean;
  order: number;
}

interface Props {
  placement: 'header' | 'sidebar' | 'in-article' | 'footer' | 'homepage-banner';
  className?: string;
  maxAds?: number;
}

// Aspect ratios & sizing per placement
const PLACEMENT_CONFIG: Record<string, {
  containerClass: string;
  imageClass: string;
  label: string;
}> = {
  'homepage-banner': {
    containerClass: 'w-full rounded-2xl overflow-hidden',
    imageClass: 'w-full aspect-[728/90] sm:aspect-[970/90] relative',
    label: 'Advertisement',
  },
  header: {
    containerClass: 'w-full rounded-xl overflow-hidden',
    imageClass: 'w-full aspect-[728/90] relative',
    label: 'Advertisement',
  },
  sidebar: {
    containerClass: 'w-full rounded-xl overflow-hidden',
    imageClass: 'w-full aspect-[300/250] relative',
    label: 'Advertisement',
  },
  'in-article': {
    containerClass: 'w-full max-w-2xl mx-auto rounded-xl overflow-hidden',
    imageClass: 'w-full aspect-[728/90] relative',
    label: 'Sponsored',
  },
  footer: {
    containerClass: 'w-full rounded-xl overflow-hidden',
    imageClass: 'w-full aspect-[728/90] relative',
    label: 'Advertisement',
  },
};

export default function AdBanner({ placement, className = '', maxAds = 1 }: Props) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/ads?placement=${placement}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setAds(Array.isArray(data) ? data.slice(0, maxAds) : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [placement, maxAds]);

  // Don't render anything while loading or if no active ads
  if (!loaded || ads.length === 0) return null;

  const config = PLACEMENT_CONFIG[placement] || PLACEMENT_CONFIG['sidebar'];

  return (
    <div className={`ad-container ${className}`}>
      {ads.map(ad => (
        <div key={ad._id} className={config.containerClass}>
          <p className="text-[10px] text-gray-400 text-center mb-1 tracking-widest uppercase">
            {config.label}
          </p>
          <Link
            href={ad.linkUrl}
            target={ad.opensInNewTab ? '_blank' : '_self'}
            rel={ad.opensInNewTab ? 'noopener noreferrer sponsored' : undefined}
            className="block group"
            aria-label={ad.name}
          >
            <div className={`${config.imageClass} bg-gray-100 dark:bg-gray-800 overflow-hidden`}>
              <Image
                src={ad.imageUrl}
                alt={ad.name}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                sizes={
                  placement === 'sidebar'
                    ? '300px'
                    : placement === 'homepage-banner' || placement === 'header'
                      ? '(max-width: 768px) 100vw, 970px'
                      : '728px'
                }
                unoptimized={ad.imageUrl.includes('?') || ad.imageUrl.startsWith('http')}
              />
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
