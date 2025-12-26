"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { loginRequestSchema } from "@/entities/auth";
import type { LoginRequest } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/constants";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { ValidatedField } from "@/shared/ui/ValidatedField";
import useEmailLogin from "../lib/useEmailLogin";

/**
 * 이메일 로그인 폼 컴포넌트 속성
 */
interface EmailLoginFormProps {
  /** 로그인 후 리다이렉트할 URL */
  redirectUrl?: string;
}

/**
 * 이메일 로그인 폼 컴포넌트
 * 이메일과 비밀번호를 입력받아 로그인을 처리합니다
 */
export function EmailLoginForm({ redirectUrl }: EmailLoginFormProps) {
  const router = useRouter();
  const { login, isLoading } = useEmailLogin(redirectUrl);

  // FIXME: 테스트를 위해 하드코딩
  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: "user@example.com",
      password: "password123",
    },
    mode: "onChange",
  });

  /**
   * 로그인 폼 제출 핸들러
   */
  const onSubmit = (loginData: LoginRequest) => {
    login.mutateAsync(loginData);
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
          placeholder="nol@ticket.devhong.cc"
          type="email"
        />

        <ValidatedField
          control={form.control}
          name="password"
          label="비밀번호"
          type="password"
        />

        <Button
          type="submit"
          className="w-full rounded-2xl"
          size={"lg"}
          disabled={isLoading}
        >
          로그인하기
        </Button>
        <Button
          type="button"
          className="w-full rounded-2xl"
          variant={"outline"}
          size={"lg"}
          onClick={() =>
            router.push(PAGES.AUTH.SIGNUP.EMAIL.OCCUPANCY_VERIFICATION.path)
          }
        >
          이메일로 가입하기
        </Button>
      </form>
    </Form>
  );
}
