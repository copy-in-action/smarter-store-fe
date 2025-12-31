/**
 * 사용자가 선택한 좌석 목록과 총 금액을 표시하는 컴포넌트
 */
"use client";

import { X } from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/shared/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/shared/ui/item";
import type { UserSelectedSeat } from "../model/booking-seating-chart.types";

/**
 * SelectSeatInfo Props
 */
type SelectSeatInfoProps = {
  /** 사용자가 선택한 좌석 배열 */
  userSelectedSeats: UserSelectedSeat[];
  /** 전체 선택 해제 핸들러 */
  onClearSelection: () => void;
  /** 개별 좌석 선택/해제 토글 핸들러 */
  onToggleSeatSelection: (
    /** 행 번호 */ row: number,
    /** 열 번호 */ col: number,
  ) => void;
};

/**
 * 선택한 좌석 정보를 표시하는 컴포넌트
 * @param userSelectedSeats - 사용자가 선택한 좌석 배열
 * @param onClearSelection - 전체 선택 해제 핸들러
 * @param onToggleSeatSelection - 개별 좌석 선택/해제 토글 핸들러
 * @returns 선택 좌석 정보 컴포넌트
 */
const SelectSeatInfo = ({
  userSelectedSeats,
  onClearSelection,
  onToggleSeatSelection,
}: SelectSeatInfoProps) => {
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div className="mt-4 mb-2 text-lg font-semibold">
          선택좌석
          <span className="text-blue-500 ms-3">{userSelectedSeats.length}</span>
        </div>
        <Button
          variant={"ghost"}
          className="text-gray-400"
          onClick={onClearSelection}
        >
          전체삭제
        </Button>
      </div>

      <div className="flex flex-col w-full gap-2">
        {userSelectedSeats.map((seat, index) => (
          <Fragment key={`${seat.row}-${seat.col}`}>
            <Item variant="default" size="sm">
              <ItemContent>
                <ItemTitle className="font-bold">{seat.grade}석</ItemTitle>
                <ItemDescription className="text-sm">
                  {seat.row + 1}열 {seat.col + 1}번
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <span className="font-bold">
                  {seat.price.toLocaleString()}원
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1!"
                  onClick={() => onToggleSeatSelection(seat.row, seat.col)}
                >
                  <X className="text-gray-400" />
                </Button>
              </ItemActions>
            </Item>
            {index < userSelectedSeats.length - 1 && <hr />}
          </Fragment>
        ))}
      </div>

      <Button className="mt-auto" disabled={userSelectedSeats.length === 0}>
        선택완료
      </Button>
    </div>
  );
};

export default SelectSeatInfo;
