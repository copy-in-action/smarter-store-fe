/**
 * 관리자 공연장 등록 페이지 뷰
 */

import { VenueCreateForm } from "@/features/venue-form";

/**
 * 관리자 공연장 등록 페이지 뷰 컴포넌트
 */
export default function VenueCreateView() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">공연장 등록</h1>
        <p className="text-muted-foreground mt-2">
          새로운 공연장 정보를 등록합니다.
        </p>
      </div>

      <VenueCreateForm />
    </div>
  );
}
