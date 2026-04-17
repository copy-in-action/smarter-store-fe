"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import {
  addRecentSearch,
  SearchAutocomplete,
} from "@/features/service/performance-search";
import { useDebounce } from "@/shared/lib/hooks/useDebounce";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/ui/input-group";

/**
 * 검색 입력 컴포넌트 Props
 */
interface SearchInputProps {
  /** InputGroupInput 컴포넌트에 전달할 className */
  inputClassName?: string;
}

/**
 * 검색 입력 컴포넌트
 * 검색창과 자동완성 기능을 제공합니다
 */
export function SearchInput({ inputClassName }: SearchInputProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const itemCountRef = useRef(0);

  // 디바운싱 적용 (300ms)
  const debouncedQuery = useDebounce(searchQuery, 300);

  /**
   * 자동완성 아이템 개수 변경 핸들러
   * @param count - 현재 표시 중인 아이템 수
   */
  const handleItemCountChange = useCallback((count: number) => {
    itemCountRef.current = count;
  }, []);

  /**
   * 검색 실행 핸들러
   * @param keyword - 검색할 키워드
   */
  const handleSearch = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    addRecentSearch(trimmedKeyword);
    setIsOpen(false);
    setSearchQuery(trimmedKeyword);

    router.push(`/search?q=${encodeURIComponent(trimmedKeyword)}`);
  };

  /**
   * 키보드 네비게이션 핸들러
   * - ArrowDown/Up: 자동완성 항목 이동 (-1: 선택 없음)
   * - Enter: 선택된 항목 클릭 또는 검색 실행
   * - Escape: 팝업 닫기
   * @param e - 키보드 이벤트
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 등 IME 조합 중에는 키 입력 무시
    if (e.nativeEvent.isComposing) return;

    switch (e.key) {
      case "ArrowDown":
        // 팝업이 열려있을 때만 항목 이동
        if (isOpen && itemCountRef.current > 0) {
          e.preventDefault();
          setSelectedIndex((prev) => {
            // 선택 없음(-1)이면 첫 번째 항목(0)으로
            if (prev === -1) return 0;
            // 마지막 항목이 아니면 다음 항목으로
            return prev < itemCountRef.current - 1 ? prev + 1 : prev;
          });
        }
        break;
      case "ArrowUp":
        // 팝업이 열려있을 때만 항목 이동
        if (isOpen && itemCountRef.current > 0) {
          e.preventDefault();
          setSelectedIndex((prev) => {
            // 첫 번째 항목(0)이면 선택 해제(-1), 이미 해제(-1) 이면 유지
            if (prev === 0 || prev === -1) return -1;
            // 그 외에는 이전 항목으로
            return prev - 1;
          });
        }
        break;
      case "Enter":
        e.preventDefault();
        // 항목이 선택되어 있으면 해당 항목 클릭, 아니면 검색 실행
        if (isOpen && selectedIndex >= 0 && itemCountRef.current > 0) {
          const activeItem = document.querySelector<HTMLElement>(
            `[data-autocomplete-index="${selectedIndex}"]`,
          );
          activeItem?.click();
        } else {
          handleSearch(searchQuery);
        }
        break;
      case "Escape":
        // 팝업 닫기
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  /**
   * 검색어 전체 삭제 핸들러
   */
  const handleClear = () => {
    setSearchQuery("");
  };

  /**
   * Input 포커스 핸들러
   * Popover 열기
   */
  const handleFocus = () => {
    setIsOpen(true);
  };

  /**
   * 공연 클릭 핸들러 (자동완성에서 공연 선택 시)
   */
  const handlePerformanceClick = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  /**
   * Popover 상태 변경 핸들러
   */
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedIndex(-1);
    }
  };

  /**
   * 외부 상호작용 핸들러
   * 검색창(InputGroup) 내부 클릭은 팝업을 닫지 않음
   * @param event - 상호작용 이벤트
   */
  const handleInteractOutside = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    // InputGroup 내부 클릭은 무시 (팝업 유지)
    if (target.closest('[data-slot="input-group-control"]')) {
      event.preventDefault();
    }
  }, []);

  return (
    <SearchAutocomplete
      keyword={debouncedQuery}
      open={isOpen}
      onOpenChange={handleOpenChange}
      onSearchClick={handleSearch}
      onPerformanceClick={handlePerformanceClick}
      selectedIndex={selectedIndex}
      onItemCountChange={handleItemCountChange}
      onInteractOutside={handleInteractOutside}
    >
      <InputGroup className="h-full border-blue-600 rounded-full sm:bg-gray-100 sm:border-transparent">
        <InputGroupAddon align="inline-start">
          <Search className="size-4" aria-label="검색 아이콘" />
        </InputGroupAddon>
        <InputGroupInput
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedIndex(-1);
            // 검색어가 있으면 팝업 열기 (ESC로 닫았다가 다시 입력하는 경우 대응)
            if (e.target.value) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="어디로 떠나볼까요 ?"
          className={inputClassName ?? "placeholder:text-sm"}
          type="text"
        />
        {searchQuery && (
          <InputGroupAddon align="inline-end" className="py-0">
            <InputGroupButton size="icon-sm" onClick={handleClear}>
              <X className="size-4" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </SearchAutocomplete>
  );
}
