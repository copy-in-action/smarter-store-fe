"use client";

import { Calendar, Edit, Tag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePerformanceHomeTags } from "@/entities/performance";
import type { PerformanceResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { PerformanceHomeTagManagement } from "../../performance-home-tag-management";

/**
 * 공연 상세 컴포넌트 속성
 */
interface PerformanceDetailProps {
  /** 공연 데이터 */
  performance: PerformanceResponse;
  /** 수정 버튼 클릭 핸들러 */
  onEdit?: (performance: PerformanceResponse) => void;
  /** 삭제 버튼 클릭 핸들러 */
  onDelete?: (performance: PerformanceResponse) => void;
  /** 관리자 모드 여부 */
  isAdminMode?: boolean;
}

/**
 * 날짜를 포맷팅하는 함수
 * @param dateString - ISO 날짜 문자열
 * @returns 포맷된 날짜 문자열
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

/**
 * 날짜와 시간을 포맷팅하는 함수
 * @param dateString - ISO 날짜 문자열
 * @returns 포맷된 날짜 시간 문자열
 */
const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * 공연 상태 배지 컴포넌트
 * @param visible - 노출 여부
 */
const StatusBadge = ({ visible }: { visible: boolean }) => {
  return (
    <Badge
      variant={visible ? "default" : "secondary"}
      className={cn(
        "text-sm",
        visible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800",
      )}
    >
      {visible ? "노출" : "비노출"}
    </Badge>
  );
};

/**
 * 공연 상세 정보를 표시하는 컴포넌트
 */
export function PerformanceDetail({
  performance,
  onEdit,
  onDelete,
  isAdminMode = false,
}: PerformanceDetailProps) {
  // 태그 관리 모달 상태
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  // 공연 홈 태그 조회
  const { data: homeTags, refetch: refetchHomeTags } = usePerformanceHomeTags(
    performance.id,
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 액션 버튼들 */}
      {isAdminMode && (
        <div className="flex justify-end gap-3 mb-3">
          <Button variant="outline" size="sm" asChild>
            <Link
              href={PAGES.ADMIN.PERFORMANCES.SCHEDULE_LIST.path(performance.id)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              회차 관리
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setIsTagModalOpen(true)}>
            {" "}
            <Tag className="w-4 h-4 mr-2" />
            태그 관리
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(performance)}
            >
              <Edit className="w-4 h-4 mr-2" />
              수정
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(performance)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </Button>
          )}
        </div>
      )}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="mb-2 text-2xl font-bold">
                {performance.title}
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm">
                  {performance.category}
                </Badge>
                <StatusBadge visible={performance.visible} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                기본 정보
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* 카테고리 */}
                <div>
                  <h4 className="font-medium text-gray-600 mb-1">카테고리</h4>
                  <div className="text-sm">
                    <Badge variant="outline">{performance.category}</Badge>
                  </div>
                </div>

                {/* 공연장 */}
                <div>
                  <h4 className="font-medium text-gray-600 mb-1">공연장</h4>
                  <div className="text-sm">
                    {performance.venue ? performance.venue.name : "미지정"}
                  </div>
                  {performance.venue?.address && (
                    <div className="mt-1 text-xs text-gray-500">
                      {performance.venue.address}
                    </div>
                  )}
                </div>

                {/* 판매자 */}
                <div>
                  <h4 className="font-medium text-gray-600 mb-1">판매자</h4>
                  <div className="text-sm">
                    {performance.company?.name || "미지정"}
                  </div>
                </div>

                {/* 공연 시간 */}
                <div>
                  <h4 className="font-medium text-gray-600 mb-1">공연 시간</h4>
                  <div className="text-sm">
                    {performance.runningTime
                      ? `${performance.runningTime}분`
                      : "미지정"}
                  </div>
                </div>

                {/* 관람 연령 */}
                <div>
                  <h4 className="font-medium text-gray-600 mb-1">관람 연령</h4>
                  <div className="text-sm">
                    {performance.ageRating || "미지정"}
                  </div>
                </div>

                {/* 공연 기간 */}
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-600 mb-1">공연 기간</h4>
                  <div className="text-sm">
                    {formatDate(performance.startDate)} ~{" "}
                    {formatDate(performance.endDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* 상세 정보 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                상세 정보
              </h3>

              {/* 홈 섹션 태그 표시 */}
              {homeTags && homeTags.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-600 mb-2">
                    홈 섹션 태그
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {homeTags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.sectionDisplayName}-{tag.tagDisplayName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 공연 설명 */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-600 mb-2">공연 설명</h4>
                <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {performance.description || "설명이 없습니다."}
                </div>
              </div>

              {/* 대표 이미지 */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-600 mb-2">대표 이미지</h4>
                <div className="relative">
                  {performance.mainImageUrl ? (
                    /** biome-ignore lint/performance/noImgElement: <explanation> */
                    <img
                      src={performance.mainImageUrl}
                      alt={performance.title}
                      className="object-contain max-h-[400px] rounded-lg border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/placeholder-image.jpg";
                        target.alt = "이미지를 불러올 수 없습니다";
                      }}
                    />
                  ) : (
                    <div className="bg-gray-100 border border-gray-300 rounded-lg h-32 flex items-center justify-center text-gray-500">
                      이미지가 없습니다
                    </div>
                  )}
                </div>
              </div>

              {/* 상품상세 이미지 */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-600 mb-2">
                  상품상세 이미지
                </h4>
                <div className="relative">
                  {performance.detailImageUrl ? (
                    /** biome-ignore lint/performance/noImgElement: <explanation> */
                    <img
                      src={performance.detailImageUrl}
                      alt={`${performance.title} 상세`}
                      className="object-contain max-h-[600px] rounded-lg border w-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/placeholder-image.jpg";
                        target.alt = "상세 이미지를 불러올 수 없습니다";
                      }}
                    />
                  ) : (
                    <div className="bg-gray-100 border border-gray-300 rounded-lg h-32 flex items-center justify-center text-gray-500 w-full">
                      상세 이미지가 없습니다
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 추가 정보 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                추가 정보
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* 출연진 */}
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-600 mb-2">출연진</h4>
                  <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {performance.actors || "출연진 정보가 없습니다."}
                  </div>
                </div>

                {/* 판매자 (텍스트) */}
                <div>
                  <h4 className="font-medium text-gray-600 mb-1">판매자</h4>
                  <div className="text-sm">
                    {performance.agency || "미지정"}
                  </div>
                </div>

                {/* 제작사 */}
                <div>
                  <h4 className="font-medium text-gray-600 mb-1">제작사</h4>
                  <div className="text-sm">
                    {performance.producer || "미지정"}
                  </div>
                </div>

                {/* 주최 */}
                <div>
                  <h4 className="font-medium text-gray-600 mb-1">주최</h4>
                  <div className="text-sm">{performance.host || "미지정"}</div>
                </div>

                {/* 예매 수수료 */}
                <div>
                  <h4 className="font-medium text-gray-600 mb-1">
                    예매 수수료
                  </h4>
                  <div className="text-sm">
                    {performance.bookingFee
                      ? `${performance.bookingFee.toLocaleString()}원`
                      : "미지정"}
                  </div>
                </div>

                {/* 할인정보 */}
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-600 mb-2">할인정보</h4>
                  <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {performance.discountInfo || "할인 정보가 없습니다."}
                  </div>
                </div>

                {/* 이용안내 */}
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-600 mb-2">이용안내</h4>
                  <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {performance.usageGuide || "이용안내가 없습니다."}
                  </div>
                </div>

                {/* 취소/환불규정 */}
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-600 mb-2">
                    취소/환불규정
                  </h4>
                  <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {performance.refundPolicy || "취소/환불 규정이 없습니다."}
                  </div>
                </div>

                {/* 배송 안내 */}
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-600 mb-2">배송 안내</h4>
                  <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {performance.shippingGuide || "배송 안내가 없습니다."}
                  </div>
                </div>
              </div>
            </div>

            {/* 메타데이터 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                관리 정보
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-600 mb-1">등록일시</h4>
                  <div className="text-sm">
                    {performance.createdAt
                      ? formatDateTime(performance.createdAt)
                      : "미지정"}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-600 mb-1">수정일시</h4>
                  <div className="text-sm">
                    {performance.updatedAt
                      ? formatDateTime(performance.updatedAt)
                      : "미지정"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 태그 관리 모달 */}
      <PerformanceHomeTagManagement
        performanceId={performance.id}
        performanceTitle={performance.title}
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onSuccess={() => {
          refetchHomeTags();
        }}
      />
    </div>
  );
}
