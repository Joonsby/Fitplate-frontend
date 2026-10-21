// 한 주(월~일)의 날짜를 고르고, 날짜마다 기록 상태를 점으로 보여줍니다.
import "./WeekStrip.css";
import type { DailyRecord } from "../../api/mealIntakeApi";
import { ChevronLeftIcon, ChevronRightIcon } from "../common/Icons";
import { addDays, parseDateString, todayString, weekdayLabel } from "../../utils/date";

interface WeekStripProps {
  weekStart: string;
  selectedDate: string;
  records: DailyRecord[];
  onSelect: (date: string) => void;
  onMoveWeek: (offset: number) => void;
}

const STATUS_LABELS: Record<DailyRecord["status"], string> = {
  NO_PLAN: "식단 없음",
  UPCOMING: "예정",
  NOT_RECORDED: "체크 전",
  PARTIAL: "일부 먹음",
  COMPLETE: "다 먹음",
};

export function WeekStrip({ weekStart, selectedDate, records, onSelect, onMoveWeek }: WeekStripProps) {
  const today = todayString();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const start = parseDateString(weekStart);
  const statusByDate = new Map(records.map((record) => [record.date, record.status]));

  return (
    <div className="card weekStrip">
      <div className="weekStripHead">
        <button type="button" className="weekStripNav" aria-label="지난주" onClick={() => onMoveWeek(-7)}>
          <ChevronLeftIcon />
        </button>
        <strong>
          {start.getFullYear()}년 {start.getMonth() + 1}월
        </strong>
        <button type="button" className="weekStripNav" aria-label="다음주" onClick={() => onMoveWeek(7)}>
          <ChevronRightIcon />
        </button>
      </div>
      <div className="weekStripDays" role="radiogroup" aria-label="날짜">
        {days.map((date) => {
          const status = statusByDate.get(date);
          const selected = date === selectedDate;
          return (
            <button
              key={date}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${parseDateString(date).getMonth() + 1}월 ${parseDateString(date).getDate()}일 ${status ? STATUS_LABELS[status] : ""}`}
              className={`weekDay${selected ? " isSelected" : ""}${date === today ? " isToday" : ""}`}
              onClick={() => onSelect(date)}
            >
              <span className="weekDayName">{weekdayLabel(date)}</span>
              <span className="weekDayNumber">{parseDateString(date).getDate()}</span>
              <span className={`weekDayDot weekDayDot--${status ?? "NO_PLAN"}`} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
