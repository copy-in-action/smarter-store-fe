/**
 * 예매 프로세스 Step 관리 Store
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  BookingResponse,
  PaymentCreateRequest,
} from "@/shared/api/orval/types";
import type { SeatPosition } from "@/shared/lib/seat";
import type { BookingDiscountFormData } from "../seating-chart";
import type { PaymentConfirmationData } from "./booking.types";
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
  /** 할인 폼에서 사용자가 입력한 값 */
  selectedDiscountInput: BookingDiscountFormData | null;
  /** 결제 화면에 보여주기 위한 최종 가공 데이터 */
  paymentConfirmation: PaymentConfirmationData | null;
  /** 서버에 전송할 결제 요청 데이터 (paymentMethod, isAgreed 제외) */
  paymentRequestData: Omit<
    PaymentCreateRequest,
    "isAgreed" | "paymentMethod"
  > | null;
  /** 저장된 좌석 위치 (Step 3 → 2 복원용) */
  savedSeatPositions: SeatPosition[] | null;
  /** Step 변경 */
  setStep: (step: BookingStep) => void;
  /** 예매 데이터 설정 */
  setBookingData: (bookingData: BookingResponse | null) => void;
  /** 사용자 할인 선택 데이터 설정 */
  setSelectedDiscountInput: (input: BookingDiscountFormData | null) => void;
  /** 최종 결제 데이터 설정 */
  setPaymentConfirmation: (data: PaymentConfirmationData | null) => void;
  /** 서버 전송용 결제 요청 데이터 설정 */
  setPaymentRequestData: (
    data: Omit<PaymentCreateRequest, "isAgreed" | "paymentMethod"> | null,
  ) => void;
  /** 저장된 좌석 위치 설정 */
  setSavedSeatPositions: (seats: SeatPosition[] | null) => void;
  /** 다음 Step으로 이동 */
  nextStep: () => void;
  /** 이전 Step으로 이동 */
  prevStep: () => void;
  /** Step 및 예매 데이터 초기화 */
  reset: () => void;
}

const initialState: Pick<
  BookingStepState,
  | "step"
  | "bookingData"
  | "selectedDiscountInput"
  | "paymentConfirmation"
  | "paymentRequestData"
  | "savedSeatPositions"
> = {
  step: BookingStep.SEAT_SELECTION,
  bookingData: null,
  selectedDiscountInput: null,
  paymentConfirmation: null,
  paymentRequestData: null,
  savedSeatPositions: null,
};

/**
 * 예매 프로세스 Step 관리를 위한 zustand store
 * - persist 미들웨어를 통해 sessionStorage에 상태 저장
 */
export const useBookingStepStore = create<BookingStepState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      setBookingData: (bookingData) => set({ bookingData }),
      setSelectedDiscountInput: (input) =>
        set({ selectedDiscountInput: input }),
      setPaymentConfirmation: (data) => set({ paymentConfirmation: data }),
      setPaymentRequestData: (data) => set({ paymentRequestData: data }),
      setSavedSeatPositions: (seats) => set({ savedSeatPositions: seats }),
      nextStep: () =>
        set((state) => ({
          step: Math.min(state.step + 1, BookingStep.PAYMENT) as BookingStep,
        })),
      prevStep: () =>
        set((state) => ({
          step: Math.max(
            state.step - 1,
            BookingStep.SEAT_SELECTION,
          ) as BookingStep,
          // Step 3 -> 2로 갈 때, paymentConfirmation과 paymentRequestData 초기화
          paymentConfirmation: null,
          paymentRequestData: null,
        })),
      reset: () => set(initialState),
    }),
    {
      name: "booking-step-storage", // 세션 스토리지에 저장될 키
      // SSR 환경에서 sessionStorage 접근 오류를 방지하기 위한 설정
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
