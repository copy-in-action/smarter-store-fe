"use client";

import { CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";

/**
 * 약관 동의 항목 타입
 */
interface TermItem {
  /** 약관 ID */
  id: string;
  /** 필수 여부 */
  required: boolean;
  /** 약관 제목 */
  title: string;
  /** 상세 설명 */
  description?: string;
  /** 링크 URL */
  link?: string;
}

/**
 * 약관 동의 목록
 */
const termsItems: TermItem[] = [
  {
    id: "customer-notice",
    required: true,
    title: "최소 고객 안내",
    description: "예매 당일까지 무료 취소 가능",
  },
  {
    id: "ticket-policy",
    required: true,
    title: "티켓 이용정책 동의",
  },
];

const TermsAgreement = () => {
  const { setValue, watch } = useFormContext();
  const isAgreed = watch("isAgreed");

  const [isCheckedAll, setIsCheckedAll] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  /**
   * 전체 동의 토글
   */
  const handleCheckAll = () => {
    const newCheckedAll = !isCheckedAll;
    setIsCheckedAll(newCheckedAll);

    // 모든 항목을 전체 동의 상태에 맞춤
    const newCheckedItems: Record<string, boolean> = {};
    termsItems.forEach((item) => {
      newCheckedItems[item.id] = newCheckedAll;
    });
    setCheckedItems(newCheckedItems);

    // 필수 약관이 모두 체크되었는지 확인하여 폼에 반영
    const allRequiredChecked = termsItems
      .filter((item) => item.required)
      .every((item) => newCheckedItems[item.id]);
    setValue("isAgreed", allRequiredChecked);
  };

  /**
   * 개별 항목 체크 토글
   */
  const handleCheckItem = (id: string) => {
    const newCheckedItems = {
      ...checkedItems,
      [id]: !checkedItems[id],
    };
    setCheckedItems(newCheckedItems);

    // 모든 항목이 체크되었는지 확인
    const allChecked = termsItems.every((item) => newCheckedItems[item.id]);
    setIsCheckedAll(allChecked);

    // 필수 약관이 모두 체크되었는지 확인하여 폼에 반영
    const allRequiredChecked = termsItems
      .filter((item) => item.required)
      .every((item) => newCheckedItems[item.id]);
    setValue("isAgreed", allRequiredChecked);
  };

  /**
   * 폼 상태와 로컬 상태 동기화
   */
  useEffect(() => {
    setIsCheckedAll(isAgreed);
    if (isAgreed) {
      const newCheckedItems: Record<string, boolean> = {};
      termsItems.forEach((item) => {
        newCheckedItems[item.id] = true;
      });
      setCheckedItems(newCheckedItems);
    }
  }, [isAgreed]);

  return (
    <section className="px-4">
      <h2 className="mb-3 text-lg font-semibold">약관동의</h2>

      <Button
        variant="ghost"
        className="p-0! text-base"
        onClick={handleCheckAll}
        type="button"
      >
        <CircleCheck
          className={cn(
            "size-6 transition-all duration-200 ease-in-out",
            isCheckedAll
              ? "fill-primary text-white scale-110"
              : "text-muted-foreground scale-100",
          )}
          strokeWidth={isCheckedAll ? 1.5 : 1}
        />
        이용약관 전체 동의
      </Button>

      {/* TODO: 안내 상세 모달 구현 필요 */}
      <div className="flex flex-col gap-3 mt-4 ps-1">
        {termsItems.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <Checkbox
              id={item.id}
              className="mt-0.5 ro"
              checked={checkedItems[item.id] || false}
              onCheckedChange={() => handleCheckItem(item.id)}
            />
            <Label htmlFor={item.id} className="flex-1 cursor-pointer">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-400">
                  {item.required && "(필수) "}
                  {item.title}
                  {item.link && " >"}
                </span>
                {item.description && (
                  <span className="text-sm text-blue-500">
                    {item.description}
                  </span>
                )}
              </div>
            </Label>
          </div>
        ))}
      </div>
      <hr className="my-4" />
      <p className="text-sm text-gray-400">개인정보 제 3자 제공 안내</p>
    </section>
  );
};

export default TermsAgreement;
