"use client";

/**
 * 공지사항 카드 컴포넌트 (entities layer)
 * - 개별 공지사항 표시
 * - 더보기/접기 기능
 */

import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import type { NoticeResponse } from "../model/notice.types";

/**
 * NoticeCard Props
 */
export interface NoticeCardProps {
  /** 공지사항 데이터 */
  notice: NoticeResponse;
  /** 카드 클릭 핸들러 (상세 페이지 이동) */
  onCardClick?: (noticeId: number) => void;
}

/**
 * 공지사항 카드 컴포넌트
 * @param props - NoticeCard Props
 * @returns 공지사항 카드 컴포넌트
 */
export function NoticeCard({ notice, onCardClick }: NoticeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * 더보기/접기 토글
   */
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  /**
   * 카드 클릭 핸들러
   */
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(notice.id);
    }
  };

  return (
    <Card
      className="transition-shadow hover:shadow-md"
      onClick={handleCardClick}
    >
      <CardContent>
        <p
          className={cn("text-sm text-muted-foreground whitespace-pre-wrap", {
            "line-clamp-6": !isExpanded,
          })}
        >
          {notice.content}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="mt-2 h-auto p-0 text-xs"
        >
          {isExpanded ? "접기" : "더보기"}
        </Button>
      </CardContent>
    </Card>
  );
}
