/**
 * 홈 태그 순서 관리 뷰 컴포넌트
 * 관리자가 홈 화면 섹션별 태그 내 공연 순서를 드래그 앤 드롭으로 관리
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  usePerformancesByTag,
  useUpdatePerformanceOrder,
} from "@/entities/home-tag";
import {
  DraggablePerformanceList,
  TagSelect,
  useOrderState,
} from "@/features/admin/home-tag-order";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Spinner } from "@/shared/ui/spinner";

/**
 * 홈 태그 순서 관리 뷰 컴포넌트
 */
export function HomeTagOrderView() {
  // 선택된 태그 상태
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 태그별 공연 목록 조회
  const { data: performances, isLoading } = usePerformancesByTag(selectedTag);

  // 순서 상태 관리
  const { items, moveItem, resetOrder, hasChanges, getOrderPayload } =
    useOrderState(performances || []);

  // 순서 변경 mutation
  const updateOrderMutation = useUpdatePerformanceOrder();

  /**
   * 태그 선택 변경 핸들러
   */
  const handleTagChange = (tag: string) => {
    // 변경사항이 있으면 확인 메시지 표시
    if (hasChanges) {
      const confirmed = window.confirm(
        "저장하지 않은 변경사항이 있습니다. 태그를 변경하시겠습니까?",
      );
      if (!confirmed) {
        return;
      }
    }
    setSelectedTag(tag);
  };

  /**
   * 순서 저장 핸들러
   */
  const handleSave = async () => {
    if (!selectedTag) return;

    try {
      await updateOrderMutation.mutateAsync({
        tag: selectedTag,
        request: getOrderPayload(),
      });
      toast.success("순서가 성공적으로 저장되었습니다.");
      // mutation의 onSuccess에서 invalidateQueries를 호출하므로 자동으로 데이터 갱신
    } catch (error) {
      console.error("순서 저장 실패:", error);
      toast.error("순서 저장 중 오류가 발생했습니다.");
    }
  };

  /**
   * 초기화 핸들러
   */
  const handleReset = () => {
    const confirmed = window.confirm(
      "변경사항을 초기 상태로 되돌리시겠습니까?",
    );
    if (confirmed) {
      resetOrder();
      toast.info("변경사항이 취소되었습니다.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">홈 태그 순서 관리</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || updateOrderMutation.isPending}
          >
            초기화
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !hasChanges ||
              !selectedTag ||
              updateOrderMutation.isPending ||
              isLoading
            }
          >
            {updateOrderMutation.isPending ? (
              <>
                <Spinner className="mr-2 size-4" />
                저장 중...
              </>
            ) : (
              "순서 저장"
            )}
          </Button>
        </div>
      </div>

      {/* 태그 선택 영역 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>태그 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <TagSelect
            value={selectedTag}
            onChange={handleTagChange}
            disabled={updateOrderMutation.isPending}
          />
          {selectedTag && (
            <p className="text-sm text-gray-500 mt-2">
              선택된 태그의 공연 순서를 드래그하여 변경할 수 있습니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 공연 목록 영역 */}
      {selectedTag && (
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="size-10" />
              </div>
            ) : (
              <DraggablePerformanceList
                performances={items}
                onMoveItem={moveItem}
                disabled={updateOrderMutation.isPending}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* 태그 미선택 안내 */}
      {!selectedTag && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <p>태그를 선택하면 해당 태그의 공연 목록이 표시됩니다.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
