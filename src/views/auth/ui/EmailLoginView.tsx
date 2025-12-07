"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PAGES } from "@/shared/constants";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

/**
 * 이메일 로그인 폼 뷰
 * 이메일과 비밀번호를 입력받아 로그인을 처리합니다
 */
export function EmailLoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * 로그인 폼 제출 핸들러
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 로그인 로직 구현
    console.log("로그인:", { email, password });
  };

  return (
    <div className="auth-wrapper sm:mb-[120px]">
      <div className="pt-5 pb-8 sm:text-center">
        <h1 className="text-2xl font-bold">
          이메일로
          <br />
          로그인 해주세요
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="">
          <label htmlFor="email" className="text-sm font-light">
            이메일(아이디)
          </label>
          <Input
            className="mt-2 h-14"
            id="email"
            type="email"
            placeholder="nol@ticket.devhong.cc"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-light">
            비밀번호
          </label>
          <Input
            className="mt-2 h-14"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full rounded-2xl" size={"lg"}>
          로그인하기
        </Button>
        <Button
          type="button"
          className="w-full rounded-2xl"
          variant={"outline"}
          size={"lg"}
          onClick={() => router.push(PAGES.AUTH.SIGNUP.EMAIL.path)}
        >
          이메일로 가입하기
        </Button>
      </form>

      <div className="mt-5 space-y-2 text-sm text-center">
        <Link href={PAGES.AUTH.FORGOT_ID.path} className="underline">
          아이디 찾기
        </Link>
        <span className="mx-5">ǀ</span>
        <Link href={PAGES.AUTH.FORGOT_PASSWORD.path} className="underline">
          비밀번호 재설정
        </Link>
      </div>
    </div>
  );
}
