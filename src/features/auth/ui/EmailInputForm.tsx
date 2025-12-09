"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { emailInputSchema, type EmailInputData } from "@/entities/auth";
import { PAGES } from "@/shared/constants";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { ValidatedField } from "@/shared/ui/ValidatedField";
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
  const router = useRouter();
  const setEmailInput = useSignupStore((state) => state.setEmailInput);
  const emailInput = useSignupStore((state) => state.emailInput);

  const form = useForm<EmailInputData>({
    resolver: zodResolver(emailInputSchema),
    defaultValues: {
      email: emailInput?.email ?? "",
    },
    mode: "onChange",
  });

  /**
   * 폼 제출 핸들러
   * Zustand 스토어에 데이터 저장하고 다음 단계로 이동합니다
   */
  const onSubmit = (data: EmailInputData) => {
    setEmailInput(data);
    
    // onNext 콜백이 있으면 호출 (같은 페이지 내 단계 전환)
    if (onNext) {
      onNext();
    } else {
      // 콜백이 없으면 다음 페이지로 이동
      router.push(PAGES.AUTH.SIGNUP.EMAIL.EMAIL_VERIFICATION.path);
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
          disabled={!form.formState.isValid}
        >
          인증번호 요청하기
        </Button>
      </form>
    </Form>
  );
}