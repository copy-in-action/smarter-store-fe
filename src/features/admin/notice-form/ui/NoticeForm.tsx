"use client";

/**
 * 공지사항 폼 컴포넌트 (features layer)
 * - 생성/수정 모드 지원
 * - React Hook Form + Zod 검증
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type CreateNoticeRequest,
  NoticeCategory,
  type UpdateNoticeRequest,
} from "@/entities/notice";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Form } from "@/shared/ui/form";
import {
  type NoticeFormData,
  noticeFormSchema,
} from "../model/notice-form.schema";
import { NoticeCategorySelect } from "./NoticeCategorySelect";
import { NoticeContentTextarea } from "./NoticeContentTextarea";

/**
 * 공지사항 생성 폼 Props
 */
type CreateProps = {
  /** 생성 모드 */
  mode: "create";
  /** 초기값 (없음) */
  initialValues?: never;
  /** 제출 핸들러 */
  onSubmit: (data: CreateNoticeRequest) => Promise<void>;
  /** 취소 핸들러 */
  onCancel?: () => void;
  /** 로딩 상태 */
  isLoading?: boolean;
};

/**
 * 공지사항 수정 폼 Props
 */
type EditProps = {
  /** 수정 모드 */
  mode: "edit";
  /** 초기값 */
  initialValues?: NoticeFormData;
  /** 제출 핸들러 (변경된 필드만) */
  onSubmit: (data: UpdateNoticeRequest) => Promise<void>;
  /** 취소 핸들러 */
  onCancel?: () => void;
  /** 로딩 상태 */
  isLoading?: boolean;
};

/**
 * 공지사항 폼 Props (Discriminated Union)
 */
type NoticeFormProps = CreateProps | EditProps;

/**
 * 공지사항 생성/수정 폼 컴포넌트
 * @param props - NoticeForm Props
 * @returns 공지사항 폼 컴포넌트
 */
export function NoticeForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
}: NoticeFormProps) {
  /**
   * 기본 초기값 설정
   * - 생성/수정 모두 category, content만 포함
   * - isActive는 PATCH /admin/notices/{id}/status 전용이므로 폼에서 제외
   */
  const getDefaultValues = (): NoticeFormData => {
    if (mode === "edit") {
      return {
        category: initialValues?.category ?? NoticeCategory.BOOKING_NOTICE,
        content: initialValues?.content ?? "",
      };
    }
    return {
      category: NoticeCategory.BOOKING_NOTICE,
      content: "",
    };
  };

  const form = useForm<NoticeFormData>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: getDefaultValues(),
  });

  /**
   * 폼 제출 핸들러
   * dirtyFields를 활용해 변경된 필드만 추출 (수정 모드)
   * @param values - 검증된 폼 데이터
   */
  const handleOnSubmit = async (values: NoticeFormData) => {
    await onSubmit(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "공지사항 등록" : "공지사항 수정"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleOnSubmit)}
            className="space-y-6"
          >
            {/* 카테고리 선택 */}
            <NoticeCategorySelect control={form.control} disabled={isLoading} />

            {/* 내용 입력 */}
            <NoticeContentTextarea
              control={form.control}
              disabled={isLoading}
              minRows={8}
            />

            {/* 버튼 영역 */}
            <div className="flex justify-end gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  취소
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? mode === "create"
                    ? "등록 중..."
                    : "수정 중..."
                  : mode === "create"
                    ? "등록"
                    : "수정"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
