"use client";

import {
  addHours,
  format,
  getHours,
  setHours,
  setMinutes,
  setSeconds,
} from "date-fns";
import { ko } from "date-fns/locale";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { PaymentResponsePaymentMethod } from "@/shared/api/orval/types";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

const paymentMethods: {
  id: number;
  label: string;
  value: PaymentResponsePaymentMethod;
}[] = [
  {
    id: 1,
    label: "무통장",
    value: "VIRTUAL_ACCOUNT",
  },
  {
    id: 2,
    label: "신용카드",
    value: "CREDIT_CARD",
  },
  {
    id: 3,
    label: "카카오페이",
    value: "KAKAO_PAY",
  },
  {
    id: 4,
    label: "토스페이",
    value: "TOSS_PAY",
  },
];

/**
 * 한국 주요 은행 목록
 */
const banks = [
  { id: 1, code: "KB", name: "KB국민은행" },
  { id: 2, code: "SHINHAN", name: "신한은행" },
  { id: 3, code: "WOORI", name: "우리은행" },
  { id: 4, code: "HANA", name: "하나은행" },
  { id: 5, code: "NH", name: "NH농협은행" },
  { id: 6, code: "IBK", name: "IBK기업은행" },
];

/**
 * 신용카드 결제 컴포넌트
 */
const VirtualAccountPayment = () => {
  const { setValue, control } = useFormContext();
  const bankCode = useWatch({
    control,
    name: "bankCode",
  });

  /**
   * 입금기한 계산: 현재 시각 + 24시간 후, 가장 가까운 12시간 단위로 올림
   * - 0~12시: 같은 날 11:59 AM
   * - 12~24시: 다음날 11:59 PM
   */
  const depositDeadline = useMemo(() => {
    const now = new Date();
    const after24Hours = addHours(now, 24);
    const hour = getHours(after24Hours);

    let deadline: Date;
    if (hour < 12) {
      // 0~12시 사이면 같은 날 11:59 AM으로 설정
      deadline = setMinutes(setHours(after24Hours, 11), 59);
    } else {
      // 12~24시 사이면 다음날 11:59 PM (23:59)로 설정
      const nextDay = addHours(setHours(after24Hours, 0), 24);
      deadline = setMinutes(setHours(nextDay, 23), 59);
    }

    // 초를 0으로 설정
    deadline = setSeconds(deadline, 0);

    // 포맷: 2016-01-09(수) 11:59 PM
    const formatted = format(deadline, "yyyy-MM-dd(E) hh:mm a", { locale: ko });
    // 한국어 "오전"/"오후"를 영어 "AM"/"PM"으로 변경
    return formatted.replace("오전", "AM").replace("오후", "PM");
  }, []);

  return (
    <div>
      <Select
        value={bankCode}
        onValueChange={(value) => setValue("bankCode", value)}
      >
        <SelectTrigger className="w-full text-base">
          <SelectValue placeholder="은행 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {banks.map((bank) => (
              <SelectItem key={bank.id} value={bank.code} className="text-base">
                {bank.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* 예금주 정보 */}
      <div className="flex flex-col gap-2 p-4 mt-4 text-sm text-gray-400 rounded-2xl bg-gray-50">
        <div className="flex justify-between">
          <span>예금주</span>
          <span>(주) CopyinAction</span>
        </div>
        <div className="flex justify-between">
          <span>입금기한</span>
          <span>{depositDeadline}</span>
        </div>
      </div>

      {/* comment */}
      <ul className="pl-5 mt-2 space-y-1 text-sm text-gray-400 list-disc">
        <li>은행에 따라 11:30 PM 이후 온라인 입금이 제한될 수 있습니다.</li>
        <li>ATM기기로는 가상계좌입금이 불가할 수 있습니다.</li>
      </ul>
    </div>
  );
};

const PaymentMethodSelector = () => {
  const { setValue, control } = useFormContext();

  // useWatch를 사용하여 실시간으로 값 구독
  const currentPaymentMethod = useWatch({
    control,
    name: "paymentMethod",
  });

  /**
   * 결제 수단 변경 핸들러
   * @param value - 선택된 탭 라벨
   */
  const handleTabChange = (label: string) => {
    const selectedMethod = paymentMethods.find((m) => m.label === label);
    if (selectedMethod) {
      setValue("paymentMethod", selectedMethod.value);
    }
  };

  // 현재 선택된 결제 수단의 라벨 찾기
  const currentLabel = useMemo(() => {
    return (
      paymentMethods.find((m) => m.value === currentPaymentMethod)?.label ||
      paymentMethods[0].label
    );
  }, [currentPaymentMethod]);

  return (
    <section className="px-4">
      <h2 className="text-lg font-semibold">결제수단</h2>

      <Tabs value={currentLabel} onValueChange={handleTabChange}>
        <TabsList className="w-full bg-background border-b rounded-none p-0!">
          {paymentMethods.map((paymentMethod) => (
            <TabsTrigger
              key={paymentMethod.id}
              value={paymentMethod.label}
              className="relative border-none shadow-none bg-transparent px-4 py-2
                data-[state=active]:bg-transparent
                data-[state=active]:shadow-none
                data-[state=active]:after:content-['']
                data-[state=active]:after:absolute
                data-[state=active]:after:left-0
                data-[state=active]:after:w-full
                data-[state=active]:after:h-[3px]
                data-[state=active]:after:bg-black
                data-[state=active]:after:bottom-[-1px]"
            >
              {paymentMethod.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={paymentMethods[0].label}>
          <Card className="py-3 border-none rounded-none shadow-none">
            <CardContent className="px-0">
              <VirtualAccountPayment />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value={paymentMethods[1].label}>
          <Card className="border-none rounded-none shadow-none">
            <CardContent>미구현</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value={paymentMethods[2].label}>
          <Card className="border-none rounded-none shadow-none">
            <CardContent>미구현</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value={paymentMethods[3].label}>
          <Card className="border-none rounded-none shadow-none">
            <CardContent>미구현</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default PaymentMethodSelector;
