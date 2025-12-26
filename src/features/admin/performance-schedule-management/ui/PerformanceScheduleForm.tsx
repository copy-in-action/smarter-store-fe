"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type CreatePerformanceScheduleFormData,
  createPerformanceScheduleSchema,
} from "@/entities/performance-schedule";
import type {
  CreatePerformanceScheduleRequest,
  PerformanceScheduleResponse,
  VenueSeatCapacityRequest,
} from "@/shared/api/orval/types";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  useCreatePerformanceSchedule,
  useUpdatePerformanceSchedule,
} from "../api/performanceSchedule.api";

/**
 * 공연 회차 폼 컴포넌트 속성
 */
interface PerformanceScheduleFormProps {
  /** 공연 ID */
  performanceId: number;
  /** 공연장 좌석 등급 목록 */
  seatGrades?: VenueSeatCapacityRequest[];
  /** 수정할 회차 정보 (수정 모드일 때) */
  schedule?: PerformanceScheduleResponse;
  /** 폼 취소 핸들러 */
  onCancel: () => void;
  /** 성공 핸들러 */
  onSuccess?: () => void;
  /** 폼 모드 */
  mode?: "create" | "edit";
}

/**
 * 공연 회차 폼 컴포넌트 (생성/수정)
 * @param performanceId - 공연 ID
 * @param seatGrades - 공연장 좌석 등급 목록
 * @param schedule - 수정할 회차 정보 (수정 모드일 때)
 * @param onCancel - 폼 취소 핸들러
 * @param onSuccess - 성공 핸들러
 * @param mode - 폼 모드 (create | edit)
 */
