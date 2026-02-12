"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, ChevronDown, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { BookingStatus } from "@/entities/booking";
import { useIsMobile } from "@/shared/lib/use-device";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Checkbox } from "@/shared/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

/**
 * 예매 상태 옵션
 */
const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
  { value: "PENDING", label: "결제 대기" },
  { value: "CONFIRMED", label: "예매 확정" },
  { value: "CANCELLED", label: "취소됨" },
  { value: "EXPIRED", label: "만료됨" },
];

interface BookingFilterProps {
  /** 날짜 범위 */
  dateRange: DateRange | undefined;
  /** 날짜 범위 변경 핸들러 */
  setDateRange: (date: DateRange | undefined) => void;
  /** 선택된 상태 목록 */
  selectedStatuses: BookingStatus[];
  /** 상태 토글 핸들러 */
  handleStatusToggle: (status: BookingStatus) => void;
  /** 모든 상태 선택/해제 토글 핸들러 */
  handleSelectAllStatuses: () => void;
  /** 날짜 필터 초기화 */
  clearDateFilter: () => void;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * 예매 목록 필터 컴포넌트
 */
export function BookingFilter({
  dateRange,
  setDateRange,
  selectedStatuses,
  handleStatusToggle,
  handleSelectAllStatuses,
  clearDateFilter,
  isLoading = false,
}: BookingFilterProps) {
  const isMobile = useIsMobile();
  const isAllSelected = selectedStatuses.length === STATUS_OPTIONS.length;

  return (
    <div className="flex sm:items-center gap-1 sm:gap-4 flex-col sm:flex-row">
      {/* 날짜 필터 */}
      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={dateRange ? "default" : "outline"}
              className={cn(
                "justify-start text-left font-normal w-full sm:w-auto",
                !dateRange && "text-muted-foreground",
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "yyyy-MM-dd", { locale: ko })} -{" "}
                    {format(dateRange.to, "yyyy-MM-dd", { locale: ko })}
                  </>
                ) : (
                  format(dateRange.from, "yyyy-MM-dd", { locale: ko })
                )
              ) : (
                <span>공연 일시 선택</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={isMobile ? 1 : 2}
              locale={ko}
            />
          </PopoverContent>
        </Popover>

        {/* 날짜 필터 초기화 */}
        {dateRange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearDateFilter}
            className="h-8 px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 상태 필터 */}
      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="w-full md:auto"
              variant={selectedStatuses.length > 0 ? "default" : "outline"}
              disabled={isLoading}
            >
              상태 <ChevronDown className="w-4 h-4 ml-2" />
              {selectedStatuses.length > 0 && (
                <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs text-foreground">
                  {selectedStatuses.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-4" align="start">
            <div className="space-y-3">
              <p className="text-sm font-medium">예매 상태</p>
              {/* 전체 옵션 */}
              <div className="flex items-center space-x-2 border-b pb-2">
                <Checkbox
                  id="all"
                  checked={isAllSelected}
                  onCheckedChange={() => handleSelectAllStatuses()}
                />
                <label
                  htmlFor="all"
                  className="text-sm font-normal cursor-pointer"
                >
                  전체
                </label>
              </div>
              {STATUS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={selectedStatuses.includes(option.value)}
                    onCheckedChange={() => handleStatusToggle(option.value)}
                  />
                  <label
                    htmlFor={option.value}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
