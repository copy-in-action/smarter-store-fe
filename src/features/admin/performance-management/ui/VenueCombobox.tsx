"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import type { VenueResponse } from "@/shared/api/orval/types";
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
 * 공연장 Combobox 컴포넌트 속성
 */
interface VenueComboboxProps {
  /** 공연장 목록 */
  venues: VenueResponse[];
  /** 선택된 공연장 ID */
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
 * 검색 가능한 공연장 선택 Combobox 컴포넌트
 */
export function VenueCombobox({
  venues,
  value,
  onValueChange,
  disabled = false,
  loading = false,
  error = false,
  placeholder = "공연장을 검색하여 선택하세요",
}: VenueComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // 선택된 공연장 찾기
  const selectedVenue = venues.find((venue) => venue.id === value);

  // 검색 필터링
  const filteredVenues = venues.filter(
    (venue) =>
      venue.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      venue.address?.toLowerCase().includes(searchValue.toLowerCase()),
  );

  /**
   * 공연장 선택 핸들러
   * @param venueId - 선택된 공연장 ID
   */
  const handleSelect = (venueId: number) => {
    if (value === venueId) {
      // 같은 값이면 선택 해제
      onValueChange(undefined);
    } else {
      // 새로운 값 선택
      onValueChange(venueId);
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
            !selectedVenue && "text-muted-foreground",
          )}
          disabled={disabled || loading}
        >
          {loading ? (
            "공연장 목록 로딩 중..."
          ) : selectedVenue ? (
            <span className="truncate">
              {selectedVenue.name}
              {selectedVenue.address && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({selectedVenue.address})
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
            placeholder="공연장명이나 주소로 검색..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {venues.length === 0
                ? "등록된 공연장이 없습니다."
                : "검색 결과가 없습니다."}
            </CommandEmpty>
            <CommandGroup>
              {filteredVenues.map((venue) => (
                <CommandItem
                  key={venue.id}
                  value={venue.id.toString()}
                  onSelect={() => handleSelect(venue.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === venue.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate">{venue.name}</div>
                    {venue.address && (
                      <div className="text-sm text-muted-foreground truncate">
                        {venue.address}
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
