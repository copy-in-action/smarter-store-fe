"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  type EmailVerificationData,
  emailVerificationSchema,
} from "@/entities/auth";
import { PAGES } from "@/shared/constants";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { ValidatedField } from "@/shared/ui/ValidatedField";
import { useSignupStore } from "../lib/useSignupStore";

/**
 * 이메일 인증 코드 입력 폼 컴포넌트
 * 회원가입 3단계에서 사용됩니다
 */
export function EmailVerificationForm() {
  const router = useRouter();
  const setEmailVerification = useSignupStore(
    (state) => state.setEmailVerification,
  );
  const emailVerification = useSignupStore((state) => state.emailVerification);
  const emailInput = useSignupStore((state) => state.emailInput);
  const [timeLeft, setTimeLeft] = useState(600); // 10분 = 600초
  const [isResendEnabled, setIsResendEnabled] = useState(false);

  const form = useForm<EmailVerificationData>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      verificationCode: emailVerification?.verificationCode ?? "",
    },
    mode: "onChange",
  });

  /**
   * 카운트다운 타이머 효과
   * 인증 코드 유효시간을 표시하고 재전송 버튼 활성화를 제어합니다
   */
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendEnabled(true);
      // 타이머 종료 시 에러 메시지 표시
      form.setError("verificationCode", {
        type: "manual",
        message: "입력할 수 있는 시간이 종료되었어요.",
      });
    }
  }, [timeLeft, form]);

  /**
   * 시간을 MM:SS 형식으로 포맷팅합니다
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  /**
   * 폼 제출 핸들러
   * Zustand 스토어에 데이터 저장하고 다음 단계로 이동합니다
   */
  const onSubmit = (data: EmailVerificationData) => {
    setEmailVerification(data);
    router.push(PAGES.AUTH.SIGNUP.EMAIL.PASSWORD_CONFIRM.path);
  };

  /**
   * 인증번호 재전송 핸들러
   */
  const handleResend = () => {
    setTimeLeft(600);
    setIsResendEnabled(false);
    // 에러 메시지 클리어
    form.clearErrors("verificationCode");
    // TODO: 인증번호 재전송 API 호출
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ValidatedField
          control={form.control}
          name="verificationCode"
          label="인증번호"
          placeholder="6자리 입력"
          type="text"
          maxLength={6}
          endAddon={
            <button
              type="button"
              onClick={handleResend}
              className="p-1 underline hover:bg-gray-200"
            >
              재요청
            </button>
          }
        />

        {timeLeft > 0 && (
          <div className="mt-2 text-sm text-end">{formatTime(timeLeft)}</div>
        )}

        <div className="mt-8 text-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm">이메일이 오지 않았나요 ?</span>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end" className="w-64 ps-7">
              <ul className="list-disc">
                <li>이메일 도착하는 데 시간이 걸릴 수 있어요.</li>
                <li className="whitespace-normal break-keep">
                  메일을 받지 못했다면 스팸함이나 이메일 설정을 확인해 주세요.
                </li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>

        <Button
          type="submit"
          className="w-full rounded-2xl"
          size="lg"
          disabled={!form.formState.isValid}
        >
          확인
        </Button>
      </form>
    </Form>
  );
}
