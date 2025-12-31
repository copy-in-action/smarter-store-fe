/**
 * 예매날 선택 버튼 및 다이얼로그
 * 오늘부터 3개월 미래까지 선택가능
 */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/providers";
import { PAGES } from "@/shared/constants";
import { useIsMobile } from "@/shared/hooks/use-device";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";
import {
  usePerformanceDates,
  usePerformancesByDate,
} from "../api/performanceSchedules.api";
import PerformanceScheduleContent from "./PerformanceScheduleContent";

interface Props {
  performanceId: number;
}

/**
 * 공연 예매 버튼 컴포넌트
 * 브레이크포인트에 따라 모바일에서는 드로어, 데스크톱에서는 모달로 표시
 */
const PerformanceBookButton = ({ performanceId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const [date, setDate] = useState<Date | undefined>();
  const endMonth = useMemo(() => {
    const today = new Date();
    today.setMonth(today.getMonth() + 3);
    return today;
  }, []);

  const [selectedScheduleId, setSelectedScheduleId] = useState(0);

  // 공연회차 선택
  const handleSelectSchedule = (_selectedScheduleId: string) => {
    setSelectedScheduleId(Number(_selectedScheduleId));
  };

  // isOpen이 true일 때만 공연 날짜들 페칭
  const { data: performanceDates, isLoading: isDatesLoading } =
    usePerformanceDates(performanceId, isOpen);

  // 선택된 날짜의 공연들 페칭
  const { data: selectedDatePerformances, isLoading: isPerformancesLoading } =
    usePerformancesByDate(performanceId, date!, isOpen);

  // 공연하는 날들을 추출
  const availableDates = useMemo(() => {
    if (!performanceDates) return [];
    return performanceDates.map((performanceDate) => new Date(performanceDate));
  }, [performanceDates]);

  // 로딩 상태 통합
  const isLoading = isDatesLoading || isPerformancesLoading;

  useEffect(() => {
    if (availableDates?.length === 0) return;
    setDate(new Date(availableDates[0]));
  }, [availableDates]);

  /**
   * 공연 예매 버튼 클릭 핸들러
   * 로그인이 안된 경우 로그인 페이지로 이동
   */
  const handleBookPerformance = () => {
    if (!isAuthenticated) {
      router.push(
        `${PAGES.AUTH.LOGIN.path}?redirect=${encodeURIComponent(pathname)}`,
      );
      return;
    }
    setIsOpen((pre) => !pre);
  };

  // 선택 가능한 날짜 설정: 스케줄이 있는 날짜만 허용
  const disabledMatcher = useMemo(() => {
    return (date: Date) => {
      // 과거 날짜 비활성화
      if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
        return true;
      }
      // 스케줄이 없는 날짜 비활성화
      return !availableDates.some(
        (availableDate) => availableDate.toDateString() === date.toDateString(),
      );
    };
  }, [availableDates]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // 선택된 날짜가 변경될 때마다 선택된 회차 초기화
    if (isOpen) return;
    setSelectedScheduleId(0);
  }, [date, isOpen]);

  const handleSubmitBooking = () => {
    router.push(
      `${PAGES.BOOKING.SEATING_CHART.path}?scheduleId=${selectedScheduleId}&performanceId=${performanceId}`,
    );
  };

  return (
    <>
      <div className="fixed z-50 sm:bottom-0 shadow-[0_0_5px_rgba(0,0,0,0.1)] w-full px-4 py-3 bg-background bottom-14 text-center">
        <Button
          className="w-full max-w-4xl"
          size={"lg"}
          onClick={handleBookPerformance}
        >
          예매하기
        </Button>
      </div>

      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={() => setIsOpen((pre) => !pre)}>
          <DrawerContent className="mt-0! max-h-[95dvh]! overflow-hidden">
            <div className="w-full max-w-lg mx-auto">
              <DrawerHeader>
                <DrawerTitle></DrawerTitle>
                <DrawerDescription></DrawerDescription>
              </DrawerHeader>
              <div className="p-4 pb-0 max-h-[70dvh] overflow-auto">
                <PerformanceScheduleContent
                  date={date}
                  setDate={setDate}
                  endMonth={endMonth}
                  disabledMatcher={disabledMatcher}
                  isLoading={isLoading}
                  selectedDatePerformances={selectedDatePerformances}
                  isMobile={true}
                  onSelectSchedule={handleSelectSchedule}
                  selectedScheduleId={selectedScheduleId}
                />
              </div>
              <DrawerFooter>
                <Button
                  className="w-full"
                  type="submit"
                  size={"lg"}
                  disabled={selectedScheduleId === 0}
                  onClick={handleSubmitBooking}
                >
                  예매하기
                </Button>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={isOpen}
          onOpenChange={() => {
            setIsOpen((pre) => !pre);
          }}
        >
          <DialogContent
            className="max-h-[90dvh] overflow-auto"
            aria-describedby={undefined}
          >
            <DialogHeader>
              <DialogTitle className="text-lg text-start">
                날짜 및 회차 선택
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[calc(100% - 150px)]!">
              <PerformanceScheduleContent
                date={date}
                setDate={setDate}
                endMonth={endMonth}
                disabledMatcher={disabledMatcher}
                isLoading={isLoading}
                selectedDatePerformances={selectedDatePerformances}
                isMobile={false}
                onSelectSchedule={handleSelectSchedule}
                selectedScheduleId={selectedScheduleId}
              />
            </div>
            <DialogFooter>
              <Button
                className="w-full"
                type="submit"
                size={"lg"}
                disabled={selectedScheduleId === 0}
                onClick={handleSubmitBooking}
              >
                예매하기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PerformanceBookButton;
