// 식단을 먹을 날짜를 정하거나 바꾸는 카드입니다. 날짜가 있어야 끼니마다 먹었는지 체크할 수 있습니다.
// 날짜가 정해진 식단은 「다른 날에도 먹기」로 같은 음식의 새 식단을 다른 날짜에 복사합니다.
import "./MealScheduleCard.css";
import { useState } from "react";
import { HttpError } from "../../api/httpClient";
import { Button } from "../common/Button";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { CalendarCheckIcon } from "../common/Icons";
import { addDays, formatDateLabel, todayString } from "../../utils/date";

interface MealScheduleCardProps {
  planDate: string | null;
  hasEatenMeal: boolean;
  defaultDate: string | null;
  onSchedule: (planDate: string | null, replace: boolean) => Promise<unknown>;
  onCopy: (planDate: string, replace: boolean) => Promise<unknown>;
  onError: (message: string) => void;
}

type Mode = "view" | "edit" | "copy";

export function MealScheduleCard({
  planDate,
  hasEatenMeal,
  defaultDate,
  onSchedule,
  onCopy,
  onError,
}: MealScheduleCardProps) {
  const today = todayString();
  // 기록 탭에서 다른 날짜를 고르고 왔는데 이 식단에 이미 날짜가 있으면 복사부터 보여준다
  const startsWithCopy = planDate != null && defaultDate != null && defaultDate !== planDate;
  const [mode, setMode] = useState<Mode>(startsWithCopy ? "copy" : "view");
  const [draftDate, setDraftDate] = useState(
    startsWithCopy ? defaultDate : (planDate ?? defaultDate ?? today),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [takenDate, setTakenDate] = useState<string | null>(null);

  const submit = async (date: string | null, replace: boolean) => {
    setIsSaving(true);
    try {
      if (mode === "copy" && date != null) {
        await onCopy(date, replace);
      } else {
        await onSchedule(date, replace);
      }
      setMode("view");
      setTakenDate(null);
    } catch (error) {
      if (error instanceof HttpError && error.code === "DATE_TAKEN" && date != null) {
        setTakenDate(date);
      } else {
        setTakenDate(null);
        onError(error instanceof Error ? error.message : "식단 날짜를 정하지 못했어요.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const startCopy = () => {
    if (planDate == null) return;
    setDraftDate(addDays(planDate < today ? today : planDate, 1));
    setMode("copy");
  };

  const showPicker = planDate == null || mode !== "view";
  const isFuture = planDate != null && planDate > today;
  const submitLabel =
    mode === "copy" ? "이 날짜에 복사하기" : planDate ? "날짜 바꾸기" : "이 날짜로 기록하기";

  return (
    <section className={`card scheduleCard${planDate ? " isScheduled" : ""}`} aria-label="식단 날짜">
      <div className="scheduleHead">
        <span className="scheduleIcon" aria-hidden="true">
          <CalendarCheckIcon />
        </span>
        <div className="scheduleText">
          {mode === "copy" ? (
            <>
              <strong>다른 날에도 이 식단을 먹을까요?</strong>
              <span>같은 음식으로 새 식단을 만들어 그날에 넣어요. 지금 식단은 그대로예요.</span>
            </>
          ) : planDate && mode === "view" ? (
            <>
              <strong>{planDate === today ? "오늘" : formatDateLabel(planDate)} 식단이에요</strong>
              <span>
                {isFuture ? "그날이 되면 먹은 끼니를 체크할 수 있어요." : "먹은 끼니를 체크하면 기록 탭에 쌓여요."}
              </span>
            </>
          ) : (
            <>
              <strong>이 식단을 언제 먹나요?</strong>
              <span>날짜를 정하면 끼니마다 먹었는지 체크할 수 있어요.</span>
            </>
          )}
        </div>
        {planDate && mode === "view" ? (
          <button
            type="button"
            className="textLink"
            disabled={hasEatenMeal}
            onClick={() => {
              setDraftDate(planDate);
              setMode("edit");
            }}
          >
            날짜 바꾸기
          </button>
        ) : null}
      </div>

      {planDate && mode === "view" && hasEatenMeal ? (
        <p className="scheduleNote">먹은 끼니가 있어 날짜를 바꿀 수 없어요.</p>
      ) : null}

      {planDate && mode === "view" ? (
        <Button variant="secondary" size="medium" block onClick={startCopy}>
          다른 날에도 먹기
        </Button>
      ) : null}

      {showPicker ? (
        <div className="schedulePicker">
          <input
            type="date"
            className="scheduleDateInput"
            value={draftDate}
            onChange={(event) => setDraftDate(event.target.value)}
            aria-label={mode === "copy" ? "복사할 날짜" : "식단 날짜"}
          />
          <Button size="medium" disabled={isSaving || !draftDate} onClick={() => void submit(draftDate, false)}>
            {isSaving ? "저장 중…" : submitLabel}
          </Button>
          {mode !== "view" ? (
            <div className="scheduleEditActions">
              <button type="button" className="textLink" onClick={() => setMode("view")}>
                취소
              </button>
              {mode === "edit" ? (
                <button
                  type="button"
                  className="textLink scheduleClear"
                  disabled={isSaving}
                  onClick={() => void submit(null, false)}
                >
                  날짜 지정 해제
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={takenDate != null}
        title={`${takenDate ? formatDateLabel(takenDate) : ""}에는 다른 식단이 있어요`}
        description={
          mode === "copy"
            ? "그날 식단 대신 이 식단을 복사할까요? 기존 식단은 날짜 지정만 풀리고 저장 식단에는 남아요."
            : "이 식단으로 바꿀까요? 기존 식단은 날짜 지정만 풀리고 저장 식단에는 남아요."
        }
        confirmLabel={mode === "copy" ? "이 식단으로 복사하기" : "이 식단으로 바꾸기"}
        confirmVariant="primary"
        onConfirm={() => void submit(takenDate, true)}
        onCancel={() => setTakenDate(null)}
      />
    </section>
  );
}
