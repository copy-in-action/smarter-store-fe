/**
 * 관리자 공연장 등록 페이지
 */

import { PAGES } from "@/shared/constants";
import VenueCreateView from "@/views/admin/venues/VenueCreateView";

/**
 * 관리자 공연장 등록 페이지 메타데이터
 */
export const metadata = PAGES.ADMIN.VENUES.CREATE.metadata;
/**
 * 관리자 공연장 등록 페이지
 */
export default function AdminVenueCreatePage() {
  return <VenueCreateView />;
}
