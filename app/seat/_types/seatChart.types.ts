/**
 * 좌석 위치 정보
 */
export interface SeatPosition {
  /** 행 번호 (0부터 시작) */
  row: number;
  /** 열 번호 (0부터 시작) */
  col: number;
}

/**
 * 좌석 타입 정의
 */
export interface SeatType {
  /** 좌석 타입 라벨 */
  label: string;
  /** CSS 클래스명 */
  cssClass: string;
  /** 가격 */
  price: number;
  /** 좌석 색상 (hex 코드) */
  color: string;
  /** 해당 좌석 타입이 적용될 행들 (선택사항) */
  seatRows?: number[];
}

/**
 * 좌석 차트 설정 인터페이스
 */
export interface SeatChartConfig {
  /** 총 행 수 */
  rows: number;
  /** 총 열 수 */
  columns: number;
  /** 차트 모드 */
  mode: SeatChartMode;
  /** 좌석 타입들 */
  seatTypes: Record<string, SeatType>;
  /** 좌석 등급 설정들 */
  seatGrades?: SeatGradeConfig[];
  /** 비활성화된 좌석들 */
  disabledSeats: SeatPosition[];
  /** 예약된 좌석들 */
  reservedSeats: SeatPosition[];
  /** 구매 진행 중인 좌석들 */
  pendingSeats: SeatPosition[];
  /** 선택된 좌석들 */
  selectedSeats: SeatPosition[];
  /** 행 간격 추가 위치들 */
  rowSpacers: number[];
  /** 열 간격 추가 위치들 */
  columnSpacers: number[];
}

/**
 * 좌석 등급 설정 인터페이스
 */
export interface SeatGradeConfig {
  /** 좌석 타입 키 */
  seatTypeKey: string;
  /** 좌석 위치 문자열 ("3:" = 3행 전체, ":5" = 5열 전체, "3:5" = 3행 5열) */
  position: string;
}

/**
 * 좌석 차트 모드
 */
export type SeatChartMode = "edit" | "view";

/**
 * 좌석 설정 폼 데이터 인터페이스
 */
export interface SeatConfigFormData {
  /** 행 수 */
  rows: number;
  /** 열 수 */
  columns: number;
  /** 차트 모드 */
  mode: SeatChartMode;
  /** 좌석 타입들 */
  seatTypes: Record<string, SeatType>;
  /** 좌석 등급 설정들 */
  seatGrades: SeatGradeConfig[];
  /** 비활성화된 좌석들 (문자열 형태: "0,9") */
  disabledSeats: string[];
  /** 예약된 좌석들 (문자열 형태: "0,3") */
  reservedSeats: string[];
  /** 구매 진행 중인 좌석들 (문자열 형태: "0,4") */
  pendingSeats: string[];
  /** 선택된 좌석들 (문자열 형태: "0,5") */
  selectedSeats: string[];
  /** 행 간격들 */
  rowSpacers: number[];
  /** 열 간격들 */
  columnSpacers: number[];
}