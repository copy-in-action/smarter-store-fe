"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type PasswordSetupData, passwordSetupSchema } from "@/entities/auth";
import { PAGES } from "@/shared/constants";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { ValidatedField } from "@/shared/ui/ValidatedField";
import { useSignupEmail } from "../lib/useEmailSignup";
import { useSignupStore } from "../lib/useSignupStore";

/**
 * 비밀번호 설정 폼 컴포넌트
 * 회원가입 4단계(최종 단계)에서 사용됩니다
 */
export function PasswordSetupForm() {
  const router = useRouter();
  const { emailSignup } = useSignupEmail();
  const [isLoading, setIsLoading] = useState(false);
  const { setPasswordSetup, getSignupData, completeSignup, reset } =
    useSignupStore();
  const passwordSetup = useSignupStore((state) => state.passwordSetup);

  const form = useForm<PasswordSetupData>({
    resolver: zodResolver(passwordSetupSchema),
    defaultValues: {
      password: passwordSetup?.password ?? "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  /**
   * 폼 제출 핸들러
   * 비밀번호를 설정하고 회원가입을 완료합니다
   */
  const onSubmit = async (data: PasswordSetupData) => {
    try {
      setIsLoading(true);
      setPasswordSetup(data);

      // 최종 회원가입 데이터 가져오기
      const signupData = getSignupData();

      if (!signupData) {
        throw new Error("회원가입 데이터가 완전하지 않습니다");
      }

      await emailSignup(signupData);
      // 성공 시 완료 처리
      completeSignup();
      router.push(PAGES.AUTH.LOGIN.EMAIL.path);

      // 저장된 데이터 삭제 (보안)
      setTimeout(() => {
        reset();
      }, 1000);
    } catch (error) {
      console.error("회원가입 실패:", error);
    } finally {
      setIsLoading(false);
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
          name="password"
          label="비밀번호"
          type="password"
          placeholder="8자 이상 입력해주세요"
        />

        <ValidatedField
          control={form.control}
          name="confirmPassword"
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력해주세요"
        />

        <Button
          type="submit"
          className="w-full rounded-2xl"
          size="lg"
          disabled={!form.formState.isValid || isLoading}
        >
          {isLoading ? "가입 중..." : "가입 완료"}
        </Button>
      </form>
    </Form>
  );
}
