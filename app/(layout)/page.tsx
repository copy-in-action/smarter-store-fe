/**
 * ISR (Incremental Static Regeneration) 설정
 * - 60초마다 자동 재검증 (백그라운드)
 * - 관리자가 공연 추가/수정/삭제 시 On-Demand Revalidation으로 즉시 업데이트
 */
export const revalidate = 60;

import { PAGES } from "@/shared/config";
import { HomePage } from "@/views/service/home";

export const metadata = PAGES.HOME.metadata;

export default function Home() {
  return <HomePage />;
}
