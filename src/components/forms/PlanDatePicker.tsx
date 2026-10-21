// 새 식단을 먹을 날짜를 고르는 칩 묶음입니다. 오늘·내일·다른 날·나중에 중에서 고르고, 그날 식단이 이미 있으면 알려줍니다.
import "./PlanDatePicker.css";
import "../result/MealScheduleCard.css";
import { useState } from "react";
import { addDays, formatDateLabel, todayString } from "../../utils/date";

type Choice = "today" | "tomorrow" | "other" | "later";

interface PlanDatePickerProps {
  // null 이면 「나중에」(날짜 없이 저장)
  planDate: string | null;
  takenDates: ReadonlySet<string>;
  onChange: (planDate: string | null) => void;
}

function choiceOf(planDate: string | null, today: string): Choice {
  if (planDate == null) return "later";
  if (planDate === today) return "today";
  if (planDate === addDays(today, 1)) return "tomorrow";
  return "other";
}

export function PlanDatePicker({ planDate, takenDates, onChange }: PlanDatePickerProps) {
  const today = todayString();
  const tomorrow = addDays(today, 1);
  // 「다른 날」을 눌렀으면 오늘·내일을 골라도 날짜 칸을 계속 보여준다
  const [otherOpen, setOtherOpen] = useState(choiceOf(planDate, today) === "other");
  const choice = otherOpen ? "other" : choiceOf(planDate, today);

  const chips: { key: Choice; label: string; date: string | null }[] = [
    { key: "today", label: "오늘", date: today },
    { key: "tomorrow", label: "내일", date: tomorrow },
    { key: "other", label: "다른 날", date: null },
    { key: "later", label: "나중에", date: null },
  ];

  const select = (key: Choice) => {
    setOtherOpen(key === "other");
    if (key === "today") onChange(today);
    if (key === "tomorrow") onChange(tomorrow);
    if (key === "later") onChange(null);
    if (key === "other" && (planDate == null || planDate === today || planDate === tomorrow)) {
      onChange(addDays(today, 2));
    }
  };

  const taken = planDate != null && takenDates.has(planDate);

  return (
    <section className="planDatePick" aria-label="먹을 날짜">
      <div className="planDatePickHead">
        <strong>언제 먹을 식단인가요?</strong>
        <span>
          {planDate == null
            ? "날짜 없이 저장하고 나중에 정해요."
            : `${planDate === today ? "오늘" : formatDateLabel(planDate)} 식단으로 바로 기록해요.`}
        </span>
      </div>
      <div className="planDateChips" role="radiogroup" aria-label="먹을 날짜">
        {chips.map((chip) => {
          const selected = choice === chip.key;
          const chipTaken = chip.date != null && takenDates.has(chip.date);
          return (
            <button
              key={chip.key}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`planDateChip${selected ? " isSelected" : ""}`}
              onClick={() => select(chip.key)}
            >
              {chip.label}
              {chipTaken ? <span className="planDateDot" aria-label="식단 있음" /> : null}
            </button>
          );
        })}
      </div>
      {choice === "other" ? (
        <input
          type="date"
          className="scheduleDateInput"
          value={planDate ?? ""}
          onChange={(event) => onChange(event.target.value || null)}
          aria-label="먹을 날짜"
        />
      ) : null}
      {taken ? (
        <p className="planDateTaken" role="status">
          그날은 이미 식단이 있어요. 만들면 새 식단으로 바뀌고, 기존 식단은 저장 식단에 남아요.
        </p>
      ) : null}
    </section>
  );
}
