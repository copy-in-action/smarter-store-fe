import { PAGES } from "@/shared/constants/routes";
import VenueEditView from "@/views/admin/venues/VenueEditView";

/**
 * 공연장 수정 페이지 속성
 */
interface VenueEditPageProps {
  params: {
    id: string;
  };
}

/**
 * 관리자 공연장 수정 페이지 메타데이터
 */
export const metadata = PAGES.ADMIN.VENUES.EDIT.metadata;

/**
 * 관리자 공연장 수정 페이지
 */
export default async function VenueEditPage({ params }: VenueEditPageProps) {
  const { id } = await params;
  const venueId = Number(id);

  return <VenueEditView venueId={venueId} />;
}
