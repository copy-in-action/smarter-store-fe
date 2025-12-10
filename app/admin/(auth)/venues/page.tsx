import { PAGES } from "@/shared/constants/routes";
import VenueListView from "@/views/admin/venues/VenueListView";

/**
 * 관리자 공연장 목록 페이지 메타데이터
 */
export const metadata = PAGES.ADMIN.VENUES.LIST.metadata;

/**
 * 관리자 공연장 목록 페이지
 */
export default function VenueListPage() {
  return <VenueListView />;
}
