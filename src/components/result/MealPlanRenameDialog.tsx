// 식단 이름을 바꾸는 모달입니다. ConfirmDialog 의 모달 모양과 BottomSheet 의 입력칸 모양을 같이 씁니다.
import "../common/ConfirmDialog.css";
import "../common/BottomSheet.css";
import "./MealPlanRenameDialog.css";
import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Button } from "../common/Button";

const MAX_LENGTH = 30;

interface MealPlanRenameDialogProps {
  title: string;
  // 실패하면 예외를 던진다. 모달은 열린 채로 오류를 보여준다
  onSave: (title: string) => Promise<void>;
  onClose: () => void;
}

export function MealPlanRenameDialog({ title, onSave, onClose }: MealPlanRenameDialogProps) {
  const titleId = useId();
  const inputId = useId();
  const errorId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(title);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const trimmed = draft.trim();
  const canSave = trimmed !== "" && !isSaving;

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const close = () => {
    if (!isSaving) onClose();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    if (trimmed === title) {
      onClose();
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSave(trimmed);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "이름을 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.");
      setIsSaving(false);
      inputRef.current?.focus();
    }
  };

  // Esc 로 닫고, Tab 은 모달 안에서만 돈다
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== "Tab" || dialogRef.current == null) return;
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>("input, button:not([disabled])"),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fpDialogBackdrop renameDialogBackdrop" onClick={close}>
      <div
        ref={dialogRef}
        className="fpDialog renameDialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 id={titleId}>식단 이름 변경</h2>
        <form className="renameDialogForm" onSubmit={(event) => void submit(event)}>
          <label className="srOnly" htmlFor={inputId}>
            식단 이름
          </label>
          <input
            ref={inputRef}
            id={inputId}
            className="sheetInput"
            type="text"
            value={draft}
            maxLength={MAX_LENGTH}
            enterKeyHint="done"
            autoComplete="off"
            readOnly={isSaving}
            aria-invalid={error !== "" || undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => setDraft(event.target.value)}
          />
          <p className="renameDialogCount" aria-hidden="true">
            {trimmed.length}/{MAX_LENGTH}
          </p>
          {error ? (
            <p id={errorId} className="sheetError" role="alert">
              {error}
            </p>
          ) : null}
          <div className="fpDialogActions">
            <Button type="button" variant="ghost" size="medium" disabled={isSaving} onClick={close}>
              취소
            </Button>
            <Button type="submit" size="medium" disabled={!canSave}>
              {isSaving ? "저장 중…" : "저장"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
