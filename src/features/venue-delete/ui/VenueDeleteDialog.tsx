"use client";

import { Trash2 } from "lucide-react";
import type { VenueResponse } from "@/shared/api/orval/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";

/**
 * 공연장 삭제 확인 다이얼로그 속성
 */
interface VenueDeleteDialogProps {
  /** 삭제할 공연장 정보 */
  venue: VenueResponse | null;
  /** 다이얼로그 열림 상태 */
  isOpen: boolean;
  /** 다이얼로그 닫기 핸들러 */
  onClose: () => void;
  /** 삭제 확인 핸들러 */
  onConfirm: (venue: VenueResponse) => void;
  /** 삭제 진행 중 상태 */
  isDeleting?: boolean;
}

/**
 * 공연장 삭제 확인 다이얼로그 컴포넌트
 */
export function VenueDeleteDialog({
  venue,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: VenueDeleteDialogProps) {
  /**
   * 삭제 확인 버튼 클릭 핸들러
   */
  const handleConfirm = () => {
    if (venue) {
      onConfirm(venue);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            공연장 삭제 확인
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2" asChild>
            <div>
              <p>
                <strong className="text-gray-900">{venue?.name}</strong>{" "}
                공연장을 정말 삭제하시겠습니까?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
                <div className="font-medium text-yellow-800 mb-1">
                  ⚠️ 주의사항
                </div>
                <ul className="text-yellow-700 space-y-1">
                  <li>• 삭제된 공연장 정보는 복구할 수 없습니다</li>
                  <li>
                    • 해당 공연장과 연관된 공연, 좌석 정보도 함께 삭제될 수
                    있습니다
                  </li>
                  <li>• 예약된 티켓이 있는 경우 삭제가 제한될 수 있습니다</li>
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  삭제 중...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  삭제하기
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
