"use client";

/**
 * 공지사항 내용 입력 컴포넌트 (features layer)
 * - Shadcn Textarea 사용
 * - React Hook Form 연동
 */

import type { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Textarea } from "@/shared/ui/textarea";
import type { NoticeFormData } from "../model/notice-form.schema";

/**
 * NoticeContentTextarea Props
 */
export interface NoticeContentTextareaProps {
  /** React Hook Form control */
  control: Control<NoticeFormData>;
  /** 필드 이름 */
  name?: "content";
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 최소 행 수 */
  minRows?: number;
  /** Placeholder 텍스트 */
  placeholder?: string;
}

/**
 * 공지사항 내용 입력 컴포넌트
 * @param props - NoticeContentTextarea Props
 * @returns 내용 입력 컴포넌트
 */
export function NoticeContentTextarea({
  control,
  name = "content",
  disabled = false,
  minRows = 5,
  placeholder = "공지사항 내용을 입력해주세요 (최소 10자 이상)",
}: NoticeContentTextareaProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>내용 *</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className="resize-none"
              rows={minRows}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormDescription>• 최소 10자 이상 입력해주세요</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
