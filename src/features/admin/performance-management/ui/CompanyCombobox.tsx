"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import type { Company } from "@/entities/company";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

/**
 * 판매자 Combobox 컴포넌트 속성
 */
interface CompanyComboboxProps {
  /** 판매자 목록 */
  companies: Company[];
  /** 선택된 판매자 ID */
  value?: number;
  /** 값 변경 핸들러 */
  onValueChange: (value: number | undefined) => void;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 에러 상태 */
  error?: boolean;
  /** placeholder 텍스트 */
  placeholder?: string;
}

/**
 * 검색 가능한 판매자 선택 Combobox 컴포넌트
 */
export function CompanyCombobox({
  companies,
  value,
  onValueChange,
  disabled = false,
  loading = false,
  error = false,
  placeholder = "판매자를 검색하여 선택하세요",
}: CompanyComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // 선택된 판매자 찾기
  const selectedCompany = companies.find((company) => company.id === value);

  // 검색 필터링
  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      company.businessNumber?.toLowerCase().includes(searchValue.toLowerCase()),
  );

  /**
   * 판매자 선택 핸들러
   * @param companyId - 선택된 판매자 ID
   */
  const handleSelect = (companyId: number) => {
    if (value === companyId) {
      // 같은 값이면 선택 해제
      onValueChange(undefined);
    } else {
      // 새로운 값 선택
      onValueChange(companyId);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            error && "border-red-500",
            !selectedCompany && "text-muted-foreground",
          )}
          disabled={disabled || loading}
        >
          {loading ? (
            "판매자 목록 로딩 중..."
          ) : selectedCompany ? (
            <span className="truncate">
              {selectedCompany.name}
              {selectedCompany.businessNumber && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({selectedCompany.businessNumber})
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="판매자명이나 사업자번호로 검색..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {companies.length === 0
                ? "등록된 판매자가 없습니다."
                : "검색 결과가 없습니다."}
            </CommandEmpty>
            <CommandGroup>
              {filteredCompanies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.id.toString()}
                  onSelect={() => handleSelect(company.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === company.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate">{company.name}</div>
                    {company.businessNumber && (
                      <div className="text-sm text-muted-foreground truncate">
                        사업자번호: {company.businessNumber}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
