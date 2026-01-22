"use client";

//TODO: 페이지 네이션 필요

import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import type { VenueResponse } from "@/entities/venue";
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
 * 공연장 목록 테이블 컴포넌트 속성
 */
interface VenueListTableProps {
  /** 공연장 목록 데이터 */
  venues: VenueResponse[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 상태 */
  error?: string | null;
  /** 수정 버튼 클릭 핸들러 */
  onEdit?: (venue: VenueResponse) => void;
  /** 삭제 버튼 클릭 핸들러 */
  onDelete?: (venue: VenueResponse) => void;
  /** 상세보기 버튼 클릭 핸들러 */
  onView?: (venue: VenueResponse) => void;
}

/**
 * 관리자용 공연장 목록 테이블 컴포넌트
 */
export function VenueListTable({
  venues,
  isLoading = false,
  error,
  onEdit,
  onDelete,
  onView,
}: VenueListTableProps) {
  const [selectedVenues, setSelectedVenues] = useState<number[]>([]);

  /**
   * 날짜를 한국 시간 형식으로 포맷팅
   * @param dateString - ISO 날짜 문자열
   * @returns 포맷팅된 날짜 문자열
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  /**
   * 로딩 상태일 때 스켈레톤 행 렌더링
   */
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>공연장명</TableHead>
              <TableHead>주소</TableHead>
              <TableHead>좌석 배치도</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead className="w-[100px]">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index.toString()}>
                <TableCell>
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  /**
   * 에러 상태일 때 에러 메시지 렌더링
   */
  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
        <p className="text-sm text-red-500 mt-1">{error}</p>
      </div>
    );
  }

  /**
   * 빈 데이터일 때 빈 상태 렌더링
   */
  if (!venues.length) {
    return (
      <div className="rounded-md border bg-gray-50 p-8 text-center">
        <p className="text-gray-600">등록된 공연장이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead>공연장명</TableHead>
            <TableHead>주소</TableHead>

            <TableHead>생성일</TableHead>
            <TableHead className="w-[100px]">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues.map((venue) => (
            <TableRow key={venue.id}>
              <TableCell
                className="font-medium cursor-pointer"
                onClick={() => onView?.(venue)}
              >
                {venue.id}
              </TableCell>
              <TableCell className="font-medium">{venue.name}</TableCell>
              <TableCell>
                <span
                  className="max-w-[410px] truncate block"
                  title={venue.address}
                >
                  {venue.address || "-"}
                </span>
              </TableCell>

              <TableCell className="text-sm text-gray-600 tracking-tighter">
                {formatDate(venue.createdAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">메뉴 열기</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onView?.(venue)}
                      className="cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      상세보기
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEdit?.(venue)}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(venue)}
                      className="cursor-pointer text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
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
