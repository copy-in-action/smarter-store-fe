/**
 * 섹션/태그 선택 Select 컴포넌트
 * 섹션을 그룹으로 하여 태그를 선택
 */

"use client";

import { useHomeSectionsMetadata } from "@/entities/home-section";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Spinner } from "@/shared/ui/spinner";

/**
 * TagSelect 컴포넌트 속성
 */
interface TagSelectProps {
  /** 선택된 태그 코드 */
  value: string | null;
  /** 선택 변경 핸들러 */
  onChange: (tag: string) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 섹션/태그 선택 Select 컴포넌트
 * 섹션별로 그룹화된 태그 목록을 표시
 */
export function TagSelect({
  value,
  onChange,
  disabled = false,
}: TagSelectProps) {
  // 섹션 메타데이터 조회
  const { data: sectionsMetadata, isLoading } = useHomeSectionsMetadata();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner className="size-5" />
        <span className="text-sm text-gray-500">태그 목록 로딩 중...</span>
      </div>
    );
  }

  if (!sectionsMetadata || sectionsMetadata.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        태그 목록을 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">태그 선택</p>
      <Select
        value={value || undefined}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="태그를 선택해주세요" />
        </SelectTrigger>
        <SelectContent>
          {sectionsMetadata
            .filter((section) => section.section !== "REGION")
            .map((section) => (
              <SelectGroup key={section.section}>
                <SelectLabel>{section.displayName}</SelectLabel>
                {section.tags.map((tag) => (
                  <SelectItem
                    key={tag.tag}
                    value={tag.tag}
                    disabled={tag.isRegionTag}
                  >
                    {tag.displayName}
                    {tag.isRegionTag && " (자동 태깅)"}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
