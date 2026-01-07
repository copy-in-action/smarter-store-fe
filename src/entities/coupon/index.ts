// Model
export type {
  CouponCreateRequest,
  CouponResponse,
  CouponUpdateRequest,
} from "./api/coupon.api";
export * from "./api/coupon.api";
// API (React Query)
export {
  couponQueryKeys,
  useCreateCoupon,
  useDeactivateCoupon,
  useGetAllCoupons,
  useGetCoupon,
  useUpdateCoupon,
} from "./api/coupon.api";
export * from "./hooks/useCouponsQuery";

// Schema
export type { CreateCouponForm, UpdateCouponForm } from "./model/coupon.schema";
export { createCouponSchema, updateCouponSchema } from "./model/coupon.schema";
