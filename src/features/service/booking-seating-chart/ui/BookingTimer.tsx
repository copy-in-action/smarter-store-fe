/**
 * 예매 결제 가능 시간 타이머 컴포넌트
 */
"use client";

import { intervalToDuration } from "date-fns";
import { useEffect, useRef, useState } from "react";

/**
 * BookingTimer Props
 */
interface BookingTimerProps {
  /** 남은 시간 (초) */
  remainingSeconds: number;
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
 * 예매 결제 가능 시간을 카운트다운으로 표시하는 타이머 컴포넌트
 * - remainingSeconds를 기준으로 1초마다 감소
 * - 0초가 되면 onExpire 콜백 호출
 * @param props - 컴포넌트 Props
 * @returns 타이머 UI
 */
const BookingTimer = ({ remainingSeconds, onExpire }: BookingTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  // onExpire 함수의 최신 버전을 ref에 저장
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // remainingSeconds가 변경되면 timeLeft 초기화 및 만료 플래그 리셋
  useEffect(() => {
    setTimeLeft(remainingSeconds);
    hasExpiredRef.current = false;
  }, [remainingSeconds]);

  useEffect(() => {
    /**
     * 1초마다 남은 시간 감소
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
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
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
};

export default BookingTimer;
