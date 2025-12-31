/**
 * 예매 좌석 선택 기능 타입 정의
 */

import type { BookingSeatResponseGrade } from "@/shared/api/orval/types";

/**
 * 사용자가 선택한 좌석 정보
 */
export interface UserSelectedSeat {
  /** 행 번호 (0-based index) */
  row: number;
  /** 열 번호 (0-based index) */
  col: number;
  /** 좌석 등급 */
  grade: BookingSeatResponseGrade | string;
  /** 좌석 가격 (원) */
  price: number;
}

/**
 * 좌석 등급별 가격 정보
 */
export interface SeatGradeInfo {
  /** 등급 라벨 */
  label: string;
  /** 가격 (원) */
  price: number;
}
