import type {
  SeatGrade,
  VenueSeatCapacityRequest,
} from "@/shared/api/orval/types";
import type { StaticSeatVenue } from "../types/seatLayout.types";

/**
 * 좌석 배치도 컨버터 유틸리티
 */

/**
 * StaticSeatVenue에서 각 등급별 좌석 수를 계산합니다
 * @param staticSeatVenue - 1단계 좌석 배치도 데이터
 * @returns 등급별 좌석 수 정보
 */
export function extractSeatGradeInfo(
  staticSeatVenue: StaticSeatVenue,
): VenueSeatCapacityRequest[] {
  const gradeInfo: Record<string, { gradeName: SeatGrade; capacity: number }> =
    {};

  // 모든 좌석 타입을 우선 초기화 (좌석 수 0으로)
  Object.entries(staticSeatVenue.seatTypes).forEach(([seatGrade]) => {
    gradeInfo[seatGrade] = {
      gradeName: seatGrade as SeatGrade,
      capacity: 0,
    };
  });

  // 각 좌석 위치를 검사하여 등급별 좌석 수 계산
  for (let row = 0; row < staticSeatVenue.rows; row++) {
    for (let col = 0; col < staticSeatVenue.columns; col++) {
      // 비활성화된 좌석은 제외
      const isDisabled = staticSeatVenue.disabledSeats.some(
        (seat) => seat.row === row && seat.col === col,
      );
      if (isDisabled) {
        continue;
      }

      // 해당 좌석의 등급 찾기
      const gradeKey = getSeatGradeKey(row, col, staticSeatVenue);

      if (gradeInfo[gradeKey]) {
        gradeInfo[gradeKey].capacity++;
      }
    }
  }

  // 결과 배열로 변환 (좌석 타입 정의 순서 유지)
  return Object.keys(staticSeatVenue.seatTypes).map((seatGrade) => ({
    seatGrade: gradeInfo[seatGrade].gradeName,
    capacity: gradeInfo[seatGrade].capacity,
  })) as VenueSeatCapacityRequest[];
}

/**
 * 특정 좌석의 등급 키를 찾습니다
 * @param row - 행 번호 (0부터 시작)
 * @param col - 열 번호 (0부터 시작)
 * @param step1Data - 1단계 데이터
 * @returns 좌석 등급 키
 */
function getSeatGradeKey(
  row: number,
  col: number,
  step1Data: StaticSeatVenue,
): string {
  // 각 좌석 타입의 positions를 확인 (구체적인 것부터 확인)
  for (const [seatTypeKey, seatType] of Object.entries(step1Data.seatTypes)) {
    if (!seatType || !seatType.positions) continue;

    for (const position of seatType.positions) {
      const [rowPart, colPart] = position.split(":");

      // "3:5" 형태 - 3행 5열 (가장 구체적이므로 우선 확인)
      if (
        rowPart &&
        colPart &&
        Number(rowPart) - 1 === row &&
        Number(colPart) - 1 === col
      ) {
        return seatTypeKey;
      }
    }
  }

  // 행 전체 매칭 확인
  for (const [seatTypeKey, seatType] of Object.entries(step1Data.seatTypes)) {
    if (!seatType || !seatType.positions) continue;

    for (const position of seatType.positions) {
      const [rowPart, colPart] = position.split(":");

      // "3:" 형태 - 3행 전체
      if (rowPart && !colPart && Number(rowPart) - 1 === row) {
        return seatTypeKey;
      }
    }
  }

  // 열 전체 매칭 확인
  for (const [seatTypeKey, seatType] of Object.entries(step1Data.seatTypes)) {
    if (!seatType || !seatType.positions) continue;

    for (const position of seatType.positions) {
      const [rowPart, colPart] = position.split(":");

      // ":5" 형태 - 5열 전체
      if (!rowPart && colPart && Number(colPart) - 1 === col) {
        return seatTypeKey;
      }
    }
  }

  // 매칭되지 않은 경우 마지막 좌석 타입 반환 (기존 로직과 동일)
  const seatTypeKeys = Object.keys(step1Data.seatTypes);
  const defaultKey = seatTypeKeys[seatTypeKeys.length - 1] || "default";

  return defaultKey;
}

/**
 * BE에서 받은 데이터를 StaticSeatVenue 형태로 복원합니다
 * @param jsonData - JSON으로 저장된 StaticSeatVenue
 * @param gradeInfo - BE에서 관리하는 등급별 정보 (검증용)
 * @returns StaticSeatVenue 객체
 */
