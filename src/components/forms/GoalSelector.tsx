import { Button, Post } from "@toss/tds-mobile";
import { GOAL_DESCRIPTIONS, GOAL_LABELS } from "../../types/fitplate";
import { ScreenSectionHeader } from "../common/ScreenSectionHeader";
import type { GenerationStatus, GoalType } from "../../types/fitplate";
import { useFullScreenAd } from "../../ads/useFullScreenAd";

interface GoalSelectorProps {
  selectedGoal: GoalType;
  onGoalChange: (goal: GoalType) => void;
  onBack: () => void;
  onNext: () => void;
  generationStatus: GenerationStatus;
  onStartGenerating: () => void;
}
const GOALS: GoalType[] = ["lose", "maintain", "gain"];

export function GoalSelector({
  selectedGoal,
  onGoalChange,
  onBack,
  onNext,
  generationStatus,
  onStartGenerating,
}: GoalSelectorProps) {
  const { isAdLoaded, showAd } = useFullScreenAd();

  const handleClickResult = () => {
    if (generationStatus === "generating") return;

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
    <section className="screen goalSelectorScreen">
      <ScreenSectionHeader
        className="goalSelectorHeader"
        step="2단계"
        title="목표 선택"
        description="AI 식단 생성 전에 목표를 확정합니다."
      />

      <div className="goalList">
        {GOALS.map((goal) => (
          <button
            key={goal}
            aria-pressed={goal === selectedGoal}
            className={goal === selectedGoal ? "goalCard selected" : "goalCard"}
            type="button"
            onClick={() => onGoalChange(goal)}
          >
            <strong>{GOAL_LABELS[goal]}</strong>
            <span>{GOAL_DESCRIPTIONS[goal]}</span>
          </button>
        ))}
      </div>
      <Post.Paragraph color="#4a5568" typography="t7">*TDEE : 현재 활동량을 기준으로 하루에 소비하는 총 칼로리입니다.</Post.Paragraph>

      <div className="buttonRow">
        <Button variant="weak" onClick={onBack}>
          이전
        </Button>
        <Button
          color="primary"
          variant="fill"
          onClick={handleClickResult}
          disabled={generationStatus === "generating"}
        >
          {generationStatus === "generating"
            ? "식단 생성 중..."
            : isAdLoaded &&
              sessionStorage.getItem("adRewardAvailable") !== "true" &&
              generationStatus !== "failed"
            ? "결과보기 (AD)"
            : "결과보기"}
        </Button>
      </div>
    </section>
  );
}
