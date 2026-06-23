/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    // Mobile-first device sizes — no 2048px variants that waste bandwidth
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Cache optimized images for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // AVIF ~50% smaller than WebP on mobile — best for LCP
    formats: ['image/avif', 'image/webp'],
    // Allow SVGs (for icons, logos)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },

  // Gzip/Brotli compression — reduces HTML/JS/CSS transfer by ~70%
  compress: true,

  // No source maps in production — smaller JS bundles
  productionBrowserSourceMaps: false,

  // Experimental: optimize package imports to reduce bundle size
  // (tree-shakes lucide-react so only used icons are bundled)
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Allow AdSense
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Immutable cache for hashed static assets
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache fonts aggressively — they almost never change
        source: '/fonts/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
