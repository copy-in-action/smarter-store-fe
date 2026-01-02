/**
 * 예매 Step 제어 및 API 연동 Hook
 */
import { useCancelBooking } from "../api/useCancelBooking";
import { useStartBooking } from "../api/useStartBooking";
import type { BookingSeatFormData } from "../model/booking-seating-chart.types";
import { useBookingStepStore } from "../model/booking-step.store";

/**
 * 예매 프로세스 Step 제어 및 API 연동을 담당하는 hook
 * - Step 1 → 2: 좌석 점유 API 호출
 * - Step 2 → 1: 좌석 점유 해제 API 호출
 * @param scheduleId - 회차 ID
 * @returns Step 제어 관련 함수 및 상태
 */
export const useBookingStepControl = (scheduleId: number) => {
  const { step, bookingData, setStep, setBookingData, prevStep, reset } =
    useBookingStepStore();

  const { mutate: startBooking, isPending: isStarting } = useStartBooking();
  const { mutate: cancelBooking, isPending: isCanceling } = useCancelBooking();

  /**
   * 좌석 선택 완료 핸들러
   * - 선택된 좌석 데이터를 서버로 전송 (좌석 점유 API)
   * - 성공 시 bookingId 저장 및 Step 2로 전환
   * @param seats - 선택된 좌석 정보
   */
  const handleCompleteSelection = (seats: BookingSeatFormData["seats"]) => {
    if (seats.length === 0) return;

    const bookingData: BookingSeatFormData = {
      scheduleId,
      seats,
    };

    startBooking(bookingData, {
      onSuccess: (response) => {
        console.log("좌석 점유 성공:", response);
        setBookingData(response);
        setStep(2);
      },
      onError: (error) => {
        console.error("좌석 점유 실패:", error);
      },
    });
  };

  /**
   * 이전 Step으로 이동
   * - Step 2에서 1로 갈 때: 좌석 점유 해제 API 호출
   * - 기타: 단순 Step 이동
   */
  const handleBackStep = () => {
    /**
     * Step 2에서 1로 돌아가는 경우
     * - 좌석 점유 해제 API 호출
     * - 성공 시 bookingData 초기화 및 Step 이동
     */
    if (step === 2 && bookingData) {
      cancelBooking(bookingData.bookingId, {
        onSuccess: () => {
          console.log("좌석 점유 해제 성공");
          setBookingData(null);
          prevStep();
        },
        onError: (error) => {
          console.error("좌석 점유 해제 실패:", error);
        },
      });
    } else {
      prevStep();
    }
  };

  return {
    step,
    bookingData,
    isLoading: isStarting || isCanceling,
    isStarting,
    isCanceling,
    handleCompleteSelection,
    handleBackStep,
    reset,
  };
};
