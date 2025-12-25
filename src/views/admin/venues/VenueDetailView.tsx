"use client";

import { useVenue } from "@/entities/venue";
import { VenueDetailForm } from "@/features/admin/venue-form";
import { Card, CardContent } from "@/shared/ui/card";

/**
 * 공연장 상세 페이지 뷰 컴포넌트 속성
 */
interface VenueDetailViewProps {
  /** 공연장 ID */
  venueId: number;
}

/**
 * 관리자 공연장 상세 페이지 뷰 컴포넌트
 */
export default function VenueDetailView({ venueId }: VenueDetailViewProps) {
  const { data: venue, isLoading, error } = useVenue(venueId);

  /**
   * 로딩 상태 렌더링
   */
  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index.toString()} className="space-y-2">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-full h-10 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <div className="w-20 h-4 mb-3 bg-gray-200 rounded animate-pulse" />
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index.toString()} className="space-y-1">
                      <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * 에러 상태 렌더링
   */
  if (error) {
    return (
      <div className="container py-6 mx-auto">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold text-red-600">
                데이터 로딩 실패
              </h2>
              <p className="text-gray-600">
                공연장 정보를 불러오는 중 오류가 발생했습니다.
              </p>
              <p className="mt-2 text-sm text-red-500">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * 공연장이 없는 경우
   */
  if (!venue) {
    return (
      <div className="container py-6 mx-auto">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold text-gray-600">
                공연장을 찾을 수 없습니다
              </h2>
              <p className="text-gray-600">
                요청하신 공연장이 존재하지 않거나 삭제되었습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 mx-auto">
      <VenueDetailForm venue={venue} />
    </div>
  );
}
