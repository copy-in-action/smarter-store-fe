import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import { headers } from "next/headers";
import {
  AuthProvider,
  BookingResetWatcher,
  QueryProvider,
} from "@/app/providers";
import { getUserInfoServer } from "@/entities/user/api/user.server.api";
import { AuthEventHandler, TokenRefreshManager } from "@/shared/auth-events";
import { SITE_URL } from "@/shared/config";
import {
  createOrganizationSchema,
  createWebsiteSchema,
  safeJsonLdStringify,
} from "@/shared/lib/json-ld";
import { DeviceProvider } from "@/shared/lib/use-device";
import { Toaster } from "@/shared/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

/**
 * 네이버 웹마스터 도구 사이트 인증 토큰 (ticket.devhong.cc)
 *
 * 구글 인증은 메인 도메인 DNS TXT 레코드로 처리하므로 meta 태그를 두지 않는다.
 */
const NAVER_SITE_VERIFICATION = "66ceef669c54c028edcbfd6abe45d894f534f7d8";

export const metadata: Metadata = {
  /**
   * 메타데이터의 상대 URL(`alternates.canonical` 등)을 절대 URL로 변환하는 기준 도메인.
   *
   * 미설정 시 Next.js는 상대 경로를 그대로 출력해 `<link rel="canonical" href="/">`처럼
   * 무효한 canonical이 렌더링되므로 반드시 지정한다.
   */
  metadataBase: new URL(SITE_URL),
  title: "YEME",
  description:
    "뮤지컬, 콘서트, 연극, 클래식 등 다양한 공연 정보와 할인 티켓을 만나보세요. 최신 공연 소식과 특가 이벤트를 놓치지 마세요!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 미들웨어에서 설정한 헤더 읽기
  const headersList = await headers();
  const hasInitialAuth = headersList.get("x-has-auth") === "true";
  const isUserRole = headersList.get("x-auth-role") === "ROLE_USER";
  const isFetchMe = hasInitialAuth && isUserRole;
  const initialIsMobileDevice =
    headersList.get("x-is-mobile-device") === "true";

  // 인증된 경우 서버에서 사용자 정보 미리 조회
  const initialUserData = isFetchMe ? await getUserInfoServer() : null;

  // JSON-LD 구조화 데이터 생성
  const websiteSchema = createWebsiteSchema(
    "YEME",
    "뮤지컬, 콘서트, 연극, 클래식 등 다양한 공연 정보와 할인 티켓을 만나보세요. 최신 공연 소식과 특가 이벤트를 놓치지 마세요!",
    SITE_URL,
  );

  const organizationSchema = createOrganizationSchema(
    "Copy in Action",
    SITE_URL,
    `${SITE_URL}/images/logo.png`,
  );

  return (
    <html lang="ko">
      <head>
        {/* naver seo */}
        <meta
          name="naver-site-verification"
          content={NAVER_SITE_VERIFICATION}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(organizationSchema),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${notoSansKR.variable} font-sans antialiased h-auto`}
      >
        {/* <MSWProvider> */}
        <QueryProvider>
          <DeviceProvider initialIsMobileDevice={initialIsMobileDevice}>
            <AuthProvider
              hasInitialAuth={isFetchMe}
              initialUserData={initialUserData}
            >
              <AuthEventHandler />
              <TokenRefreshManager />
              <BookingResetWatcher />
              {children}
            </AuthProvider>
          </DeviceProvider>
        </QueryProvider>
        <Toaster
          position="top-center"
          richColors
          theme="light"
          visibleToasts={4}
        />
        {/* </MSWProvider> */}
      </body>
    </html>
  );
}
