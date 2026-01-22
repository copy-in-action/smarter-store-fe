import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import { AuthProvider, MSWProvider, QueryProvider } from "@/app/providers";
import { Toaster } from "@/shared/ui/sonner";
import "./globals.css";
import { headers } from "next/headers";
import { getUserInfoServer } from "@/entities/user/api/user.server.api";
import { AuthEventHandler, TokenRefreshManager } from "@/shared/components";
import { DeviceProvider } from "@/shared/lib/use-device";
import {
  createOrganizationSchema,
  createWebsiteSchema,
  safeJsonLdStringify,
} from "@/shared/lib/json-ld";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CIA 티켓",
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
    "CIA 티켓",
    "뮤지컬, 콘서트, 연극, 클래식 등 다양한 공연 정보와 할인 티켓을 만나보세요. 최신 공연 소식과 특가 이벤트를 놓치지 마세요!",
    "https://ticket.devhong.cc",
  );

  const organizationSchema = createOrganizationSchema(
    "Copy in Action",
    "https://ticket.devhong.cc",
    "https://ticket.devhong.cc/images/logo.png",
  );

  return (
    <html lang="ko">
      <head>
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
              {children}
            </AuthProvider>
          </DeviceProvider>
        </QueryProvider>
        <Toaster position="top-center" richColors theme="light" />
        {/* </MSWProvider> */}
      </body>
    </html>
  );
}
