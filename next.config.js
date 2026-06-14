/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warnings don't fail the build; only errors do.
    // We've fixed all errors - this is a safety net for any remaining warnings.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Type errors are caught at dev time; don't block production builds.
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    // Cap max image size — featured images render at most ~960px wide
    // (lg:col-span-3 inside max-w-7xl). Without this, Next.js requests
    // up to 3840px from third-party hosts on the LCP-critical path,
    // which is the main cause of slow blog page loads.
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days — third-party images rarely change
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
