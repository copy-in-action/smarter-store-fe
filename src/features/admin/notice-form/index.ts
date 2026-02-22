/**
 * Notice Form Feature Public API
 * - 메인 컴포넌트만 export (내부 하위 컴포넌트는 노출 X)
 * - 타입 및 스키마 (외부에서 사용할 것만)
 */

// ✅ 메인 컴포넌트만 export
export { NoticeForm } from "./ui/NoticeForm";

// ✅ 타입 및 스키마 (외부에서 사용할 것만)
export type { NoticeFormData } from "./model/notice-form.schema";
export { noticeFormSchema } from "./model/notice-form.schema";

// ❌ 내부 구현 세부사항은 노출하지 않음
// - NoticeCategorySelect, NoticeContentTextarea (내부 하위 컴포넌트)
