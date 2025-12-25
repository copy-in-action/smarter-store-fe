"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  type PhoneVerificationData,
  phoneVerificationSchema,
} from "@/entities/auth";
import { PAGES } from "@/shared/constants";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { ValidatedField } from "@/shared/ui/ValidatedField";
import { useSignupStore } from "../lib/useSignupStore";

/**
 * 휴대폰 번호와 이름 입력 폼 컴포넌트
 * 회원가입 1단계에서 사용됩니다
 */
export function PhoneVerificationForm() {
  const router = useRouter();
  const setPhoneVerification = useSignupStore(
    (state) => state.setPhoneVerification,
  );
  const phoneVerification = useSignupStore((state) => state.phoneVerification);

  const form = useForm<PhoneVerificationData>({
    resolver: zodResolver(phoneVerificationSchema),
    defaultValues: {
      username: phoneVerification?.username ?? "",
      phoneNumber: phoneVerification?.phoneNumber ?? "",
    },
    mode: "onChange",
  });

  /**
   * 폼 제출 핸들러
   * Zustand 스토어에 데이터 저장하고 다음 단계로 이동합니다
   */
  const onSubmit = (data: PhoneVerificationData) => {
    setPhoneVerification(data);
    router.push(PAGES.AUTH.SIGNUP.EMAIL.EMAIL_VERIFICATION.path);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <ValidatedField
          control={form.control}
          name="username"
          label="이름"
          placeholder="홍길동"
          type="text"
        />

        <ValidatedField
          control={form.control}
          name="phoneNumber"
          label="휴대폰 번호"
          placeholder="01012345678"
          type="tel"
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
