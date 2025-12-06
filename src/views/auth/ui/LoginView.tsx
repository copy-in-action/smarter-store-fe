"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AppleIcon from "@/../public/icons/apple.svg";
import GoogleIcon from "@/../public/icons/google.svg";
import KakaoIcon from "@/../public/icons/kakao.svg";
import NaverIcon from "@/../public/icons/naver.svg";
import { PAGES } from "@/shared/constants";
import { Button } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/Logo";

/**
 * 로그인 방식 선택 페이지 뷰
 * 이메일, 소셜 로그인 등의 방식을 선택할 수 있습니다
 */
export function LoginView() {
  const oAuths = [
    {
      icon: KakaoIcon,
      title: "카카오",
    },
    {
      icon: NaverIcon,
      title: "네이버",
    },
    {
      icon: GoogleIcon,
      title: "구글",
    },
    {
      icon: AppleIcon,
      title: "애플",
    },
  ];

  return (
    <div className="mb-12 auth-wrapper sm:mb-[120px]">
      {/* 상단 영역 */}
      <section className="flex flex-col items-center gap-6 my-5 sm:my-20">
        <Logo />

        <div className="text-center">
          <h1 className="font-semibold">놀수록 놀라운 세상, NOL</h1>
          <p>
            새로워진 NOL에서
            <br />더 많은 즐거움과 혜택을 만나보세요!
          </p>
        </div>
      </section>

      {/* 로그인 버튼 영역 */}
      <section className="flex flex-col gap-2 my-[50px] sm:my-[120px]">
        {/* TODO: page자체가 클라이언트 컴포넌트가 되므로 별도의 컴포넌트로 분리 필요 */}
        {/* oAuths */}
        {oAuths.map((oAuth) => (
          <Button
            variant={"outline"}
            key={oAuth.title}
            className="h-[52px] cursor-pointer text-base font-semibold shadow-none relative rounded-2xl"
          >
            <Image
              src={oAuth.icon}
              unoptimized
              alt={`${oAuth.title} logo image`}
              className="absolute left-5"
            />
            {oAuth.title}로 시작하기
          </Button>
        ))}

        <div className="py-3 mx-auto">
          <Link
            href={PAGES.AUTH.LOGIN.EMAIL.path}
            className="flex flex-wrap items-center p-2 text-sm font-semibold hover:bg-gray-100"
          >
            이메일로 시작하기 <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* 아이디 찾기 */}
      <section className="text-center">
        <Link
          href={PAGES.AUTH.FORGOT_ID.path}
          className="py-3 text-sm underline hover:bg-gray-100"
        >
          아이디 찾기
        </Link>
      </section>
    </div>
  );
}
