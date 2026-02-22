"use client";

/**
 * 공지사항 카테고리 선택 컴포넌트 (features layer)
 * - Shadcn Select 사용
 * - React Hook Form 연동
 */

import type { Control } from "react-hook-form";
import { NoticeCategory } from "@/entities/notice/model/notice.types";
import type { NoticeFormData } from "../model/notice-form.schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

/**
 * 카테고리 옵션 목록
 */
const CATEGORY_OPTIONS = [
  {
    value: NoticeCategory.BOOKING_NOTICE,
    label: "예매 유의사항",
  },
  {
    value: NoticeCategory.BANK_TRANSFER_NOTICE,
    label: "무통장입금 입금 시 주의사항",
  },
  {
    value: NoticeCategory.TICKET_RECEIPT_GUIDE,
    label: "티켓 수령안내",
  },
  {
    value: NoticeCategory.MOBILE_TICKET_GUIDE,
    label: "모바일 티켓 안내",
  },
  {
    value: NoticeCategory.REFUND_GUIDE,
    label: "환불 안내",
  },
  {
    value: NoticeCategory.CANCELLATION_REFUND_NOTICE,
    label: "취소 및 환불 유의사항",
  },
] as const;

/**
 * NoticeCategorySelect Props
 */
export interface NoticeCategorySelectProps {
  /** React Hook Form control */
  control: Control<NoticeFormData>;
  /** 필드 이름 */
  name?: "category";
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 공지사항 카테고리 선택 컴포넌트
 * @param props - NoticeCategorySelect Props
 * @returns 카테고리 선택 컴포넌트
 */
export function NoticeCategorySelect({
  control,
  name = "category",
  disabled = false,
}: NoticeCategorySelectProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>카테고리 *</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택해주세요" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
