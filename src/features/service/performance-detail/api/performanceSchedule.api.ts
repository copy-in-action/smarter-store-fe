/**
 * 공연하는 날들 관련 API
 */
import {
  performanceSchedules,
  performanceShowDateTimes,
} from "../model/constants";

/**
 * 공연하는 날들 목록을 조회합니다
 * @param performanceId - 공연 ID
 * @returns 해당 공연의 공연하는 날들 목록
 */
export async function getPerformanceDates(performanceId: number) {
  // 실제 API 호출 시뮬레이션 (500ms 지연)
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: 실제 API 연동 시 performanceId로 필터링
  return performanceShowDateTimes;
}

/**
 * 특정 날짜의 공연 스케줄들을 조회합니다
 * @param performanceId - 공연 ID
 * @param selectedDate - 선택된 날짜 (YYYY-MM-DD 형식)
 * @returns 해당 날짜의 공연 스케줄 목록
 */
export async function getPerformancesByDate(
  performanceId: number,
  selectedDate: string,
) {
  // 실제 API 호출 시뮬레이션 (300ms 지연)
  await new Promise((resolve) => setTimeout(resolve, 300));
  // TODO: 실제 API 연동 시 performanceId와 selectedDate로 필터링
  // 선택된 날짜와 일치하는 공연들만 필터링
  const filteredPerformances = performanceSchedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.showDateTime);
    const targetDate = new Date(selectedDate);
    return scheduleDate.toDateString() === targetDate.toDateString();
  });

  return filteredPerformances;
}
