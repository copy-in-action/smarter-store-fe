/**
 * 공연 홈 태그 관리 모달 컴포넌트
 * 공연을 홈 화면 섹션에 태그로 등록/삭제 관리
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useHomeSectionsMetadata } from "@/entities/home-section";
import { usePerformanceHomeTags } from "@/entities/performance";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Spinner } from "@/shared/ui/spinner";
import { useHomeTagMutations } from "../lib/useHomeTagMutations";
import { HomeTagSectionMultiSelect } from "./HomeTagSectionMultiSelect";

/**
 * PerformanceHomeTagManagement 컴포넌트 속성
 */
interface PerformanceHomeTagManagementProps {
  /** 공연 ID */
  performanceId: number;
  /** 공연 제목 */
  performanceTitle: string;
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 저장 성공 콜백 */
  onSuccess?: () => void;
}

/**
 * 공연 홈 태그 관리 모달
 * 섹션별로 태그를 선택하여 공연을 홈 화면에 노출
 */
export function PerformanceHomeTagManagement({
  performanceId,
  performanceTitle,
  isOpen,
  onClose,
  onSuccess,
}: PerformanceHomeTagManagementProps) {
  // 섹션 메타데이터 조회
  const { data: sectionsMetadata, isLoading: isLoadingSections } =
    useHomeSectionsMetadata({ enabled: isOpen });

  // 현재 공연의 홈 태그 조회
  const { data: currentTags, isLoading: isLoadingTags } =
    usePerformanceHomeTags(performanceId, { enabled: isOpen });

  // 태그 일괄 처리 hook
  const { saveChanges, isLoading: isSaving } =
    useHomeTagMutations(performanceId);

  // 섹션별 선택된 태그 상태 관리
  const [selectedTagsBySection, setSelectedTagsBySection] = useState<
    Record<string, string[]>
  >({});

  // 초기 선택된 태그 설정
  const initialTags = useMemo(() => {
    if (!currentTags) return {};
    const tagsBySection: Record<string, string[]> = {};
    for (const tag of currentTags) {
      const section = tag.section;
      if (!tagsBySection[section]) {
        tagsBySection[section] = [];
      }
      tagsBySection[section].push(tag.tag);
    }
    return tagsBySection;
  }, [currentTags]);

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (isOpen && currentTags) {
      setSelectedTagsBySection(initialTags);
    }
  }, [isOpen, currentTags, initialTags]);

  /**
   * 섹션별 태그 선택 변경 핸들러
   */
  const handleSectionChange = (section: string, tags: string[]) => {
    setSelectedTagsBySection((prev) => ({
      ...prev,
      [section]: tags,
    }));
  };

  /**
   * 저장 버튼 클릭 핸들러
   * 변경된 태그만 추가/삭제 처리
   */
  const handleSave = async () => {
    // 변경사항 추출
    const initialTagSet = new Set(Object.values(initialTags).flat());
    const currentTagSet = new Set(Object.values(selectedTagsBySection).flat());

    const added = Array.from(currentTagSet).filter(
      (tag) => !initialTagSet.has(tag),
    );
    const removed = Array.from(initialTagSet).filter(
      (tag) => !currentTagSet.has(tag),
    );

    // 변경사항이 없으면 그냥 닫기
    if (added.length === 0 && removed.length === 0) {
      onClose();
      return;
    }

    // 변경사항 저장
    await saveChanges({ added, removed });

    // 성공 콜백 및 모달 닫기
    onSuccess?.();
    onClose();
  };

  /**
   * 취소 버튼 클릭 핸들러
   */
  const handleCancel = () => {
    setSelectedTagsBySection(initialTags);
    onClose();
  };

  // 로딩 상태
  const isLoading = isLoadingSections || isLoadingTags;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSaving && onClose()}
    >
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        onInteractOutside={(e) => {
          // 저장 중일 때는 외부 클릭 차단
          if (isSaving) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // 저장 중일 때는 ESC 키 차단
          if (isSaving) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>홈 섹션 태그 관리 - {performanceTitle}</DialogTitle>
          <DialogDescription>
            공연을 홈 화면의 섹션별 태그에 등록하여 사용자에게 노출합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-10" />
            </div>
          ) : (
            sectionsMetadata?.map((section) => (
              <HomeTagSectionMultiSelect
                key={section.section}
                section={section}
                selectedTags={selectedTagsBySection[section.section] || []}
                onChange={(tags) => handleSectionChange(section.section, tags)}
                disabled={isSaving || section.section === "REGION"}
              />
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Spinner className="mr-2 size-5" />
                저장 중...
              </>
            ) : (
              "저장"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
