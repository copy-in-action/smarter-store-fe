'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Check } from 'lucide-react';
import { PerformanceSearchSort } from '@/shared/api/orval/types';

/**
 * 정렬 다이얼로그 Props
 */
interface SortDialogProps {
  /** 다이얼로그 열림 상태 */
  open: boolean;
  /** 다이얼로그 상태 변경 핸들러 */
  onOpenChange: (open: boolean) => void;
  /** 현재 선택된 정렬 방식 */
  currentSort: PerformanceSearchSort;
  /** 정렬 방식 선택 핸들러 */
  onSelectSort: (sort: PerformanceSearchSort) => void;
}

/**
 * 정렬 옵션 목록
 */
const SORT_OPTIONS = [
  {
    label: '예매 많은 순',
    value: PerformanceSearchSort.BOOKING_COUNT,
  },
  {
    label: '종료 임박 순',
    value: PerformanceSearchSort.END_DATE_ASC,
  },
  {
    label: '최근 등록 순',
    value: PerformanceSearchSort.CREATED_AT_DESC,
  },
];

/**
 * 정렬 다이얼로그 컴포넌트
 * - 단일 선택
 * - 선택 시 즉시 적용 및 다이얼로그 닫기
 */
export function SortDialog({
  open,
  onOpenChange,
  currentSort,
  onSelectSort,
}: SortDialogProps) {
  /**
   * 정렬 옵션 선택 핸들러
   * @param sort - 선택된 정렬 방식
   */
  const handleSelect = (sort: PerformanceSearchSort) => {
    onSelectSort(sort);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>정렬</DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="w-full flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors"
            >
              <span className="text-sm">{option.label}</span>
              {currentSort === option.value && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
