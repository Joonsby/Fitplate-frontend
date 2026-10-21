// 저장 식단을 먹을 날짜를 바로 정하는 하단 시트입니다. 그날 다른 식단이 있으면 바꿀지 한 번 더 묻습니다.
import "../common/BottomSheet.css";
import "./MealScheduleCard.css";
import { useState } from "react";
import { HttpError } from "../../api/httpClient";
import { BottomSheet } from "../common/BottomSheet";
import { Button } from "../common/Button";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { formatDateLabel, todayString } from "../../utils/date";

interface PlanDateSheetProps {
  planTitle: string;
  // 그날 다른 식단이 있으면 HttpError(code=DATE_TAKEN) 를 던진다
  onSchedule: (planDate: string, replace: boolean) => Promise<unknown>;
  onDone: (planDate: string) => void;
  onClose: () => void;
}

export function PlanDateSheet({
  planTitle,
  onSchedule,
  onDone,
  onClose,
}: PlanDateSheetProps) {
  const [draftDate, setDraftDate] = useState(todayString());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [takenDate, setTakenDate] = useState<string | null>(null);

  const submit = async (date: string, replace: boolean) => {
    setIsSaving(true);
    setError("");
    setTakenDate(null);
    try {
      await onSchedule(date, replace);
      onDone(date);
      onClose();
    } catch (e) {
      if (e instanceof HttpError && e.code === "DATE_TAKEN" && !replace) {
        setTakenDate(date);
      } else {
        setError(
          e instanceof Error ? e.message : "식단 날짜를 정하지 못했어요.",
        );
      }
      setIsSaving(false);
    }
  };

  return (
    <>
      <BottomSheet
        title="먹을 날짜 정하기"
        description={planTitle}
        onClose={onClose}
        locked={isSaving || takenDate != null}
      >
        <label className="sheetField">
          <span>날짜</span>
          <input
            type="date"
            className="scheduleDateInput"
            value={draftDate}
            onChange={(event) => setDraftDate(event.target.value)}
            aria-label="먹을 날짜"
          />
        </label>
        {error ? (
          <p className="sheetError" role="alert">
            {error}
          </p>
        ) : null}
        <div className="sheetActions">
          <Button
            variant="ghost"
            size="medium"
            disabled={isSaving}
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            size="medium"
            disabled={isSaving || !draftDate}
            onClick={() => void submit(draftDate, false)}
          >
            {isSaving ? "저장 중…" : "저장"}
          </Button>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={takenDate != null}
        title={`${takenDate ? formatDateLabel(takenDate) : ""}에는 다른 식단이 있어요`}
        description="이 식단으로 바꿀까요? 기존 식단은 날짜 지정만 풀리고 저장 식단에는 남아요."
        confirmLabel="이 식단으로 바꾸기"
        confirmVariant="primary"
        onConfirm={() => {
          if (takenDate) void submit(takenDate, true);
        }}
        onCancel={() => setTakenDate(null)}
      />
    </>
  );
}
