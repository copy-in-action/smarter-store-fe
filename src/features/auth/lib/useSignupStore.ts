import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  EmailInputData,
  EmailVerificationData,
  PasswordSetupData,
  PhoneVerificationData,
} from "@/entities/auth";

/**
 * 회원가입 진행 단계
 */
export enum SignupStep {
  PHONE_VERIFICATION = "phone_verification",
  EMAIL_INPUT = "email_input",
  EMAIL_VERIFICATION = "email_verification",
  PASSWORD_SETUP = "password_setup",
  COMPLETED = "completed",
}

/**
 * 회원가입 상태 인터페이스
 */
interface SignupState {
  /** 1단계: 이름과 휴대폰 번호 */
  phoneVerification: PhoneVerificationData | null;
  /** 2단계: 이메일 주소 */
  emailInput: EmailInputData | null;
  /** 3단계: 이메일 인증 코드 */
  emailVerification: EmailVerificationData | null;
  /** 4단계: 비밀번호 설정 */
  passwordSetup: Omit<PasswordSetupData, "confirmPassword"> | null;
  /** 회원가입 완료 여부 */
  isCompleted: boolean;
}

/**
 * 회원가입 액션 인터페이스
 */
interface SignupActions {
  /** 1단계 데이터 설정 */
  setPhoneVerification: (data: PhoneVerificationData) => void;
  /** 2단계 데이터 설정 */
  setEmailInput: (data: EmailInputData) => void;
  /** 3단계 데이터 설정 */
  setEmailVerification: (data: EmailVerificationData) => void;
  /** 4단계 데이터 설정 */
  setPasswordSetup: (data: PasswordSetupData) => void;
  /** 회원가입 완료 처리 */
  completeSignup: () => void;
  /** 모든 데이터 초기화 */
  reset: () => void;
  /** 최종 회원가입 데이터 생성 */
  getSignupData: () => {
    username: string;
    phoneNumber: string;
    email: string;
    password: string;
  } | null;
}

/**
 * 회원가입 스토어 타입
 */
type SignupStore = SignupState & SignupActions;

/**
 * 초기 상태
 */
const initialState: SignupState = {
  phoneVerification: null,
  emailInput: null,
  emailVerification: null,
  passwordSetup: null,
  isCompleted: false,
};

/**
 * 회원가입 Zustand 스토어
 * persist middleware로 localStorage에 자동 저장됩니다
 */
export const useSignupStore = create<SignupStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * 1단계 데이터 설정
       */
      setPhoneVerification: (data: PhoneVerificationData) => {
        set({
          phoneVerification: data,
        });
      },

      /**
       * 2단계 데이터 설정
       */
      setEmailInput: (data: EmailInputData) => {
        set({
          emailInput: data,
        });
      },

      /**
       * 3단계 데이터 설정
       */
      setEmailVerification: (data: EmailVerificationData) => {
        set({
          emailVerification: data,
        });
      },

      /**
       * 4단계 데이터 설정 (confirmPassword 제외하고 저장)
       */
      setPasswordSetup: (data: PasswordSetupData) => {
        set({
          passwordSetup: { password: data.password },
        });
      },

      /**
       * 회원가입 완료 처리
       */
      completeSignup: () => {
        set({
          isCompleted: true,
        });
      },

      /**
       * 모든 데이터 초기화
       */
      reset: () => {
        set(initialState);
      },

      /**
       * 최종 회원가입 데이터 생성
       * 모든 단계가 완료되었을 때만 유효한 데이터 반환
       */
      getSignupData: () => {
        const state = get();

        if (
          !state.phoneVerification ||
          !state.emailInput ||
          !state.passwordSetup
        ) {
          return null;
        }

        return {
          username: state.phoneVerification.username,
          phoneNumber: state.phoneVerification.phoneNumber,
          email: state.emailInput.email,
          password: state.passwordSetup.password,
        };
      },
    }),
    {
      name: "signup-storage",
      storage: createJSONStorage(() => sessionStorage),
      /**
       * persist 옵션
       * - 민감한 데이터는 세션 완료 후 자동 삭제
       * - 브라우저 새로고침 시에도 진행상황 유지
       */
      partialize: (state) => ({
        phoneVerification: state.phoneVerification,
        emailInput: state.emailInput,
        emailVerification: state.emailVerification,
        // 비밀번호는 보안상 localStorage에 저장하지 않음
        isCompleted: state.isCompleted,
      }),
    },
  ),
);