export function PerformanceScheduleForm({
  performanceId,
  seatGrades,
  schedule,
  onCancel,
  onSuccess,
  mode = "create",
}: PerformanceScheduleFormProps) {
  const createMutation = useCreatePerformanceSchedule();
  const updateMutation = useUpdatePerformanceSchedule();
  const [showDateOpen, setShowDateOpen] = useState(false);
  const [saleStartDateOpen, setSaleStartDateOpen] = useState(false);

  // 좌석 등급 목록 결정 (수정 모드일 때는 기존 데이터에서 추출)
  const effectiveSeatGrades: VenueSeatCapacityRequest[] =
    seatGrades ||
    schedule?.ticketOptions?.map((option) => ({
      seatGrade: option.seatGrade || "",
      capacity: 0,
    })) ||
    [];

  const form = useForm({
    resolver: zodResolver(createPerformanceScheduleSchema(effectiveSeatGrades)),
    defaultValues: {
      showDateTime: schedule?.showDateTime || "",
      saleStartDateTime: schedule?.saleStartDateTime || "",
      ticketOptions: effectiveSeatGrades.map((seat, index) => ({
        seatGrade: seat.seatGrade,
        price: schedule?.ticketOptions?.[index]?.price || 0,
      })),
    },
  });

  /**
   * 폼 제출 핸들러
   * @param data - 폼 데이터
   */
  const handleSubmit = async (data: CreatePerformanceScheduleFormData) => {
    try {
      if (mode === "edit" && schedule) {
        await updateMutation.mutateAsync({
          scheduleId: schedule.id,
          data,
        });
        toast.success("공연 회차가 성공적으로 수정되었습니다");
      } else {
        await createMutation.mutateAsync({
          performanceId,
          data,
        });
        toast.success("공연 회차가 성공적으로 추가되었습니다");
      }

      onSuccess?.();
      onCancel(); // 폼 닫기
    } catch (error) {
      const errorMessage =
        mode === "edit"
          ? "공연 회차 수정에 실패했습니다"
          : "공연 회차 추가에 실패했습니다";
      toast.error(errorMessage);
      console.error(
        `공연 회차 ${mode === "edit" ? "수정" : "생성"} 실패:`,
        error,
      );
    }
  };

  /**
   * 날짜와 시간을 합쳐서 ISO 문자열로 변환
   * @param date - 날짜
   * @param time - 시간 (HH:mm 형태)
   */
  const combineDateAndTime = (date: Date, time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined.toISOString();
  };

  /**
   * 공연 날짜 설정 핸들러
   * @param date - 선택된 날짜
   * @param time - 입력된 시간
   */
  const handleShowDateTimeChange = (date: Date | undefined, time: string) => {
    if (date && time) {
      const isoString = combineDateAndTime(date, time);
      form.setValue("showDateTime", isoString);
    }
  };

  /**
   * 판매 시작 날짜 설정 핸들러
   * @param date - 선택된 날짜
   * @param time - 입력된 시간
   */
  const handleSaleStartDateTimeChange = (
    date: Date | undefined,
    time: string,
  ) => {
    if (date && time) {
      const isoString = combineDateAndTime(date, time);
      form.setValue("saleStartDateTime", isoString);
    }
  };

  return (
    <Card className="p-2">
      <CardHeader className="flex flex-row items-center justify-between px-2">
        <CardTitle>
          {mode === "edit" ? "공연 회차 수정" : "새 공연 회차 추가"}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* 첫 번째 줄: 날짜 및 시간 선택 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* 공연 시작 일시 */}
              <FormField
                control={form.control}
                name="showDateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>공연 시작 일시</FormLabel>
                    <div className="flex gap-2">
                      <Popover
                        open={showDateOpen}
                        onOpenChange={setShowDateOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start text-left font-normal w-48",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              {field.value
                                ? format(
                                    new Date(field.value),
                                    "yyyy년 MM월 dd일",
                                    { locale: ko },
                                  )
                                : "날짜 선택"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                const timeInput = document.getElementById(
                                  "show-time",
                                ) as HTMLInputElement;
                                if (timeInput?.value) {
                                  handleShowDateTimeChange(
                                    date,
                                    timeInput.value,
                                  );
                                } else {
                                  // 시간이 설정되지 않았으면 기본값으로 현재 시간 설정
                                  const now = new Date();
                                  const defaultTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
                                  handleShowDateTimeChange(date, defaultTime);
                                  if (timeInput) {
                                    timeInput.value = defaultTime;
                                  }
                                }
                              }
                              setShowDateOpen(false);
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        id="show-time"
                        type="time"
                        className="w-32"
                        defaultValue={
                          schedule?.showDateTime
                            ? format(new Date(schedule.showDateTime), "HH:mm")
                            : ""
                        }
                        onChange={(e) => {
                          if (field.value) {
                            const date = new Date(field.value);
                            handleShowDateTimeChange(date, e.target.value);
                          }
                        }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 판매 시작 일시 */}
              <FormField
                control={form.control}
                name="saleStartDateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>판매 시작 일시</FormLabel>
                    <div className="flex gap-2">
                      <Popover
                        open={saleStartDateOpen}
                        onOpenChange={setSaleStartDateOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start text-left font-normal w-48",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              {field.value
                                ? format(
                                    new Date(field.value),
                                    "yyyy년 MM월 dd일",
                                    { locale: ko },
                                  )
                                : "날짜 선택"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                const timeInput = document.getElementById(
                                  "sale-time",
                                ) as HTMLInputElement;
                                if (timeInput?.value) {
                                  handleSaleStartDateTimeChange(
                                    date,
                                    timeInput.value,
                                  );
                                } else {
                                  // 시간이 설정되지 않았으면 기본값으로 현재 시간 설정
                                  const now = new Date();
                                  const defaultTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
                                  handleSaleStartDateTimeChange(
                                    date,
                                    defaultTime,
                                  );
                                  if (timeInput) {
                                    timeInput.value = defaultTime;
                                  }
                                }
                              }
                              setSaleStartDateOpen(false);
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        id="sale-time"
                        type="time"
                        className="w-32"
                        defaultValue={
                          schedule?.saleStartDateTime
                            ? format(
                                new Date(schedule.saleStartDateTime),
                                "HH:mm",
                              )
                            : ""
                        }
                        onChange={(e) => {
                          if (field.value) {
                            const date = new Date(field.value);
                            handleSaleStartDateTimeChange(date, e.target.value);
                          }
                        }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 두 번째 줄: 좌석 등급별 가격 설정 */}
            <div className="mt-6">
              <Label className="text-base font-medium">
                좌석 등급별 가격 설정
              </Label>
              <div className="grid grid-cols-2 gap-4 mt-3 md:grid-cols-3 lg:grid-cols-4">
                {form.watch("ticketOptions").map((_, index) => {
                  const seatGrade = effectiveSeatGrades[index]?.seatGrade || "";
                  return (
                    <FormField
                      key={seatGrade}
                      control={form.control}
                      name={`ticketOptions.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{seatGrade} 등급</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="text"
                                placeholder="가격을 입력하세요"
                                {...field}
                                value={
                                  field.value
                                    ? field.value.toLocaleString()
                                    : ""
                                }
                                onChange={(e) => {
                                  const numericValue = e.target.value.replace(
                                    /[^0-9]/g,
                                    "",
                                  );
                                  field.onChange(Number(numericValue));
                                }}
                              />
                              <span className="absolute text-sm -translate-y-1/2 right-3 top-1/2 text-muted-foreground">
                                원
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex justify-end gap-3 mt-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {mode === "edit"
                  ? updateMutation.isPending
                    ? "수정 중..."
                    : "회차 수정"
                  : createMutation.isPending
                    ? "추가 중..."
                    : "회차 추가"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
