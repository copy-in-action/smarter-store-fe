/**
 * 홈 태그 일괄 추가/삭제 처리 hook
 * 여러 태그를 동시에 추가하거나 삭제할 때 사용
 */

import { useState } from "react";
import { toast } from "sonner";
import {
  useAddPerformanceHomeTag,
  useDeletePerformanceHomeTag,
} from "@/entities/performance";

/**
 * 태그 변경사항 인터페이스
 */
export interface TagChanges {
  /** 추가할 태그 코드 배열 */
  added: string[];
  /** 삭제할 태그 코드 배열 */
  removed: string[];
}

/**
 * 태그 변경 결과 인터페이스
 */
interface MutationResult {
  /** 성공한 작업 수 */
  successCount: number;
  /** 실패한 작업 수 */
  failureCount: number;
  /** 실패한 태그 목록 */
  failedTags: string[];
}

/**
 * 홈 태그 일괄 처리 hook
 * @param performanceId - 공연 ID
 * @returns 변경사항 저장 함수 및 로딩 상태
 */
export const useHomeTagMutations = (performanceId: number) => {
  const [isLoading, setIsLoading] = useState(false);
  const addMutation = useAddPerformanceHomeTag();
  const deleteMutation = useDeletePerformanceHomeTag();

  /**
   * 태그 변경사항을 일괄 처리하는 함수
   * @param changes - 추가/삭제할 태그 변경사항
   */
  const saveChanges = async (changes: TagChanges): Promise<void> => {
    setIsLoading(true);

    const results: MutationResult = {
      successCount: 0,
      failureCount: 0,
      failedTags: [],
    };

    try {
      // 삭제 작업 처리
      for (const tag of changes.removed) {
        try {
          await deleteMutation.mutateAsync({
            performanceId,
            tag,
          });
          results.successCount++;
        } catch (error) {
          console.error(`Failed to delete tag ${tag}:`, error);
          results.failureCount++;
          results.failedTags.push(tag);
        }
      }

      // 추가 작업 처리
      for (const tag of changes.added) {
        try {
          await addMutation.mutateAsync({
            performanceId,
            request: { tag: tag as never }, // orval 생성 타입으로 캐스팅
          });
          results.successCount++;
        } catch (error) {
          console.error(`Failed to add tag ${tag}:`, error);
          results.failureCount++;
          results.failedTags.push(tag);
        }
      }

      // 결과에 따른 사용자 피드백
      if (results.failureCount === 0) {
        toast.success("홈 태그가 성공적으로 저장되었습니다.");
      } else if (results.successCount === 0) {
        toast.error("홈 태그 저장 중 오류가 발생했습니다.");
      } else {
        toast.warning(
          `일부 태그 저장에 실패했습니다. (성공: ${results.successCount}, 실패: ${results.failureCount})`,
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveChanges,
    isLoading,
  };
};
