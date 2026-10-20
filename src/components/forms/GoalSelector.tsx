// 목표(감량·유지·증량)를 고르고 AI 식단 생성을 시작하는 화면입니다.
import "../../styles/layout.css";
import "./GoalSelector.css";
import { GOAL_DESCRIPTIONS, GOAL_LABELS } from "../../types/fitplate";
import { ScreenSectionHeader } from "../common/ScreenSectionHeader";
import { StepProgress } from "../common/StepProgress";
import { Button } from "../common/Button";
import { SparkleIcon, TrendIcon } from "../common/Icons";
import type { GenerationStatus, GoalType } from "../../types/fitplate";
import { useFullScreenAd } from "../../ads/useFullScreenAd";

interface GoalSelectorProps {
  selectedGoal: GoalType;
  goalCalories: Record<GoalType, number>;
  isOnboarding: boolean;
  onGoalChange: (goal: GoalType) => void;
  onNext: () => void;
  generationStatus: GenerationStatus;
  onStartGenerating: () => void;
}

const GOALS: GoalType[] = ["lose", "maintain", "gain"];

const GOAL_TREND = {
  lose: "down",
  maintain: "flat",
  gain: "up",
} as const satisfies Record<GoalType, "down" | "flat" | "up">;

export function GoalSelector({
  selectedGoal,
  goalCalories,
  isOnboarding,
  onGoalChange,
  onNext,
  generationStatus,
  onStartGenerating,
}: GoalSelectorProps) {
  const { isAdLoaded, showAd } = useFullScreenAd();
  const isGenerating = generationStatus === "generating";
  const showsAd =
    isAdLoaded &&
    sessionStorage.getItem("adRewardAvailable") !== "true" &&
    generationStatus !== "failed";

  const handleClickResult = () => {
    if (isGenerating) return;

    const hasAdReward = sessionStorage.getItem("adRewardAvailable") === "true";
    if (hasAdReward || generationStatus === "failed") {
      onStartGenerating();
      onNext();
      return;
    }

    onStartGenerating();
    showAd((wasWatched) => {
      if (wasWatched) {
        sessionStorage.setItem("adRewardAvailable", "true");
      }
      onNext();
    });
  };

  return (
    <section className="screen goalScreen">
      <ScreenSectionHeader
        step={isOnboarding ? <StepProgress current={2} total={2} /> : undefined}
        title={
          <>
            어떤 목표로
            <br />
            식단을 짤까요?
          </>
        }
        description="고른 목표에 맞춰 하루 칼로리가 정해져요."
      />

      <div className="goalList" role="radiogroup" aria-label="목표">
        {GOALS.map((goal) => {
          const selected = goal === selectedGoal;
          return (
            <button
              key={goal}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`goalCard${selected ? " isSelected" : ""}`}
              onClick={() => onGoalChange(goal)}
            >
              <span className="goalIcon" aria-hidden="true">
                <TrendIcon direction={GOAL_TREND[goal]} />
              </span>
              <span className="goalText">
                <strong>{GOAL_LABELS[goal]}</strong>
                <span>{GOAL_DESCRIPTIONS[goal]}</span>
              </span>
              <span className="goalKcal">
                <strong>{goalCalories[goal].toLocaleString()}</strong>
                kcal
              </span>
            </button>
          );
        })}
      </div>

      <p className="goalNote">
        TDEE는 현재 활동량을 기준으로 하루에 쓰는 총 칼로리예요.
      </p>

      <Button className="goalSubmit" block onClick={handleClickResult} disabled={isGenerating}>
        {isGenerating ? (
          "식단 만드는 중…"
        ) : (
          <>
            <SparkleIcon />
            AI 식단 만들기
            {showsAd ? <span className="goalAdChip">광고</span> : null}
          </>
        )}
      </Button>
    </section>
  );
}
