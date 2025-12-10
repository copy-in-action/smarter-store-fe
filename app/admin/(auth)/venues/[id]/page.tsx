import { PAGES } from "@/shared/constants/routes";
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

  return <VenueDetailView venueId={venueId || 0} />;
}
