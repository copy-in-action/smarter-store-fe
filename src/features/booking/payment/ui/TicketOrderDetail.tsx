import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useMemo } from "react";
import { Fragment } from "react/jsx-runtime";
import type { TicketDetail } from "@/entities/booking";
import type { PerformanceResponse } from "@/shared/api/orval/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { Skeleton } from "@/shared/ui/skeleton";

/**
 * 티켓 주문 상세 Props
 */
interface Props {
  /** 공연 정보 */
  performance: Pick<PerformanceResponse, "title" | "venue">;
  /** 티켓 상세 목록 */
  tickets: TicketDetail[];
  /** 공연 일시 (ISO 8601 형식) */
  showDateTime: string;
}

/**
 * 티켓 주문 상세 컴포넌트
 * 공연 정보와 선택한 좌석 정보를 표시합니다
 * @param props - 컴포넌트 Props
 * @param props.performance - 공연 정보
 * @param props.tickets - 티켓 상세 목록
 * @param props.showDateTime - 공연 일시
 * @returns 티켓 주문 상세 UI
 */
const TicketOrderDetail = ({ performance, tickets, showDateTime }: Props) => {
  const showDate = useMemo(() => {
    if (showDateTime)
      return format(new Date(showDateTime), "yyyy-MM-dd(E) hh:mm a", {
        locale: ko,
      })
        .replace("오전", "AM")
        .replace("오후", "PM");
  }, [showDateTime]);
  return (
    <section className="px-4">
      <Accordion type="single" collapsible defaultValue="ticket-detail">
        <AccordionItem value="ticket-detail">
          <AccordionTrigger>
            <h2 className="text-lg font-semibold">티켓 주문상세</h2>
          </AccordionTrigger>

          <AccordionContent>
            {/* 공연 정보 */}
            <div className="mb-9">
              <p className="text-base">{performance.title}</p>
              <div className="mt-1 text-xs text-gray-400">
                {showDate ? (
                  <span>
                    {showDate} ･ {performance.venue?.name}
                  </span>
                ) : (
                  <Skeleton className="inline-block w-40 h-4" />
                )}
              </div>
            </div>

            {/* 티켓 정보 */}
            <div>
              {tickets.map((ticket, index) => (
                <Fragment key={ticket.grade}>
                  <h3 className="text-lg font-semibold">
                    {ticket.grade}석{" "}
                    <span className="text-primary">{ticket.seatCount}</span>
                  </h3>
                  <div className="flex gap-5">
                    <span className="text-gray-500">좌석정보</span>
                    <p>
                      {ticket.seats.map((seat, index) => (
                        <Fragment key={`${seat.col}_${seat.row}`}>
                          {seat.section} {seat.row}행 {seat.col}열
                          {index !== ticket.seats.length - 1 && <br />}
                        </Fragment>
                      ))}
                    </p>
                  </div>
                  <div className="flex gap-5 mt-2">
                    <span className="text-gray-500">가격정보</span>
                    <p>
                      {ticket.priceInfo.map((price, index) => (
                        <Fragment key={price.discountName}>
                          {price.discountName}
                          <br />
                          {price.unitPrice.toLocaleString()}원 x{" "}
                          {price.quantity}매
                          {index !== ticket.seats.length - 1 && <br />}
                        </Fragment>
                      ))}
                    </p>
                  </div>
                  {tickets.length - 1 !== index && (
                    <hr className="my-6 border-gray-100 mx-2" />
                  )}
                </Fragment>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default TicketOrderDetail;
