/**
 * 섹션별 다중 태그 선택 컴포넌트
 * 하나의 섹션에 속한 태그들을 MultiSelect로 선택
 */

"use client";

import type { SectionMetadataResponse } from "@/shared/api/orval/types";
import { MultiSelect } from "@/shared/ui/multi-select";

/**
 * HomeTagSectionMultiSelect 컴포넌트 속성
 */
interface HomeTagSectionMultiSelectProps {
  /** 섹션 메타데이터 */
  section: SectionMetadataResponse;
  /** 현재 선택된 태그 코드 배열 */
  selectedTags: string[];
  /** 선택 변경 핸들러 */
  onChange: (tags: string[]) => void;
  /** 비활성화 여부 (저장 중) */
  disabled?: boolean;
}

/**
 * 섹션별 다중 태그 선택 컴포넌트
 * MultiSelect를 사용하여 해당 섹션의 태그들을 선택/해제
 */
export function HomeTagSectionMultiSelect({
  section,
  selectedTags,
  onChange,
  disabled = false,
}: HomeTagSectionMultiSelectProps) {
  // 태그 메타데이터를 MultiSelect 옵션 형식으로 변환
  const options = section.tags.map((tag) => ({
    label: tag.displayName,
    value: tag.tag,
    disabled: tag.isRegionTag, // 지역 태그는 자동 태깅이므로 비활성화
  }));

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">
        {section.displayName}
      </h4>
      <MultiSelect
        options={options}
        onValueChange={onChange}
        defaultValue={selectedTags}
        placeholder="태그를 선택해주세요"
        disabled={disabled}
        maxCount={5}
        className="w-full border-gray-300"
        searchable={true}
        emptyIndicator={<p className="text-center text-sm">태그가 없습니다.</p>}
      />
      {section.section === "REGION" && (
        <span className="text-xs text-gray-500">
          지역은 태그는 자동으로 설정되므로 수정이 불가능합니다.
        </span>
      )}
    </div>
  );
}
