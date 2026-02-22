import { BookCheck, ChevronRight } from "lucide-react";
import {
  NoticeCategory,
  type NoticeGroupResponse,
} from "@/shared/api/orval/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { ScrollArea } from "@/shared/ui/scroll-area";

/**
 * 공연 예매안내사항 컴포넌트 Props
 */
interface PerformanceBookingNoticeProps {
  /** 카테고리별 그룹화된 공지사항 목록 */
  noticesGrouped: NoticeGroupResponse[];
}

/**
 * 공지사항 카테고리별 표시 레이블 매핑 옵션
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
 * 공연 예매안내사항 컴포넌트
 * 다이얼로그 형태로 상세 정보를 제공하며, 내부에는 아코디언을 사용하여 카테고리별로 공지사항을 나열합니다.
 * @param noticesGrouped - 카테고리별 그룹화된 공지사항 목록
 */
const PerformanceBookingNotice = ({
  noticesGrouped,
}: PerformanceBookingNoticeProps) => {
  return (
    <section className="text-sm performance-section p-detail-wrapper">
      <Dialog>
        {/* 다이얼로그 트리거: '예매 안내사항' 헤더 영역 */}
        <DialogTrigger asChild>
          <h3 className="text-lg font-semibold mb-2 py-1 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <BookCheck />
              예매 안내사항
            </div>

            <ChevronRight />
          </h3>
        </DialogTrigger>

        {/* 다이얼로그 상세 내용 */}
        <DialogContent className="max-w-[100dvw]! h-[100dvh]! sm:max-w-2xl! sm:h-auto! flex flex-col sm:grid">
          <DialogHeader>
            <DialogTitle className="text-xl">예매 안내사항</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          {/* 스크롤 가능한 공지사항 목록 영역 */}
          <ScrollArea className="sm:max-h-[90dvh] sm:h-[500px] pe-3">
            <Accordion
              type="multiple"
              className="my-0.5"
              defaultValue={[NoticeCategory.BOOKING_NOTICE]}
            >
              {noticesGrouped.map((notice) => (
                <AccordionItem key={notice.category} value={notice.category}>
                  {/* 카테고리별 아코디언 트리거: 매핑된 레이블 표시 */}
                  <AccordionTrigger className="hover:no-underline hover:cursor-pointer mx-2">
                    {
                      CATEGORY_OPTIONS.find(
                        (category) => category.value === notice.category,
                      )?.label
                    }
                  </AccordionTrigger>
                  {/* 카테고리별 상세 공지 내용 */}
                  <AccordionContent className="whitespace-pre-wrap leading-6 mx-2">
                    {notice.notices[0].content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PerformanceBookingNotice;
