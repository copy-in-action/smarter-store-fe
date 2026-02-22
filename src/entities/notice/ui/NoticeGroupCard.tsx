"use client";

/**
 * 공지사항 그룹 카드 컴포넌트 (entities layer)
 * - 카테고리별 공지사항 그룹 표시
 * - 카테고리 제목과 공지사항 목록
 */

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import type { NoticeGroupResponse } from "../model/notice.types";
import { NoticeCard } from "./NoticeCard";

/**
 * NoticeGroupCard Props
 */
export interface NoticeGroupCardProps {
  /** 카테고리별 공지사항 그룹 데이터 */
  group: NoticeGroupResponse;
  /** 공지사항 변경 버튼 클릭 핸들러 (전체 목록 다이얼로그 열기) */
  onCategoryClick?: (category: string, categoryDescription: string) => void;
}

/**
 * 공지사항 그룹 카드 컴포넌트
 * @param props - NoticeGroupCard Props
 * @returns 공지사항 그룹 카드 컴포넌트
 */
export function NoticeGroupCard({
  group,
  onCategoryClick,
}: NoticeGroupCardProps) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center justify-between gap-1 mb-3">
          <span className="text-lg">📌</span>
          <h2 className="text-lg font-semibold">{group.categoryDescription}</h2>
        </div>
        {onCategoryClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onCategoryClick(group.category, group.categoryDescription)
            }
          >
            변경 및 수정
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {group.notices.length > 0 ? (
          group.notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              등록된 공지사항이 없습니다.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
