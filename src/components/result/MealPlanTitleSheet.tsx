// 식단 이름을 바꾸는 하단 시트입니다. 비워서 저장하거나 「자동 이름으로」를 누르면 음식으로 만든 이름으로 돌아갑니다.
import "../common/BottomSheet.css";
import { useState } from "react";
import { BottomSheet } from "../common/BottomSheet";
import { Button } from "../common/Button";

const MAX_LENGTH = 30;

interface MealPlanTitleSheetProps {
  title: string;
  customized: boolean;
  // null 이면 자동 이름으로 되돌린다
  onSave: (title: string | null) => Promise<void>;
  onClose: () => void;
}

export function MealPlanTitleSheet({ title, customized, onSave, onClose }: MealPlanTitleSheetProps) {
  const [draft, setDraft] = useState(customized ? title : "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (next: string | null) => {
    setIsSaving(true);
    setError("");
    try {
      await onSave(next);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "이름을 바꾸지 못했어요.");
      setIsSaving(false);
    }
  };

  const trimmed = draft.trim();

  return (
    <BottomSheet
      title="식단 이름"
      description="비워 두면 식단 음식으로 이름을 자동으로 만들어요."
      onClose={onClose}
      locked={isSaving}
    >
      <form
        className="sheetForm"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isSaving) void save(trimmed === "" ? null : trimmed);
        }}
      >
        <label className="sheetField">
          <span>
            이름 ({trimmed.length}/{MAX_LENGTH})
          </span>
          <input
            className="sheetInput"
            type="text"
            placeholder={customized ? "" : title}
            value={draft}
            maxLength={MAX_LENGTH}
            onChange={(event) => setDraft(event.target.value)}
            autoFocus
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
            disabled={isSaving || !customized}
            onClick={() => void save(null)}
          >
            자동 이름으로
          </Button>
          <Button type="submit" size="medium" disabled={isSaving}>
            {isSaving ? "저장 중…" : "저장"}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
