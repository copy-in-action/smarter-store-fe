'use client';

import { useVenue } from '@/entities/venue';
import { VenueEditForm } from '@/features/venue-form';
import { Card, CardContent } from '@/shared/ui/card';

/**
 * 공연장 수정 페이지 뷰 컴포넌트 속성
 */
interface VenueEditViewProps {
  /** 공연장 ID */
  venueId: number;
}

/**
 * 관리자 공연장 수정 페이지 뷰 컴포넌트
 */
export default function VenueEditView({ venueId }: VenueEditViewProps) {
  const { data: venue, isLoading, error } = useVenue(venueId);

  /**
   * 로딩 상태 렌더링
   */
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
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
      <div className="container mx-auto py-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                데이터 로딩 실패
              </h2>
              <p className="text-gray-600">
                공연장 정보를 불러오는 중 오류가 발생했습니다.
              </p>
              <p className="text-sm text-red-500 mt-2">{error.message}</p>
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
      <div className="container mx-auto py-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
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
    <div className="container mx-auto py-6">
      <VenueEditForm venue={venue} />
    </div>
  );
}