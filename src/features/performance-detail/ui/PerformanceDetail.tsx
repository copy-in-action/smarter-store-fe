"use client";

import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import type { PerformanceResponse } from "@/shared/api/orval/types";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

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
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 액션 버튼들 */}
      {isAdminMode && (
        <div className="flex gap-3 justify-end mb-3">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(performance)}
            >
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(performance)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold mb-2">
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
            {/* 대표 이미지 */}
            {performance.mainImageUrl && (
              <div className="space-y-2">
                <h3 className="font-medium">대표 이미지</h3>
                <div className="relative overflow-hidden rounded-lg border">
                  <Image
                    src={performance.mainImageUrl}
                    alt={performance.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder-image.jpg";
                      target.alt = "이미지를 불러올 수 없습니다";
                    }}
                  />
                </div>
              </div>
            )}

            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">공연장</h3>
                  <div className="text-sm">
                    {performance.venue ? performance.venue.name : "미지정"}
                  </div>
                  {performance.venue?.address && (
                    <div className="text-sm text-gray-600 mt-1">
                      {performance.venue.address}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-2">공연 기간</h3>
                  <div className="space-y-1 text-sm">
                    {formatDate(performance.startDate)} ~{" "}
                    {formatDate(performance.endDate)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {performance.runningTime && (
                  <div>
                    <h3 className="font-medium mb-2">공연 시간</h3>
                    <div className="text-sm">{performance.runningTime}분</div>
                  </div>
                )}

                {performance.ageRating && (
                  <div>
                    <h3 className="font-medium mb-2">관람 연령</h3>
                    <div className="text-sm">{performance.ageRating}</div>
                  </div>
                )}
              </div>
            </div>

            {/* 공연 설명 */}
            {performance.description && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-medium">공연 소개</h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {performance.description}
                  </div>
                </div>
              </>
            )}

            {/* 메타데이터 (관리자 모드에서만 표시) */}
            {isAdminMode && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">관리 정보</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-600">
                        등록일시
                      </h4>
                      <p className="text-sm">
                        {performance.createdAt
                          ? formatDateTime(performance.createdAt)
                          : "-"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-600">
                        수정일시
                      </h4>
                      <p className="text-sm">
                        {performance.updatedAt
                          ? formatDateTime(performance.updatedAt)
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
