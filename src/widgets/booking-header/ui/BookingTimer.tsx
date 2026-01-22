/**
 * 예매 결제 가능 시간 타이머 컴포넌트
 */
"use client";

import { intervalToDuration } from "date-fns";
import { memo, useEffect, useRef, useState } from "react";

/**
 * BookingTimer Props
 */
interface BookingTimerProps {
  /** 만료 시각 (ISO 8601) */
  expiresAt: string;
  /** 시간 만료 시 콜백 */
  onExpire?: () => void;
}

/**
 * 초를 MM:SS 또는 HH:MM:SS 형식으로 변환
 * @param totalSeconds - 총 초
 * @returns 포맷된 시간 문자열
 */
const formatTime = (totalSeconds: number): string => {
  const duration = intervalToDuration({
    start: 0,
    end: totalSeconds * 1000,
  });

  const hours = duration.hours ?? 0;
  const minutes = duration.minutes ?? 0;
  const seconds = duration.seconds ?? 0;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

/**
 * expiresAt을 기반으로 남은 시간(초) 계산
 * @param expiresAt - 만료 시각 (ISO 8601 형식)
 * @returns 남은 시간 (초)
 */
const calculateRemainingSeconds = (expiresAt: string): number => {
  const expiresTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const remainingMs = expiresTime - now;
  return Math.max(0, Math.floor(remainingMs / 1000));
};

/**
 * 예매 결제 가능 시간을 카운트다운으로 표시하는 타이머 컴포넌트
 * - expiresAt을 기준으로 1초마다 남은 시간 계산
 * - 0초가 되면 onExpire 콜백 호출
 * - React.memo로 메모이제이션되어 expiresAt 변경 시에만 리렌더링
 * @param props - 컴포넌트 Props
 * @returns 타이머 UI
 */
const BookingTimer = memo(({ expiresAt, onExpire }: BookingTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateRemainingSeconds(expiresAt));
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);
  const expiresAtRef = useRef(expiresAt);

  // onExpire 함수의 최신 버전을 ref에 저장
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // expiresAt이 변경되면 timeLeft 재계산 및 만료 플래그 리셋
  useEffect(() => {
    expiresAtRef.current = expiresAt;
    setTimeLeft(calculateRemainingSeconds(expiresAt));
    hasExpiredRef.current = false;
  }, [expiresAt]);

  useEffect(() => {
    /**
     * 1초마다 expiresAt 기준으로 남은 시간 재계산
     * - 0초가 되면 타이머 중지 및 onExpire 호출 (한 번만)
     */
    if (timeLeft <= 0) {
      if (!hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpireRef.current?.();
      }
      return;
    }

    const timer = setInterval(() => {
      const remaining = calculateRemainingSeconds(expiresAtRef.current);
      setTimeLeft(remaining);

      if (remaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpireRef.current?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /**
   * 남은 시간에 따라 텍스트 색상 변경
   * - 60초 이하: 빨간색 (긴급)
   * - 180초 이하: 주황색 (경고)
   * - 그 외: 기본 색상
   */
  const getColorClass = () => {
    if (timeLeft <= 60) return "text-orange-500 font-bold";
    return "text-blue-500";
  };

  return (
    <div className="flex items-center gap-2 font-semibold">
      <span className="text-sm ">결제 가능 시간</span>
      <span className={`text-lg ${getColorClass()}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
});

BookingTimer.displayName = "BookingTimer";

export default BookingTimer;
