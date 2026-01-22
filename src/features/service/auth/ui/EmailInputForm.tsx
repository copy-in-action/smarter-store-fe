"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type EmailInputData, emailInputSchema } from "@/entities/auth";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { ValidatedField } from "@/shared/ui/ValidatedField";
import { useRequestEmailVerification } from "../lib/useEmailVerification";
import { useSignupStore } from "../lib/useSignupStore";

/**
 * 이메일 입력 폼 컴포넌트 속성
 */
interface EmailInputFormProps {
  /** 다음 단계로 이동할 때 호출되는 콜백 (선택적) */
  onNext?: () => void;
}

/**
 * 이메일 입력 폼 컴포넌트
 * 회원가입 2단계에서 사용됩니다
 */
export function EmailInputForm({ onNext }: EmailInputFormProps = {}) {
  const setEmailInput = useSignupStore((state) => state.setEmailInput);
  const emailInput = useSignupStore((state) => state.emailInput);
  const { requestVerification, isLoading, isError } =
    useRequestEmailVerification();

  const form = useForm<EmailInputData>({
    resolver: zodResolver(emailInputSchema),
    defaultValues: {
      email: emailInput?.email ?? "",
    },
    mode: "onChange",
  });

  /**
   * 폼 제출 핸들러
   * 이메일 인증 요청을 보내고 성공 시 다음 단계로 이동합니다
   */
  const onSubmit = async (data: EmailInputData) => {
    // 먼저 Zustand 스토어에 이메일 저장
    setEmailInput(data);

    // 이메일 인증 요청
    try {
      const res = await requestVerification(data.email);
      console.log("🚀 ~ onSubmit ~ res:", res);
      // onNext 콜백이 있으면 호출 (같은 페이지 내 단계 전환)
      onNext?.();
    } catch (error) {
      // 에러는 useRequestEmailVerification hook에서 처리됨
      console.error("이메일 인증 요청 실패:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <ValidatedField
          control={form.control}
          name="email"
          label="이메일(아이디)"
          placeholder="hol@nol-universe.com"
          type="email"
        />

        <Button
          type="submit"
          className="w-full rounded-2xl"
          size="lg"
          disabled={!form.formState.isValid || isLoading}
        >
          인증번호 요청하기
        </Button>
      </form>
    </Form>
  );
}
