// 음식 이름·쇼핑 키워드로 구매 링크를 고릅니다. 제휴 링크 목록에 맞는 키워드가 있으면 그 링크, 없으면 쿠팡 검색 링크입니다.
import { AFFILIATE_LINKS, DEFAULT_AFFILIATE_URL } from "../data/affiliateLinks";
import type { AffiliateLink } from "../data/affiliateLinks";
import { SHOPPING_LINKS } from "../data/shoppingLinks";
import type { ShoppingCategory } from "../types/fitplate";

const normalize = (text: string) => text.replace(/\s+/g, "").toLowerCase();

// 「애호박」이 「호박」보다 먼저 맞도록 긴 이름부터 비교한다
const ALIASES = AFFILIATE_LINKS.flatMap((link) => link.aliases.map((alias) => ({ alias: normalize(alias), link })))
  .sort((a, b) => b.alias.length - a.alias.length);

export function findAffiliateLink(...texts: (string | undefined)[]): AffiliateLink | null {
  for (const text of texts) {
    if (!text) continue;
    const target = normalize(text);
    const hit = ALIASES.find(({ alias }) => target.includes(alias));
    if (hit) return hit.link;
  }
  return null;
}

export function getShoppingHref(
  shoppingCategory: ShoppingCategory,
  shoppingKeyword?: string,
  foodName?: string,
): string {
  const matched = findAffiliateLink(shoppingKeyword, foodName);
  if (matched?.url) return matched.url;
  if (matched == null && DEFAULT_AFFILIATE_URL) return DEFAULT_AFFILIATE_URL;

  const keyword = shoppingKeyword || foodName;
  if (keyword) {
    return `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`;
  }
  return SHOPPING_LINKS[shoppingCategory];
}
