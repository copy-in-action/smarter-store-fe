"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  type Company,
  type CompanyRequest,
  companyRequestSchema,
} from "@/entities/company";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

/**
 * 판매자 폼 모드
 */
export type CompanyFormMode = "create" | "edit";

/**
 * 판매자 폼 속성
 */
interface CompanyFormProps {
  /** 폼 모드 */
  mode: CompanyFormMode;
  /** 초기 데이터 (수정 모드일 때) */
  initialData?: Company;
  /** 제출 핸들러 */
  onSubmit: (data: CompanyRequest) => Promise<void>;
  /** 취소 핸들러 */
  onCancel?: () => void;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * 재사용 가능한 판매자 폼 컴포넌트
 */
export function CompanyForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: CompanyFormProps) {
  const form = useForm<CompanyRequest>({
    resolver: zodResolver(companyRequestSchema),
    defaultValues: {
      name: "",
      ceoName: "",
      businessNumber: "",
      email: "",
      contact: "",
      address: "",
      performanceInquiry: "",
    },
  });

  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset({
        name: initialData.name,
        ceoName: initialData.ceoName || "",
        businessNumber: initialData.businessNumber,
        email: initialData.email || "",
        contact: initialData.contact || "",
        address: initialData.address || "",
        performanceInquiry: initialData.performanceInquiry || "",
      });
    }
  }, [form, mode, initialData]);

  /**
   * 폼 제출 핸들러
   * @param data - 폼 데이터
   */
  const handleSubmit = async (data: CompanyRequest) => {
    try {
      // 빈 문자열을 undefined로 변환
      const cleanedData: CompanyRequest = {
        name: data.name,
        businessNumber: data.businessNumber,
        ceoName: data.ceoName || undefined,
        email: data.email || undefined,
        contact: data.contact || undefined,
        address: data.address || undefined,
        performanceInquiry: data.performanceInquiry || undefined,
      };

      await onSubmit(cleanedData);
    } catch (error) {
      console.error("폼 제출 중 오류:", error);
    }
  };

  /**
   * 사업자등록번호 포맷팅
   * @param value - 입력된 값
   */
  const formatBusinessNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, "");

    // 10자리 숫자를 ###-##-##### 형태로 포맷팅
    if (numbers.length >= 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
    }
    return numbers;
  };

  const isCreateMode = mode === "create";
  const title = isCreateMode ? "새 판매자 등록" : "판매자 정보 수정";
  const description = isCreateMode
    ? "새로운 판매자 또는 판매자 정보를 등록합니다."
    : "판매자 또는 판매자 정보를 수정합니다.";

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isCreateMode ? (
            <Plus className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* 상호 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>상호 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="회사명을 입력하세요"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 대표자명 */}
              <FormField
                control={form.control}
                name="ceoName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>대표자명</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="대표자명을 입력하세요"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 사업자등록번호 */}
              <FormField
                control={form.control}
                name="businessNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사업자등록번호 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000-00-00000"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatBusinessNumber(
                            e.target.value,
                          );
                          field.onChange(formatted);
                        }}
                        disabled={isLoading}
                        maxLength={12}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 이메일 */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="company@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 연락처 */}
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>연락처</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="010-0000-0000"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 주소 */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>주소</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="회사 주소를 입력하세요"
                        className="resize-none"
                        rows={2}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 공연 문의 */}
              <FormField
                control={form.control}
                name="performanceInquiry"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>공연 문의</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="공연 관련 문의 연락처 또는 이메일을 입력하세요"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 버튼 영역 */}
            <div className="flex gap-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  취소
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 ml-auto"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCreateMode ? (
                  <Plus className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isLoading
                  ? "처리 중..."
                  : isCreateMode
                    ? "등록하기"
                    : "수정하기"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
