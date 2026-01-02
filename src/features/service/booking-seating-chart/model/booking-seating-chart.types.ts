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

/**
 * 할인 방법 정보 (API 응답 타입)
 */
export interface DiscountMethod {
  /** 할인 방법 ID */
  id: string;
  /** 할인 방법명 (예: "일반", "청소년", "경로우대") */
  name: string;
  /** 할인율 (0-100) */
  discountRate: number;
}

/**
 * 등급별 할인 방법 수량 선택
 */
export interface GradeDiscountSelection {
  /** 좌석 등급 */
  grade: BookingSeatResponseGrade | string;
  /** 할인 방법별 수량 { discountId: quantity } */
  discounts: Record<string, number>;
}

/**
 * 등급별 좌석 정보 (폼 컴포넌트용)
 */
export interface GradeInfo {
  /** 좌석 등급 */
  grade: BookingSeatResponseGrade | string;
  /** 선택된 좌석 수 */
  seatCount: number;
  /** 기본 가격 (원) */
  basePrice: number;
  /** 좌석 상세 정보 (예: "1열 2번 외 3건") */
  seatDetails: string;
}

/**
 * 좌석 선점 요청 타입
 */
export interface BookingSeatFormData {
  scheduleId: number;
  seats: {
    row: number;
    col: number;
  }[];
}
