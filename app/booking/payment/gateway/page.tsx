import { PgPaymentPopupView } from "@/views/service/booking-gateway";

/**
 * PG 결제 팝업 페이지
 * (layout) 그룹 밖에 위치하여 Header/BottomNavigation이 나타나지 않습니다.
 */
export default function Page() {
  return <PgPaymentPopupView />;
}
