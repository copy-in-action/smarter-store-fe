"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import type { Company } from "@/entities/company";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

/**
 * 판매자 테이블 액션 속성
 */
interface CompanyActionsProps {
  /** 판매자 데이터 */
  company: Company;
  /** 상세보기 핸들러 */
  onView?: (company: Company) => void;
  /** 수정 핸들러 */
  onEdit?: (company: Company) => void;
  /** 삭제 핸들러 */
  onDelete?: (company: Company) => void;
}

/**
 * 판매자 테이블 액션 컴포넌트
 */
function CompanyActions({
  company,
  onView,
  onEdit,
  onDelete,
}: CompanyActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0">
          <span className="sr-only">메뉴 열기</span>
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>작업</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onView && (
          <DropdownMenuItem onClick={() => onView(company)}>
            <Eye className="w-4 h-4 mr-2" />
            상세보기
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(company)}>
            <Edit className="w-4 h-4 mr-2" />
            수정
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={() => onDelete(company)}
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            삭제
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * 판매자 테이블 컬럼 생성 함수
 * @param actions - 액션 핸들러들
 * @returns 판매자 테이블 컬럼 정의
 */
export function createCompanyColumns(actions?: {
  onView?: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
}): ColumnDef<Company>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono">
          #{row.getValue("id")}
        </Badge>
      ),
    },
    {
      accessorKey: "name",
      header: "상호",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "ceoName",
      header: "대표자명",
      cell: ({ row }) => {
        const ceoName = row.getValue("ceoName") as string;
        return ceoName ? (
          <div>{ceoName}</div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "businessNumber",
      header: "사업자번호",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue("businessNumber")}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "이메일",
      cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return email ? (
          <div className="text-sm">{email}</div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "contact",
      header: "연락처",
      cell: ({ row }) => {
        const contact = row.getValue("contact") as string;
        return contact ? (
          <div className="text-sm">{contact}</div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "address",
      header: "주소",
      cell: ({ row }) => {
        const address = row.getValue("address") as string;
        return address ? (
          <div className="text-sm max-w-[200px] truncate" title={address}>
            {address}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: "performanceInquiry",
      header: "공연 문의",
      cell: ({ row }) => {
        const inquiry = row.getValue("performanceInquiry") as string;
        return inquiry ? (
          <div className="text-sm max-w-[150px] truncate" title={inquiry}>
            {inquiry}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      id: "actions",
      header: "작업",
      cell: ({ row }) => <CompanyActions company={row.original} {...actions} />,
    },
  ];
}
