"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { useAdminLoginMutation } from "../api/adminAuth.api";
import { type AdminLoginFormData, adminLoginFormSchema } from "../model/schema";

/**
 * 관리자 로그인 폼 컴포넌트
 * Zod 스키마 검증과 TanStack Query를 사용하여 로그인 기능을 제공합니다
 */
export function AdminLoginForm() {
  const loginMutation = useAdminLoginMutation();

  // FIXME: 로그인 데이터 고정
  const form = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginFormSchema),
    defaultValues: {
      loginId: "admin",
      password: "password123",
    },
  });

  /**
   * 폼 제출 핸들러
   * @param data - 검증된 폼 데이터
   */
  const onSubmit = (data: AdminLoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">관리자 로그인</h1>
        <p className="text-gray-600">관리자 계정으로 로그인하세요</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="loginId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>로그인 ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="로그인 ID를 입력하세요"
                    {...field}
                    disabled={loginMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    {...field}
                    disabled={loginMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <div className="mt-3 text-sm">
          관리자에 외 접근을 금지합니다.
          <br />
          해킹, 무단 접근, 불법적인 사용 시 법적 책임을 질 수 있습니다.
        </div>
      </Form>
    </div>
  );
}
