// 기기 시간 기준의 YYYY-MM-DD 날짜 문자열을 다루는 함수 모음
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayString(): string {
  return toDateString(new Date());
}

export function parseDateString(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(value: string, days: number): string {
  const date = parseDateString(value);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

// 그 날짜가 속한 주의 월요일
export function startOfWeek(value: string): string {
  const date = parseDateString(value);
  const offset = (date.getDay() + 6) % 7;
  return addDays(value, -offset);
}

export function weekdayLabel(value: string): string {
  return WEEKDAYS[parseDateString(value).getDay()];
}

// 「10월 21일 (화)」
export function formatDateLabel(value: string): string {
  const date = parseDateString(value);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdayLabel(value)})`;
}

// 「10.21」
export function formatShortDate(value: string): string {
  const date = parseDateString(value);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

// 오늘부터 식단이 비어 있는 가장 가까운 날. 60일 안에 없으면 오늘
export function firstFreeDate(takenDates: ReadonlySet<string>): string {
  const today = todayString();
  for (let offset = 0; offset < 60; offset++) {
    const date = addDays(today, offset);
    if (!takenDates.has(date)) return date;
  }
  return today;
}
