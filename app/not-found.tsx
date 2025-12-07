"use client";

import { CloudAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { PAGES } from "@/shared/constants";
import { Button } from "@/shared/ui/button";

const notFound = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-dvh w-dvw">
      <CloudAlert size={70} />
      화면을 불러오지 못했어요.
      <div className="mt-4 w-36">
        <Button
          variant={"outline"}
          className="w-full mb-1"
          onClick={() => router.back()}
        >
          이전 페이지로
        </Button>
        <Button
          variant={"outline"}
          className="w-full"
          onClick={() => {
            router.push(PAGES.HOME.path);
          }}
        >
          홈으로 이동
        </Button>
      </div>
    </div>
  );
};

export default notFound;
