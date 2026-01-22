import { useFormContext } from "react-hook-form";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import type { PaymentFormData } from "../model";

/**
 * 예약자 정보 컴포넌트
 * 예약자의 이름, 이메일, 휴대폰 번호를 표시합니다
 * @returns 예약자 정보 입력 폼
 * @todo hookform 연결 필요
 */
const ReservationInfo = () => {
  const { register } = useFormContext<PaymentFormData>();

  return (
    <section className="px-4">
      <h2 className="text-lg font-semibold">예약자 정보</h2>

      <FieldGroup className="my-3">
        <FieldSet className="gap-3">
          {/* 예약자 */}
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldLabel
                htmlFor="name"
                className="w-20 text-base font-normal text-gray-500"
              >
                예약자
              </FieldLabel>
              <Input
                id="name font-normal"
                readOnly
                {...register("reserverInfo.name")}
                className="read-only:bg-gray-100"
              />
            </Field>
          </FieldGroup>

          {/* 생년월일 */}
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldLabel
                htmlFor="mail"
                className="w-20 text-base font-normal text-gray-500"
              >
                이메일
              </FieldLabel>
              <Input
                {...register("reserverInfo.email")}
                id="email"
                className="read-only:bg-gray-100"
              />
            </Field>
          </FieldGroup>

          {/* 휴대폰 */}
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldLabel
                htmlFor="phoneNumber"
                className="w-20 text-base font-normal text-gray-500"
              >
                휴대폰
              </FieldLabel>
              <Input
                {...register("reserverInfo.phone")}
                id="phoneNumber"
                className="read-only:bg-gray-100"
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <span className="text-sm text-gray-600">
        티켓 수령 및 본인 확인을 위해 정확한 정보를 입력해주세요.
      </span>
    </section>
  );
};

export default ReservationInfo;
