"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { format, parse } from "date-fns";
import { ChevronDown, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import type { BookingStatus } from "@/entities/booking";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { ALL_STATUSES, STATUS_OPTIONS } from "../model/booking-status";
import { BookingFilter } from "./BookingFilter";

/** 페이지당 항목 수 */
const PAGE_SIZE = 10;

/**
 * DataTable 속성
 */
interface DataTableProps<TData, TValue> {
  /** 테이블 컬럼 정의 */
  columns: ColumnDef<TData, TValue>[];
  /** 테이블 데이터 */
  data: TData[];
  /** 검색 플레이스홀더 */
  searchPlaceholder?: string;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * searchParams에서 상태 배열 파싱
 * @param statusParam - 콤마로 구분된 상태 문자열
 * @returns 상태 배열
 */
function parseStatusParam(statusParam: string | null): BookingStatus[] {
  if (!statusParam) {
    return ALL_STATUSES;
  }
  const statuses = statusParam.split(",") as BookingStatus[];
  return statuses.filter((s) => ALL_STATUSES.includes(s));
}

/**
 * searchParams에서 날짜 범위 파싱
 * @param dateFrom - 시작일 문자열 (YYYY-MM-DD)
 * @param dateTo - 종료일 문자열 (YYYY-MM-DD)
 * @returns DateRange 객체
 */
function parseDateRangeParam(
  dateFrom: string | null,
  dateTo: string | null,
): DateRange | undefined {
  if (!dateFrom && !dateTo) {
    return undefined;
  }

  return {
    from: dateFrom ? parse(dateFrom, "yyyy-MM-dd", new Date()) : undefined,
    to: dateTo ? parse(dateTo, "yyyy-MM-dd", new Date()) : undefined,
  };
}

/**
 * 재사용 가능한 예매 내역 DataTable 컴포넌트
 * searchParams 기반 필터링 및 페이지네이션 지원
 */
export function BookingDataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "공연명 또는 예매번호로 검색",
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // searchParams에서 초기값 읽기
  const initialSearch = searchParams.get("search") ?? "";
  const initialStatuses = parseStatusParam(searchParams.get("status"));
  const initialDateRange = parseDateRangeParam(
    searchParams.get("dateFrom"),
    searchParams.get("dateTo"),
  );
  const initialPage = parseInt(searchParams.get("page") ?? "1", 10) - 1;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState(initialSearch);

  // 날짜 필터 상태
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange,
  );

  // 상태 필터 상태
  const [selectedStatuses, setSelectedStatuses] =
    useState<BookingStatus[]>(initialStatuses);

  /**
   * URL searchParams 업데이트
   * @param updates - 업데이트할 파라미터 객체
   */
  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  /**
   * 검색어 변경 핸들러 (디바운스 적용)
   */
  const debouncedSearchRef = useRef<NodeJS.Timeout>(null);
  const handleSearchChange = (value: string) => {
    setGlobalFilter(value);

    // 디바운스: 300ms 후 URL 업데이트
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
    }
    debouncedSearchRef.current = setTimeout(() => {
      updateSearchParams({ search: value || null, page: "1" });
    }, 300);
  };

  /**
   * 날짜 범위 변경 핸들러
   */
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    updateSearchParams({
      dateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : null,
      dateTo: range?.to ? format(range.to, "yyyy-MM-dd") : null,
      page: "1",
    });
  };

  /**
   * 상태 체크박스 토글 핸들러
   */
  const handleStatusToggle = (status: BookingStatus) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];

    setSelectedStatuses(newStatuses);

    // 모든 상태가 선택되면 status 파라미터 제거
    const statusParam =
      newStatuses.length === ALL_STATUSES.length ? null : newStatuses.join(",");

    updateSearchParams({ status: statusParam, page: "1" });
  };

  /**
   * 모든 상태 선택/해제 토글 핸들러
   */
  const handleSelectAllStatuses = () => {
    if (selectedStatuses.length === STATUS_OPTIONS.length) {
      setSelectedStatuses([]);
      updateSearchParams({ status: "", page: "1" });
    } else {
      setSelectedStatuses(ALL_STATUSES);
      updateSearchParams({ status: null, page: "1" });
    }
  };

  /**
   * 날짜 필터 초기화
   */
  const clearDateFilter = () => {
    setDateRange(undefined);
    updateSearchParams({ dateFrom: null, dateTo: null, page: "1" });
  };

  /**
   * 글로벌 필터링 함수: 공연명, 예매번호에서 검색
   */
  const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
    const search = filterValue.toLowerCase();
    const performanceTitle =
      row.getValue("performanceTitle")?.toString().toLowerCase() || "";
    const bookingNumber =
      row.getValue("bookingNumber")?.toString().toLowerCase() || "";

    return performanceTitle.includes(search) || bookingNumber.includes(search);
  };

  /**
   * 날짜 및 상태 필터 적용된 데이터
   */
  const filteredData = useMemo(() => {
    let result = data;

    // 날짜 필터 적용
    if (dateRange?.from || dateRange?.to) {
      result = result.filter((item: any) => {
        const showDateTime = new Date(item.showDateTime);
        if (dateRange.from && showDateTime < dateRange.from) {
          return false;
        }
        if (dateRange.to) {
          const endOfDay = new Date(dateRange.to);
          endOfDay.setHours(23, 59, 59, 999);
          if (showDateTime > endOfDay) {
            return false;
          }
        }
        return true;
      });
    }

    // 상태 필터 적용
    if (selectedStatuses.length > 0) {
      result = result.filter((item: any) =>
        selectedStatuses.includes(item.status),
      );
    }

    return result;
  }, [data, dateRange, selectedStatuses]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: globalFilterFn,
    initialState: {
      pagination: {
        pageIndex: initialPage >= 0 ? initialPage : 0,
        pageSize: PAGE_SIZE,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  /**
   * 페이지 변경 핸들러
   */
  const handlePageChange = (newPageIndex: number) => {
    table.setPageIndex(newPageIndex);
    updateSearchParams({ page: String(newPageIndex + 1) });
  };

  /** 현재 페이지 정보 */
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="">
      {/* 검색 및 필터 영역 */}
      <div className="space-y-4">
        <div className="flex md:items-center gap-2 flex-col md:flex-row">
          {/* 검색 바 */}
          <div className="flex sm:items-center flex-1 space-x-2 flex-col sm:flex-row gap-1.5 sm:gap-4">
            <InputGroup className="sm:max-w-sm">
              <InputGroupAddon>
                <Search className="w-4 h-4" />
              </InputGroupAddon>
              <InputGroupInput
                className="placeholder:text-sm"
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(event) => handleSearchChange(event.target.value)}
                disabled={isLoading}
              />
            </InputGroup>

            {/* 필터 영역 */}
            <BookingFilter
              dateRange={dateRange}
              setDateRange={handleDateRangeChange}
              selectedStatuses={selectedStatuses}
              handleStatusToggle={handleStatusToggle}
              handleSelectAllStatuses={handleSelectAllStatuses}
              clearDateFilter={clearDateFilter}
              isLoading={isLoading}
            />
          </div>

          {/* 컬럼 표시/숨김 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                표시항목 <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="border rounded-md mt-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  데이터를 불러오는 중...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  예매 내역이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 영역 */}
      <div className="flex items-center justify-between py-4 space-x-2">
        <div className="text-sm text-muted-foreground">
          총 {table.getFilteredRowModel().rows.length}개의 예매
          {totalPages > 1 && (
            <span className="ml-2">
              (페이지 {currentPage} / {totalPages})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handlePageChange(table.getState().pagination.pageIndex - 1)
            }
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            이전
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handlePageChange(table.getState().pagination.pageIndex + 1)
            }
            disabled={!table.getCanNextPage() || isLoading}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
