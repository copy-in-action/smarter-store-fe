import type { PerformanceScheduleResponse } from "@/shared/api/orval/types";

/**
 * 공연 회차의 상태를 계산합니다
 * @param schedule - 공연 회차 정보
 * @returns 회차 상태
 */
export const getScheduleStatus = (schedule: PerformanceScheduleResponse) => {
  const now = new Date();
  const showTime = new Date(schedule.showDateTime);
  const saleStartTime = new Date(schedule.saleStartDateTime);

  /**
   * 상태 판단 로직:
   * - 공연 시간이 지났으면 "종료"
   * - 공연 시간이 미래이고 판매 시작 시간이 지났으면 "판매 중"
   * - 그 외의 경우 "판매 예정"
   */
  if (showTime < now) {
    return "종료";
  } else if (showTime >= now && saleStartTime <= now) {
    return "판매 중";
  } else {
    return "판매 예정";
  }
};

/**
 * 공연 회차 목록을 showDateTime 최신순으로 정렬합니다
 * @param schedules - 공연 회차 목록
 * @returns 정렬된 공연 회차 목록
 */
export const sortSchedulesByShowTime = (schedules: PerformanceScheduleResponse[]) => {
  return [...schedules].sort((a, b) => 
    new Date(b.showDateTime).getTime() - new Date(a.showDateTime).getTime()
  );
};

/**
 * 날짜를 표시용 형식으로 변환합니다
 * @param dateString - ISO 날짜 문자열
 * @returns 형식화된 날짜 문자열
 */
export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 공연 회차 삭제 가능 여부를 확인합니다
 * 판매가 시작된 회차는 삭제할 수 없습니다
 * @param schedule - 공연 회차 정보
 * @returns 삭제 가능 여부
 */
export const canDeleteSchedule = (schedule: PerformanceScheduleResponse) => {
  const now = new Date();
  const saleStartTime = new Date(schedule.saleStartDateTime);
  
  // 판매가 시작되기 전에만 삭제 가능
  return saleStartTime > now;
};