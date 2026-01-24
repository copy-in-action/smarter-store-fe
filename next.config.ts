import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: process.platform === "win32" ? undefined : "standalone",
  allowedDevOrigins: ["*.devhong.cc"],
  images: {
    remotePatterns: [
      new URL("https://marketplace.canva.com/**"),
      new URL("https://ticketimage.interpark.com/Play/image/**"),
      new URL("https://image6.yanolja.com/**"),
      new URL("https://supa.devhong.cc/storage/v1/object/public/ticket/**"),
    ],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    qualities: [75, 100],
  },
  /**
   * 개발 환경에서만 백엔드 API 프록시 설정
   * - 개발: /api/* → 백엔드 프록시 (CORS 문제 해결, 쿠키 자동 공유)
   * - 프로덕션: rewrites 없음 (백엔드 CORS 설정 사용)
   */
  async rewrites() {
    // 프로덕션 환경에서는 rewrites 사용 안 함
    if (process.env.NODE_ENV === "production") {
      return [];
    }

    // 개발 환경에서만 백엔드 프록시
    return [
      {
        source: "/api/:path*", // localhost:3000/api/xxx
        destination: `${process.env.NEXT_PUBLIC_API_DEV_SERVER}/api/:path*`, // → 백엔드로 프록시
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  experimental: {
    optimizeCss: true,
    cssChunking: true,
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "none-07r",

  project: "ticket",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
