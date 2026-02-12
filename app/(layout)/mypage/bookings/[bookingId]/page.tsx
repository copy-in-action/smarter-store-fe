import type { Metadata } from "next";
import { PAGES } from "@/shared/config/routes";
import { MyBookingDetailView } from "@/views/service/mypage";

/**
 * 페이지 Props
 */
interface Props {
  /** URL 파라미터 */
  params: Promise<{ bookingId: string }>;
}

/**
 * 메타데이터 생성
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return PAGES.MY.BOOKINGS.DETAIL.metadata();
}

/**
 * 마이페이지 예매 상세 페이지
 */
export default async function MyBookingDetailPage({ params }: Props) {
  const { bookingId } = await params;
  return <MyBookingDetailView bookingId={bookingId} />;
}