export function restoreStaticSeatVenue(
  jsonData: StaticSeatVenue,
  gradeInfo?: VenueSeatCapacityRequest[],
): Omit<StaticSeatVenue, "venueId"> {
  // JSON 데이터 유효성 검증
  if (!jsonData.rows || !jsonData.columns || !jsonData.seatTypes) {
    throw new Error("Invalid StaticSeatVenue: Required fields are missing");
  }

  // 등급 정보가 제공된 경우 검증
  if (gradeInfo) {
    const calculatedGradeInfo = extractSeatGradeInfo(jsonData);

    // 등급 개수 확인
    if (calculatedGradeInfo.length !== gradeInfo.length) {
      console.warn("Grade count mismatch between JSON and BE data");
    }

    // 각 등급의 좌석 수 확인
    for (const beGrade of gradeInfo) {
      const calculatedGrade = calculatedGradeInfo.find(
        (g) => g.seatGrade === beGrade.seatGrade,
      );
      if (calculatedGrade && calculatedGrade.capacity !== beGrade.capacity) {
        console.warn(
          `Seat count mismatch for grade ${beGrade.seatGrade}: JSON=${calculatedGrade.capacity}, BE=${beGrade.capacity}`,
        );
      }
    }
  }

  return {
    rows: jsonData.rows,
    columns: jsonData.columns,
    seatTypes: jsonData.seatTypes,
    disabledSeats: jsonData.disabledSeats || [],
    rowSpacers: jsonData.rowSpacers || [],
    columnSpacers: jsonData.columnSpacers || [],
  };
}

/**
 * StaticSeatVenue를 BE 저장용 형태로 변환합니다
 * @param staticSeatVenue - 1단계 데이터
 * @returns BE 저장용 객체
 */
export function convertForBEStorage(staticSeatVenue: StaticSeatVenue) {
  const gradeInfo = extractSeatGradeInfo(staticSeatVenue);

  return {
    // JSON으로 저장할 전체 배치도 데이터
    layoutJson: staticSeatVenue,

    // 등급별 정보 (별도 테이블에 저장)
    seatGrades: gradeInfo,

    // 기본 통계 정보
    summary: {
      totalSeats: staticSeatVenue.rows * staticSeatVenue.columns,
      availableSeats:
        staticSeatVenue.rows * staticSeatVenue.columns -
        staticSeatVenue.disabledSeats.length,
      disabledSeats: staticSeatVenue.disabledSeats.length,
      gradeCount: gradeInfo.length,
    },
  };
}

/**
 * 좌석 배치도 수정 시 등급 정보 업데이트가 필요한지 확인합니다
 * @param oldData - 기존 StaticSeatVenue
 * @param newData - 새로운 StaticSeatVenue
 * @returns 등급 정보 업데이트 필요 여부와 변경된 등급 정보
 */
export function checkGradeInfoUpdates(
  oldData: StaticSeatVenue,
  newData: StaticSeatVenue,
) {
  const oldGradeInfo = extractSeatGradeInfo(oldData);
  const newGradeInfo = extractSeatGradeInfo(newData);

  // 등급 개수 변경 확인
  const gradeCountChanged = oldGradeInfo.length !== newGradeInfo.length;

  // 등급별 좌석 수 변경 확인
  const capacityChanges: Array<{
    seatGrade: string;
    gradeName: string;
    oldCount: number;
    newCount: number;
  }> = [];

  for (const newGrade of newGradeInfo) {
    const oldGrade = oldGradeInfo.find(
      (g) => g.seatGrade === newGrade.seatGrade,
    );

    if (!oldGrade) {
      // 새로 추가된 등급
      capacityChanges.push({
        seatGrade: newGrade.seatGrade,
        gradeName: newGrade.seatGrade,
        oldCount: 0,
        newCount: newGrade.capacity,
      });
    } else if (oldGrade.capacity !== newGrade.capacity) {
      // 좌석 수가 변경된 등급
      capacityChanges.push({
        seatGrade: newGrade.seatGrade,
        gradeName: newGrade.seatGrade,
        oldCount: oldGrade.capacity,
        newCount: newGrade.capacity,
      });
    }
  }

  // 삭제된 등급 확인
  for (const oldGrade of oldGradeInfo) {
    const stillExists = newGradeInfo.find(
      (g) => g.seatGrade === oldGrade.seatGrade,
    );
    if (!stillExists) {
      capacityChanges.push({
        seatGrade: oldGrade.seatGrade,
        gradeName: oldGrade.seatGrade,
        oldCount: oldGrade.capacity,
        newCount: 0,
      });
    }
  }

  return {
    hasChanges: gradeCountChanged || capacityChanges.length > 0,
    gradeCountChanged,
    capacityChanges,
    newGradeInfo,
  };
}
