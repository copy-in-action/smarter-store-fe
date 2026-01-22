import { fetchSeatingChartOnServer } from "@/features/admin/seating-chart/api/seatingChart.server.api";
import { PAGES } from "@/shared/config/routes";
import { SeatChart } from "@/shared/ui/seat";
import type { SeatChartConfig } from "@/shared/lib/seat.types";
import VenueDetailView from "@/views/admin/venues/VenueDetailView";

/**
 * 공연장 상세 페이지 속성
 */
interface VenueDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * 관리자 공연장 상세 페이지 메타데이터
 */
export const metadata = PAGES.ADMIN.VENUES.DETAIL.metadata;

/**
 * 관리자 공연장 상세 페이지
 */
export default async function VenueDetailPage({
  params,
}: VenueDetailPageProps) {
  const { id } = await params;
  const venueId = Number(id);
  // 서버사이드에서 기존 좌석 배치도 데이터 조회
  const initialSeatingChart = await fetchSeatingChartOnServer(
    Number.parseInt(id, 10),
  );

  return (
    <>
      <VenueDetailView venueId={venueId || 0} />
      {initialSeatingChart?.seatingChart && (
        <div>
          좌석 배치도
          <SeatChart
            config={
              initialSeatingChart.seatingChart as unknown as SeatChartConfig
            }
          />
        </div>
      )}
    </>
  );
}
