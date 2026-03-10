import { Region } from '@/shared/api/orval/types';

/**
 * Region enum을 한글 지역명으로 변환하는 매핑 객체
 */
export const REGION_KOREAN_MAP: Record<Region, string> = {
  [Region.SEOUL]: '서울',
  [Region.INCHEON]: '인천',
  [Region.DAEJEON]: '대전',
  [Region.DAEGU]: '대구',
  [Region.GWANGJU]: '광주',
  [Region.ULSAN]: '울산',
  [Region.BUSAN]: '부산',
  [Region.SEJONG]: '세종',
  [Region.GYEONGGI]: '경기',
  [Region.GANGWON]: '강원',
  [Region.CHUNGBUK]: '충북',
  [Region.CHUNGNAM]: '충남',
  [Region.JEONBUK]: '전북',
  [Region.JEONNAM]: '전남',
  [Region.GYEONGBUK]: '경북',
  [Region.GYEONGNAM]: '경남',
  [Region.JEJU]: '제주',
};

/**
 * Region enum을 한글 지역명으로 변환합니다
 * @param region - Region enum 값
 * @returns 한글 지역명
 */
export const getRegionKoreanName = (region: Region): string => {
  return REGION_KOREAN_MAP[region];
};

/**
 * 지역명 문자열을 한글로 변환합니다 (Region enum 또는 일반 문자열)
 * @param regionName - 지역명 (Region enum 값 또는 일반 문자열)
 * @returns 한글 지역명 또는 원본 문자열
 */
export const formatRegionName = (regionName?: string): string => {
  if (!regionName) return '';

  // Region enum에 해당하는지 확인
  if (regionName in REGION_KOREAN_MAP) {
    return REGION_KOREAN_MAP[regionName as Region];
  }

  // 그렇지 않으면 원본 문자열 반환
  return regionName;
};
