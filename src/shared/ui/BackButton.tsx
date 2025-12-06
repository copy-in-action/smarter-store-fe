"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { Button } from "./button";

/**
 * 뒤로가기 버튼 컴포넌트 속성
 */
interface BackButtonProps {
  /** 추가 CSS 클래스명 */
  className?: string;
  /** 버튼 크기 */
  size?: number;
}

/**
 * 뒤로가기 버튼 컴포넌트
 * ChevronLeft 아이콘을 사용하여 이전 페이지로 이동합니다
 */
export function BackButton({ className, size = 32 }: BackButtonProps) {
  const router = useRouter();

  /**
   * 뒤로가기 핸들러
   */
  const handleBack = () => {
    router.back();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleBack}
      className={cn("h-auto p-1 px-1!", className)}
      aria-label="뒤로가기"
    >
      <ChevronLeft style={{ width: size, height: size }} strokeWidth={1} />
    </Button>
  );
}
