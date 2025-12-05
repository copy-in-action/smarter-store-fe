import { Search } from "lucide-react";
import { Input } from "@/shared/ui/input";

/**
 * 검색 입력 컴포넌트
 */
export function SearchInput() {
  return (
    <div className="relative flex items-center h-full">
      <Search className="absolute start-5 size-4 text-muted-foreground" />
      <Input
        placeholder="어디로 떠나볼까요 ?"
        className="h-full py-0 border-blue-600 rounded-full ps-10 pe-5 placeholder:text-sm sm:bg-gray-100 sm:border-transparent sm:placeholder:text-lg"
        type="search"
      />
    </div>
  );
}
