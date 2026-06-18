// 음식 카테고리와 키워드를 받아 쿠팡 검색 URL을 반환하는 유틸입니다.
import { SHOPPING_LINKS } from "../data/shoppingLinks";
import type { ShoppingCategory } from "../types/fitplate";

export function getShoppingHref(
  shoppingCategory: ShoppingCategory,
  shoppingKeyword?: string,
): string {
  if (shoppingKeyword != null) {
    return `https://www.coupang.com/np/search?q=${encodeURIComponent(shoppingKeyword)}`;
  }
  return SHOPPING_LINKS[shoppingCategory];
}
