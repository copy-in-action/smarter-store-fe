/**
 * 서비스 페이지용 공연 상세 컴포넌트
 */

import { PerformanceWishlistButton } from "@/features/service/performance-wishlist";
import { ScrollSpyClient } from "../lib/useScrollSpy";
import type { ServicePerformanceDetailProps } from "../model/types";
import PerformanceBookButton from "./PerformanceBookButton";
import PerformanceBookingNotice from "./PerformanceBookingNotice";
import { PerformanceDetailImage } from "./PerformanceDetailImage";
import PerformanceDiscountInfo from "./PerformanceDiscountInfo";
import { PerformanceHashTags } from "./PerformanceHashTags";
import { PerformanceInfo } from "./PerformanceInfo";
import { PerformanceMainImage } from "./PerformanceMainImage";
import PerformanceRefundPolicy from "./PerformanceRefundPolicy";
import { PerformanceTitle } from "./PerformanceTitle";
import PerformanceUsageGuide from "./PerformanceUsageGuide";
import PerformanceVenue from "./PerformanceVenue";

/**
 * 서비스 페이지용 공연 상세 정보를 표시하는 메인 컴포넌트
 */
export function ServicePerformanceDetail({
  performance,
  noticesGrouped,
}: ServicePerformanceDetailProps) {
  return (
    <div className="pb-16 mx-auto sm:pb-20" id="performance-detail">
      {/* 메인 이미지 섹션 */}
      <PerformanceMainImage
        imageUrl={performance.mainImageUrl}
        title={performance.title}
      />
      {/* 제목 섹션 */}
      <PerformanceTitle title={performance.title} />
      {/* 액션 아이콘 영역 (찜하기, 공유하기 등) */}
      <div className="flex gap-3 p-detail-wrapper">
        <PerformanceWishlistButton performanceId={performance.id} />
      </div>
      {/* 해시태그 네비게이션 */}
      <PerformanceHashTags />
      {/* 주요 정보 섹션 */}
      <PerformanceInfo performance={performance} />
      {/* 캐스팅 섹션 */}
      <hr className="h-2 my-5 bg-gray-200 sm:h-[1px] mx-auto max-w-4xl" />

      {/* 상품 상세(상세이미지) 섹션 */}
      <PerformanceDetailImage
        imageUrl={performance.detailImageUrl}
        title={performance.title}
      />
      <hr className="h-2 my-5 bg-gray-200 sm:h-[1px] mx-auto max-w-4xl" />

      {/* 가격 섹션 TODO:구현 필요. 등급과 가격이 어떤 회차를 기준으로 보여주지? */}
      {/* 할인정보 섹션 */}
      <PerformanceDiscountInfo discountInfo={performance.discountInfo} />
      <hr className="h-2 my-5 bg-gray-200 sm:h-[1px] mx-auto max-w-4xl" />

      <PerformanceUsageGuide usageGuide={performance.usageGuide} />
      <hr className="h-2 my-5 bg-gray-200 sm:h-[1px] mx-auto max-w-4xl" />

      {/* 상세 설명 섹션 */}
      {/* <PerformanceDescription
        description={performance.description}
        title={performance.title}
      /> */}
      {/* 장소 섹션 */}
      <PerformanceVenue venue={performance.venue} />
      <hr className="h-2 my-5 bg-gray-200 sm:h-[1px] mx-auto max-w-4xl" />

      {/* 취소 및 환불 규정 섹션 */}
      <PerformanceRefundPolicy refundPolicy={performance.refundPolicy} />
      <hr className="h-2 my-5 bg-gray-200 sm:h-[1px] mx-auto max-w-4xl" />

      {/* 예매 안내사항 */}
      <PerformanceBookingNotice noticesGrouped={noticesGrouped} />
      <hr className="h-2 my-5 bg-gray-200 sm:h-[1px] mx-auto max-w-4xl" />

      {/* 예매하기 버튼 */}
      <PerformanceBookButton performanceId={performance.id} />
      <ScrollSpyClient />
    </div>
  );
}
