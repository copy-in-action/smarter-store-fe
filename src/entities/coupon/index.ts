/**
 * Coupon 엔티티 Public API
 */

// API 함수 (순수 API)
export { getCouponsApi } from "./api/coupon.api";

// React Query hooks
export {
  couponQueryKeys,
  useCreateCoupon,
  useCouponsQuery,
  useDeactivateCoupon,
  useGetAllCoupons,
  useGetCoupon,
  useUpdateCoupon,
  useValidateCoupons,
} from "./api/coupon.queries";

// Types
export type {
  AvailableCouponResponse,
  CouponCreateRequest,
  CouponResponse,
  CouponUpdateRequest,
  CouponValidateRequest,
  CouponValidateResponse,
} from "@/shared/api/orval/types";

// Schema
export type { CreateCouponForm, UpdateCouponForm } from "./model/coupon.schema";
export { createCouponSchema, updateCouponSchema } from "./model/coupon.schema";
