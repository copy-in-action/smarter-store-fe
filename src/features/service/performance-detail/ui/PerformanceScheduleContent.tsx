import { Calendar } from "@/shared/ui/calendar";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/shared/ui/field";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";

interface PerformanceScheduleContentProps {
  /** 공연 날짜 정보 */
  date: Date | undefined;
  /** 날짜 변경 핸들러 */
  setDate: (date: Date | undefined) => void;
  /** 종료 월 */
  endMonth: Date;
  /** 비활성화된 날짜 매처 */
  disabledMatcher: (date: Date) => boolean;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 선택된 날짜의 공연 목록 */
  selectedDatePerformances?: Array<{
    id: number;
    showDateTime: string;
    ticketOptions: Array<{
      seatGrade: string;
      remainingSeats: number;
    }>;
  }>;
  /** 모바일 여부 (시간 표시 포맷 차이를 위함) */
  isMobile?: boolean;
}

/**
 * 공연 일정 선택 컨텐츠 컴포넌트
 * 달력과 회차 선택 UI를 공통으로 사용
 */
const PerformanceScheduleContent = ({
  date,
  setDate,
  endMonth,
  disabledMatcher,
  isLoading,
  selectedDatePerformances,
  isMobile = false,
}: PerformanceScheduleContentProps) => {
  return (
    <>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="w-full max-w-[60dvh] mx-auto"
        captionLayout="dropdown"
        endMonth={endMonth}
        startMonth={new Date()}
        disabled={disabledMatcher}
      />
      <hr className="my-3" />
      {/* 회차 선택 */}
      {isLoading ? (
        <div className="py-4 text-center">로딩 중...</div>
      ) : (
        <RadioGroup>
          {selectedDatePerformances?.map((performance) => (
            <FieldLabel
              key={performance.id}
              htmlFor={`performance${isMobile ? "" : "-desktop"}-${performance.id}`}
              className="has-data-[state=checked]:!bg-transparent has-data-[state=checked]:shadow-lg has-[>[data-slot=field]]:!rounded-2xl"
            >
              <Field orientation="horizontal" className="">
                <FieldContent>
                  <FieldTitle>
                    {new Date(performance.showDateTime).toLocaleTimeString(
                      "ko-KR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        ...(isMobile ? {} : { hour12: false }),
                      },
                    )}
                  </FieldTitle>
                  <FieldDescription>
                    {performance.ticketOptions
                      .map(
                        (option) =>
                          `${option.seatGrade}석 ${isMobile ? option.remainingSeats : option.remainingSeats.toLocaleString()}`,
                      )
                      .join(" | ")}
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem
                  value={performance.id.toString()}
                  id={`performance${isMobile ? "" : "-desktop"}-${performance.id}`}
                  hidden
                />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      )}
    </>
  );
};

export default PerformanceScheduleContent;
