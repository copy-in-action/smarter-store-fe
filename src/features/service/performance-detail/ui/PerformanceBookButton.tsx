/**
 * 예매날 선택 버튼 및 다이얼로그
 * 오늘부터 3개월 미래까지 선택가능
 */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { DateBefore } from "react-day-picker";
// 공연 예매하기 버튼
import { useAuth } from "@/app/providers";
import { PAGES } from "@/shared/constants";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
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
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/shared/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";

/**
 * 공연 예매 버튼 컴포넌트
 * 브레이크포인트에 따라 모바일에서는 드로어, 데스크톱에서는 모달로 표시
 */
const PerformanceBookButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const endMonth = useMemo(() => {
    const today = new Date();
    today.setMonth(today.getMonth() + 3);
    return today;
  }, []);

  //   공연 예매 버튼. 로그인이 안된 경우 로그인 페이지로 이동
  const handleBookPerformance = () => {
    if (!isAuthenticated) {
      router.push(
        `${PAGES.AUTH.LOGIN.path}?redirect=${encodeURIComponent(pathname)}`,
      );
      return;
    }
    setIsOpen((pre) => !pre);
    // TODO: 실제 예매 API연동 필요.
  };

  const matcher: DateBefore = { before: new Date() };

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
          <DrawerContent className="mt-0! max-h-[95dvh]!">
            <div className="w-full max-w-lg mx-auto">
              <DrawerHeader>
                <DrawerTitle></DrawerTitle>
                <DrawerDescription></DrawerDescription>
              </DrawerHeader>
              <div className="p-4 pb-0 max-h-[70dvh] overflow-auto">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full"
                  captionLayout="dropdown"
                  endMonth={endMonth}
                  startMonth={new Date()}
                />
                <hr className="my-3" />
                {/* TODO: 회차 선택 */}
                <RadioGroup defaultValue="kubernetes">
                  <FieldLabel
                    htmlFor="kubernetes-r2h"
                    className="has-data-[state=checked]:!bg-transparent has-data-[state=checked]:shadow-lg has-[>[data-slot=field]]:!rounded-2xl"
                  >
                    <Field orientation="horizontal" className="">
                      <FieldContent>
                        <FieldTitle>19:30</FieldTitle>
                        <FieldDescription>R석 0 | S석 0</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem
                        value="kubernetes"
                        id="kubernetes-r2h"
                        hidden
                      />
                    </Field>
                  </FieldLabel>

                  <FieldLabel
                    htmlFor="kubernetes-r2"
                    className="has-data-[state=checked]:!bg-transparent"
                  >
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>19:30</FieldTitle>
                        <FieldDescription>R석 0 | S석 0</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem value="1241" id="kubernetes-r2" hidden />
                    </Field>
                  </FieldLabel>
                </RadioGroup>
              </div>
              <DrawerFooter>
                <Button className="w-full" type="submit" size={"lg"}>
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
          <DialogContent className="" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle className="text-lg text-start">
                날짜 및 회차 선택
              </DialogTitle>
            </DialogHeader>
            <div className="">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
                captionLayout="dropdown"
                endMonth={endMonth}
                startMonth={new Date()}
                disabled={matcher}
              />
              <hr className="my-3" />
            </div>
            <DialogFooter>
              <Button className="w-full" type="submit" size={"lg"}>
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
