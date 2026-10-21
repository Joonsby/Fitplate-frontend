// 글자 하나를 입력받아 저장하는 공용 하단 시트입니다. 비어 있거나 공백뿐이면 저장할 수 없고, 저장에 실패하면 시트를 연 채 오류를 보여줍니다.
import "./BottomSheet.css";
import { useEffect, useId, useRef, useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";

interface TextInputSheetProps {
  title: string;
  label: string;
  initialValue: string;
  maxLength: number;
  placeholder?: string;
  // 실패하면 예외를 던진다. 성공하면 시트가 닫힌다
  onSave: (value: string) => Promise<void>;
  onClose: () => void;
}

export function TextInputSheet({
  title,
  label,
  initialValue,
  maxLength,
  placeholder,
  onSave,
  onClose,
}: TextInputSheetProps) {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(initialValue);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const trimmed = draft.trim();
  const canSave = trimmed !== "" && !isSaving;

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const submit = async () => {
    if (!canSave) return;
    if (trimmed === initialValue.trim()) {
      onClose();
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSave(trimmed);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
      setIsSaving(false);
      inputRef.current?.focus();
    }
  };

  return (
    <BottomSheet title={title} onClose={onClose} locked={isSaving}>
      <form
        className="sheetForm"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label className="sheetField" htmlFor={inputId}>
          <span>
            {label} ({trimmed.length}/{maxLength})
          </span>
          <input
            ref={inputRef}
            id={inputId}
            className="sheetInput"
            type="text"
            value={draft}
            maxLength={maxLength}
            placeholder={placeholder}
            enterKeyHint="done"
            autoComplete="off"
            readOnly={isSaving}
            aria-invalid={error !== "" || undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
        {error ? (
          <p id={errorId} className="sheetError" role="alert">
            {error}
          </p>
        ) : null}
        <div className="sheetActions">
          <Button
            type="button"
            variant="ghost"
            size="medium"
            disabled={isSaving}
            onClick={onClose}
          >
            취소
          </Button>
          <Button type="submit" size="medium" disabled={!canSave}>
            {isSaving ? "저장 중…" : "저장"}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
