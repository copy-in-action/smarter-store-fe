/**
 * 좌석 등급별 가격 정보를 표시하는 Popover 컴포넌트
 */

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

/**
 * SeatGradePricePopover Props
 */
interface Props {
  /** 좌석 등급별 가격 정보 배열 */
  seatGradeInfo: {
    /** 등급 라벨 */
    label: string;
    /** 가격 (원) */
    price: number;
  }[];
}

/**
 * 좌석 등급별 가격 정보를 표시하는 Popover 컴포넌트
 * @param seatGradeInfo - 좌석 등급별 가격 정보 배열
 * @returns Popover 컴포넌트
 */
const SeatGradePricePopover = ({ seatGradeInfo }: Props) => {
  return (
    <Popover>
      <PopoverTrigger className="px-3 py-1 text-sm text-gray-400 border shadow rounded-4xl">
        등급 별 가격
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-auto">
        {seatGradeInfo.map((info) => (
          <div
            key={info.label}
            className="pb-2 mb-2 text-sm border-b last:border-b-0 last:mb-0 last:pb-0"
          >
            <span>{info.label}석</span>
            <br />
            <span className="font-semibold">
              {info.price.toLocaleString()}원
            </span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default SeatGradePricePopover;
