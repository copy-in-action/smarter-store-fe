import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";

/**
 * 검증된 필드 컴포넌트 속성
 */
interface ValidatedFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  /** 폼 컨트롤 */
  control: Control<TFieldValues>;
  /** 필드 이름 */
  name: TName;
  /** 라벨 텍스트 */
  label: string;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 입력 타입 */
  type?: "text" | "email" | "password" | "tel" | "url";
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 검증과 에러 상태를 관리하는 폼 필드 컴포넌트
 * 빈값일 때 에러 메시지와 스타일을 숨깁니다
 */
export function ValidatedField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  className = "mt-2 h-14",
}: ValidatedFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <label className="text-sm font-light" htmlFor={name}>
            {label}
          </label>
          <FormControl>
            <Input
              className={className}
              placeholder={placeholder}
              type={type}
              {...field}
              aria-invalid={!!(fieldState.error && field.value)}
              id={name}
            />
          </FormControl>
          {fieldState.error && field.value && <FormMessage />}
        </FormItem>
      )}
    />
  );
}
