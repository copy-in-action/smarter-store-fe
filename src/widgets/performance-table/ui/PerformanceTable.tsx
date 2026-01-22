"use client";

/**
 * 공연 목록 테이블 위젯
 */

import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import type { PerformanceResponse } from "@/shared/api/orval/types";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

/**
 * 공연 테이블 컴포넌트 속성
 */
interface PerformanceTableProps {
  /** 공연 목록 데이터 */
  performances: PerformanceResponse[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 수정 버튼 클릭 핸들러 */
  onEdit?: (performance: PerformanceResponse) => void;
  /** 삭제 버튼 클릭 핸들러 */
  onDelete?: (performance: PerformanceResponse) => void;
  /** 상세 보기 버튼 클릭 핸들러 */
  onView?: (performance: PerformanceResponse) => void;
}

/**
 * 날짜를 포맷팅하는 함수
 * @param dateString - ISO 날짜 문자열
 * @returns 포맷된 날짜 문자열
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * 공연 상태 배지 컴포넌트
 * @param visible - 노출 여부
 */
const StatusBadge = ({ visible }: { visible: boolean }) => {
  return (
    <Badge
      variant={visible ? "default" : "secondary"}
      className={cn(
        visible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800",
      )}
    >
      {visible ? "노출" : "비노출"}
    </Badge>
  );
};

/**
 * 공연 목록을 테이블 형태로 표시하는 위젯 컴포넌트
 */
export function PerformanceTable({
  performances,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
}: PerformanceTableProps) {
  if (isLoading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>공연명</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>공연장</TableHead>
              <TableHead>기간</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="w-[50px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index.toString()}>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (performances.length === 0) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>공연명</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>공연장</TableHead>
              <TableHead>기간</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="w-[50px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                등록된 공연이 없습니다.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>공연명</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>공연장</TableHead>
            <TableHead>기간</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="w-[50px]">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {performances.map((performance) => (
            <TableRow key={performance.id}>
              <TableCell
                className="font-semibold"
                onClick={() => onView?.(performance)}
              >
                {performance.title}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{performance.category}</Badge>
              </TableCell>
              <TableCell>
                {performance.venue ? performance.venue.name : "미지정"}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{formatDate(performance.startDate)}</div>
                  <div className="text-gray-500">
                    ~ {formatDate(performance.endDate)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge visible={performance.visible} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">작업 메뉴 열기</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(performance)}>
                        <Eye className="mr-2 h-4 w-4" />
                        상세보기
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(performance)}>
                        <Edit className="mr-2 h-4 w-4" />
                        수정
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(performance)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
