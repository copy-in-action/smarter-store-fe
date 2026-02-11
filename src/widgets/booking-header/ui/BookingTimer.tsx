/**
 * 예매 결제 가능 시간 타이머 컴포넌트
 */
"use client";

import { intervalToDuration } from "date-fns";
import { Timer } from "lucide-react";
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
 * - 0초가 되면 onExpire 콜백 호출 (화면 업데이트 후)
 * - React.memo로 메모이제이션되어 expiresAt 변경 시에만 리렌더링
 * @param props - 컴포넌트 Props
 * @returns 타이머 UI
 */
const BookingTimer = memo(({ expiresAt, onExpire }: BookingTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateRemainingSeconds(expiresAt),
  );
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  // onExpire 함수의 최신 버전을 ref에 저장
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // expiresAt 변경 시 타이머 재설정
  useEffect(() => {
    // 만료 상태 리셋
    hasExpiredRef.current = false;

    /**
     * 타이머 업데이트 함수
     * - 남은 시간 계산 및 상태 업데이트만 수행
     */
    const updateTimer = () => {
      const remaining = calculateRemainingSeconds(expiresAt);
      setTimeLeft(remaining);
    };

    // 초기 업데이트
    updateTimer();

    // 1초마다 업데이트
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  /**
   * timeLeft가 0이 되었을 때 onExpire 호출
   * - 별도 effect로 분리하여 렌더링 완료 후 실행 보장
   */
  useEffect(() => {
    if (timeLeft <= 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true;
      onExpireRef.current?.();
    }
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
    <div className="flex items-center gap-1 font-semibold">
      <span className="hidden text-sm sm:block grow-0 break-keep">
        결제 가능 시간
      </span>
      <Timer className="size-5 sm:hidden" />
      <span className={`text-lg min-w-[4rem] ${getColorClass()} grow`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
});

BookingTimer.displayName = "BookingTimer";

export default BookingTimer;
