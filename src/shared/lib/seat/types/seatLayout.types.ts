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
 * 좌석 타입 정의 (정적 데이터)
 */
export interface SeatType {
  /** 좌석 타입 라벨 */
  label: string;
  /** 가격 (선택적) */
  price?: number;
}

/**
 * 좌석 등급 설정 인터페이스 (정적 데이터)
 */
export interface SeatGradeConfig {
  /** 좌석 타입 키 */
  seatTypeKey: string;
  /** 좌석 위치 문자열 ("3:" = 3행 전체, ":5" = 5열 전체, "3:5" = 3행 5열) */
  position: string;
}

/**
 * 정적 좌석 배치도 설정 (JSON 파일로 저장)
 */
export interface StaticSeatVenue {
  /** 공연장 ID */
  venueId: number;
  /** 총 행 수 */
  rows: number;
  /** 총 열 수 */
  columns: number;
  /** 좌석 타입들 */
  seatTypes: Record<string, SeatType>;
  /** 좌석 등급 설정들 */
  seatGrades: SeatGradeConfig[];
  /** 비활성화된 좌석들 (물리적으로 존재하지 않는 좌석) */
  disabledSeats: SeatPosition[];
  /** 행 간격 추가 위치들 */
  rowSpacers: number[];
  /** 열 간격 추가 위치들 */
  columnSpacers: number[];
}

/**
 * 동적 예매 상태 데이터 (서버에서 실시간으로 받아오는 데이터)
 */
export interface BookingStatus {
  /** 예약된 좌석들 (이미 결제 완료) */
  reservedSeats: SeatPosition[];
  /** 구매 진행 중인 좌석들 (임시 점유) */
  pendingSeats: SeatPosition[];
}

/**
 * 사용자 선택 좌석 상태 (클라이언트 상태)
 */
export interface UserSeatSelection {
  /** 사용자가 선택한 좌석들 */
  selectedSeats: SeatPosition[];
}

/**
 * 좌석 차트 전체 설정 (정적 배치도 + 실시간 예매 상태 + 사용자 선택)
 */
export interface SeatChartConfig
  extends StaticSeatVenue,
    BookingStatus,
    UserSeatSelection {
  /** 차트 모드 */
  mode: SeatChartMode;
}

/**
 * 좌석 차트 모드
 */
export type SeatChartMode = "edit" | "view";

/**
 * 좌석 상태 타입
 */
export type SeatStatus =
  | "available"
  | "selected"
  | "reserved"
  | "pending"
  | "disabled";

/**
 * 2단계: 좌석 타입별 가격 데이터
 */
export interface SeatTypeObject {
  /** 좌석 타입들 (가격 포함) */
  seatTypes: Record<string, SeatType>;
}

/**
 * BE 저장용 좌석 등급 정보
 */
export interface SeatGradeForBE {
  /** 등급 ID (좌석 타입 키) */
  gradeId: string;
  /** 등급명 */
  gradeName: string;
  /** 해당 등급의 좌석 수 */
  seatCount: number;
}
