import type { ShoppingCategory } from "../types/fitplate";

// 실제 쿠팡 파트너스 연동 전까지 사용할 임시 카테고리 URL입니다.
// 음식의 shoppingCategory 값으로 이 객체에서 구매 링크를 찾습니다.
export const SHOPPING_LINKS: Record<ShoppingCategory, string> = {
  chicken:
    "https://www.coupang.com/np/search?q=%EB%8B%AD%EA%B0%80%EC%8A%B4%EC%82%B4",
  rice: "https://www.coupang.com/np/search?q=%ED%98%84%EB%AF%B8%EB%B0%A5",
  vegetable:
    "https://www.coupang.com/np/search?q=%EC%83%90%EB%9F%AC%EB%93%9C%EC%B1%84%EC%86%8C",
  yogurt:
    "https://www.coupang.com/np/search?q=%EA%B7%B8%EB%A6%AD%EC%9A%94%EA%B1%B0%ED%8A%B8",
  oat: "https://www.coupang.com/np/search?q=%EC%98%A4%ED%8A%B8%EB%B0%80",
  fruit:
    "https://www.coupang.com/np/search?q=%EB%B0%94%EB%82%98%EB%82%98",
  egg: "https://www.coupang.com/np/search?q=%EA%B3%84%EB%9E%80",
  fish: "https://www.coupang.com/np/search?q=%EC%97%B0%EC%96%B4",
  sweetPotato:
    "https://www.coupang.com/np/search?q=%EA%B3%A0%EA%B5%AC%EB%A7%88",
  nuts: "https://www.coupang.com/np/search?q=%EA%B2%AC%EA%B3%BC%EB%A5%98",
};
