/**
 * 좌석 정보 로딩 스피너 컴포넌트
 */
import { Spinner } from "@/shared/ui/spinner";

/**
 * 좌석 정보 로딩 중 표시되는 스피너 컴포넌트
 * @returns 로딩 스피너 UI
 */
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center w-full h-96">
      <div>
        <Spinner className="mx-auto mb-4 text-blue-500 size-12" />
        좌석 정보를 불러오는 중입니다...
      </div>
    </div>
  );
};

export default LoadingSpinner;
