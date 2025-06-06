import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 프로덕션에서 소스맵 비활성화
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  
  // Edge Function 최적화
  experimental: {
    optimizePackageImports: ['@google/generative-ai'],
  },
  
  // 환경변수 설정
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // 불필요한 파일 제외
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

export default nextConfig;
