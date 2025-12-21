import type { CategoryInfo } from "./category.types";

/**
 * 카테고리 데이터
 */
export const categories: CategoryInfo[] = [
  {
    id: "timeSpecial",
    name: "타임특가",
    image: "timeSpecial.png",
    value: "timeSpecial",
  },
  { id: "musical", name: "뮤지컬", image: "musical.png", value: "musical" },
  { id: "concert", name: "콘서트", image: "concert.png", value: "concert" },
  { id: "theater", name: "극장", image: "theater.png", value: "theater" },
  { id: "showing", name: "전시/행사", image: "showing.png", value: "showing" },
  {
    id: "classic",
    name: "클래식/무용",
    image: "classic.png",
    value: "classic",
  },
  { id: "child", name: "아동/가족", image: "child.png", value: "child" },
];