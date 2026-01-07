"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { CouponResponse } from "@/entities/coupon";
import { PAGES } from "@/shared/constants";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

/**
 * 쿠폰 DataTable Props
 */
interface CouponDataTableProps {
  /** 쿠폰 목록 데이터 */
  data: CouponResponse[];
  /** 비활성화 핸들러 */
  onDeactivate?: (id: number) => void;
}

/**
 * 쿠폰 DataTable 컴포넌트
 * Row 클릭 시 상세 페이지로 이동
 * @param data - 쿠폰 목록
 * @param onDeactivate - 비활성화 핸들러
 */
export function CouponDataTable({ data, onDeactivate }: CouponDataTableProps) {
  const router = useRouter();

  /**
   * Row 클릭 핸들러 - 상세 페이지로 이동
   * @param id - 쿠폰 ID
   */
  const handleRowClick = (id: number) => {
    router.push(PAGES.ADMIN.COUPON.DETAIL.path(id));
  };

  const dateFormat = useCallback((date: string) => {
    return format(date, "yyyy-MM-dd H:mm");
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>쿠폰명</TableHead>
          <TableHead>할인율</TableHead>
          <TableHead>유효 기간</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="text-right">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((coupon) => (
          <TableRow
            key={coupon.id}
            onClick={() => handleRowClick(coupon.id)}
            className="cursor-pointer hover:bg-muted/50"
          >
            <TableCell>{coupon.id}</TableCell>
            <TableCell>{coupon.name}</TableCell>
            <TableCell>{coupon.discountRate}%</TableCell>
            <TableCell>
              {dateFormat(coupon.validFrom)} ~ {dateFormat(coupon.validUntil)}
            </TableCell>
            <TableCell>
              <Badge variant={coupon.isActive ? "default" : "secondary"}>
                {coupon.isActive ? "활성" : "비활성"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {onDeactivate && coupon.isActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeactivate(coupon.id);
                  }}
                >
                  비활성화
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
