/**
 * 예매 프로세스 Step 관리 Store
 */
import { create } from "zustand";
import type { BookingResponse } from "@/shared/api/orval/types";

/**
 * 예매 Step enum
 * - SEAT_SELECTION: 좌석 선택
 * - DISCOUNT_SELECTION: 할인 선택
 * - PAYMENT: 결제 (예약)
 */
export enum BookingStep {
  /** 좌석 선택 */
  SEAT_SELECTION = 1,
  /** 할인 선택 */
  DISCOUNT_SELECTION = 2,
  /** 결제 (예약) */
  PAYMENT = 3,
}

/**
 * 예매 Step Store 상태
 */
interface BookingStepState {
  /** 현재 Step */
  step: BookingStep;
  /** 예매 응답 데이터 (좌석 점유 후 받은 데이터) */
  bookingData: BookingResponse | null;
  /** Step 변경 */
  setStep: (step: BookingStep) => void;
  /** 예매 데이터 설정 */
  setBookingData: (bookingData: BookingResponse | null) => void;
  /** 다음 Step으로 이동 */
  nextStep: () => void;
  /** 이전 Step으로 이동 */
  prevStep: () => void;
  /** Step 및 예매 데이터 초기화 */
  reset: () => void;
}

/**
 * 예매 프로세스 Step 관리를 위한 zustand store
 */
export const useBookingStepStore = create<BookingStepState>((set) => ({
  step: BookingStep.SEAT_SELECTION,
  bookingData: null,
  setStep: (step) => set({ step }),
  setBookingData: (bookingData) => set({ bookingData }),
  nextStep: () =>
    set((state) => ({
      step: Math.min(state.step + 1, BookingStep.PAYMENT) as BookingStep,
    })),
  prevStep: () =>
    set((state) => ({
      step: Math.max(state.step - 1, BookingStep.SEAT_SELECTION) as BookingStep,
    })),
  reset: () => set({ step: BookingStep.SEAT_SELECTION, bookingData: null }),
}));
