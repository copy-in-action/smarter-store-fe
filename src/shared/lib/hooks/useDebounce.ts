'use client';

import { useEffect, useState } from 'react';

/**
 * 값을 디바운싱합니다
 * @param value - 디바운싱할 값
 * @param delay - 지연 시간 (밀리초, 기본값: 300ms)
 * @returns 디바운싱된 값
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
