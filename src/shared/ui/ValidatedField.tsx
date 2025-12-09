import type { InputHTMLAttributes, ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/ui/input-group";

/**
 * 검증된 필드 컴포넌트 속성
 */
interface ValidatedFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<React.ComponentProps<typeof InputGroupInput>, "name" | "defaultValue"> {
  /** 폼 컨트롤 */
  control: Control<TFieldValues>;
  /** 필드 이름 */
  name: TName;
  /** 라벨 텍스트 */
  label: string;
  /** 왼쪽 addon (inline-start) */
  startAddon?: ReactNode;
  /** 오른쪽 addon (inline-end) */
  endAddon?: ReactNode;
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
  startAddon,
  endAddon,
  className = "mt-2 h-14",
  ...inputProps
}: ValidatedFieldProps<TFieldValues, TName>) {
  const hasAddons = startAddon || endAddon;

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
            {hasAddons ? (
              <InputGroup className={className}>
                {startAddon && (
                  <InputGroupAddon align="inline-start">
                    {startAddon}
                  </InputGroupAddon>
                )}
                <InputGroupInput
                  {...inputProps}
                  {...field}
                  aria-invalid={!!(fieldState.error && field.value)}
                  id={name}
                />
                {endAddon && (
                  <InputGroupAddon align="inline-end">
                    {endAddon}
                  </InputGroupAddon>
                )}
              </InputGroup>
            ) : (
              <Input
                className={className}
                {...inputProps}
                {...field}
                aria-invalid={!!(fieldState.error && field.value)}
                id={name}
              />
            )}
          </FormControl>
          {fieldState.error && field.value && <FormMessage />}
        </FormItem>
      )}
    />
  );
}
