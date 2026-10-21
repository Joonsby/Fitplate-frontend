// 음식 한 개를 영양이 비슷한 대안으로 바꾸는 하단 시트입니다. 즐겨찾기에서 온 대안은 표시해 줍니다.
import "./FoodSwapSheet.css";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { AIFood } from "../../types/fitplate";
import type { FoodAlternative } from "../../api/mealPlanEditApi";
import { Button } from "../common/Button";
import { Spinner } from "../common/Spinner";
import { AlertIcon } from "../common/Icons";

interface FoodSwapSheetProps {
  original: AIFood;
  mealLabel: string;
  // excludeNames 는 이 시트에서 이미 보여준 음식이다. 서버가 다시 제안하지 않는다
  loadAlternatives: (excludeNames: string[]) => Promise<FoodAlternative[]>;
  onConfirm: (food: AIFood) => Promise<void>;
  onClose: () => void;
}

type LoadState = "loading" | "ready" | "error";

export function FoodSwapSheet({
  original,
  mealLabel,
  loadAlternatives,
  onConfirm,
  onClose,
}: FoodSwapSheetProps) {
  const titleId = useId();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [alternatives, setAlternatives] = useState<FoodAlternative[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);
  const shownNamesRef = useRef<string[]>([]);
  const alternativesRef = useRef<FoodAlternative[]>([]);

  const load = useCallback(async () => {
    setLoadState("loading");
    setSelectedIndex(null);
    setErrorMessage("");
    try {
      const next = await loadAlternatives(shownNamesRef.current);
      shownNamesRef.current = [...shownNamesRef.current, ...next.map((food) => food.name)];
      alternativesRef.current = next;
      setAlternatives(next);
      setLoadState("ready");
    } catch (error) {
      const message = error instanceof Error ? error.message : "다른 음식을 찾지 못했어요.";
      setErrorMessage(message);
      // 새 후보를 못 찾았으면 보던 후보는 그대로 두고 안내만 한다
      setLoadState(alternativesRef.current.length > 0 ? "ready" : "error");
    }
  }, [loadAlternatives]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isReplacing) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isReplacing, onClose]);

  const handleConfirm = async () => {
    if (selectedIndex == null) return;
    setIsReplacing(true);
    setErrorMessage("");
    try {
      await onConfirm(alternatives[selectedIndex]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "음식을 바꾸지 못했어요.",
      );
      setIsReplacing(false);
    }
  };

  return (
    <div className="swapBackdrop" onClick={isReplacing ? undefined : onClose}>
      <div
        className="swapSheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="swapHandle" aria-hidden="true" />
        <h2 id={titleId}>다른 음식으로 바꾸기</h2>
        <p className="swapOriginal">
          {mealLabel} · 지금 <strong>{original.name}</strong>{" "}
          {original.calories} kcal
        </p>
        <p className="swapHint">칼로리와 영양소가 비슷한 음식만 골랐어요.</p>

        <div className="swapBody">
          {loadState === "loading" ? (
            <div className="swapState">
              <Spinner size={44} label="비슷한 음식을 찾고 있어요" />
            </div>
          ) : null}

          {loadState === "error" ? (
            <div className="swapState">
              <span className="swapErrorIcon" aria-hidden="true">
                <AlertIcon />
              </span>
              <p>{errorMessage}</p>
              <Button
                variant="secondary"
                size="small"
                onClick={() => void load()}
              >
                다시 찾기
              </Button>
            </div>
          ) : null}

          {loadState === "ready" ? (
            <div className="swapList" role="radiogroup" aria-label="바꿀 음식">
              {alternatives.map((food, index) => {
                const selected = selectedIndex === index;
                const diff = food.calories - original.calories;
                return (
                  <button
                    key={`${food.name}-${index}`}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`swapOption${selected ? " isSelected" : ""}`}
                    onClick={() => setSelectedIndex(index)}
                    disabled={isReplacing}
                  >
                    <span className="swapRadio" aria-hidden="true" />
                    <span className="swapOptionText">
                      <strong>
                        {food.name}
                        {food.fromFavorites ? <em className="swapFavoriteTag">즐겨찾기</em> : null}
                      </strong>
                      <span>
                        {food.amount} · {food.calories} kcal
                      </span>
                      <span className="swapMacros">
                        단백질 {Math.round(food.protein)}g · 탄수화물{" "}
                        {Math.round(food.carbohydrate)}g · 지방{" "}
                        {Math.round(food.fat)}g
                      </span>
                    </span>
                    <span className="swapDiff">
                      {diff > 0 ? "+" : ""}
                      {diff} kcal
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {loadState === "ready" && errorMessage ? (
          <p className="swapInlineError" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {loadState === "error" ? null : (
          <div className="swapActions">
            <Button
              variant="ghost"
              size="medium"
              onClick={() => void load()}
              disabled={loadState === "loading" || isReplacing}
            >
              다른 후보 보기
            </Button>
            <Button
              size="medium"
              onClick={() => void handleConfirm()}
              disabled={selectedIndex == null || isReplacing}
            >
              {isReplacing ? "바꾸는 중…" : "이걸로 바꾸기"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
