/**
 * 인증 페이지 제목 컴포넌트 속성
 */
interface AuthTitleProps {
  /** 제목 텍스트 (br 태그로 줄바꿈 가능) */
  children: React.ReactNode;
}

/**
 * 인증 페이지 공통 제목 컴포넌트
 * 회원가입/로그인 페이지에서 재사용됩니다
 */
export function AuthTitle({ children }: AuthTitleProps) {
  return (
    <div className="pt-5 pb-8 sm:text-center">
      <h1 className="text-2xl font-bold">
        {children}
      </h1>
    </div>
  );
}