import { Button, Post } from "@toss/tds-mobile";
import { GOAL_DESCRIPTIONS, GOAL_LABELS } from "../../types/fitplate";
import { ScreenSectionHeader } from "../common/ScreenSectionHeader";
import type { GoalType, PlanDuration } from "../../types/fitplate";
import { useFullScreenAd } from "../../ads/useFullScreenAd";

interface GoalSelectorProps {
  selectedGoal: GoalType;
  selectedDuration: PlanDuration;
  onGoalChange: (goal: GoalType) => void;
  onDurationChange: (duration: PlanDuration) => void;
  onBack: () => void;
  onNext: () => void;
  isGenerating: boolean;
  onStartGenerating: () => void;
}
const PLAN_DURATIONS: PlanDuration[] = [3, 7, 14];
const GOALS: GoalType[] = ["lose", "maintain", "gain"];

export function GoalSelector({
  selectedGoal,
  selectedDuration,
  onGoalChange,
  onDurationChange,
  onBack,
  onNext,
  isGenerating,
  onStartGenerating,
}: GoalSelectorProps) {
  const { isAdLoaded, showAd } = useFullScreenAd();

  const handleClickResult = () => {
    onStartGenerating();
    showAd(() => {
      onNext();
    });
  };

  return (
    <section className="screen goalSelectorScreen">
      <ScreenSectionHeader
        className="goalSelectorHeader"
        step="2단계"
        title="목표 선택"
        description="AI 식단 생성 전에 목표와 기간을 먼저 확정합니다."
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
      <div className="durationPanel">
        <h3>식단 기간</h3>

        <div className="durationButtons">
          {PLAN_DURATIONS.map((duration) => (
            <button
              key={duration}
              type="button"
              className={
                selectedDuration === duration
                  ? "durationButton selected"
                  : "durationButton"
              }
              onClick={() => onDurationChange(duration)}
            >
              {duration}일
            </button>
          ))}
        </div>
      </div>

      <div className="buttonRow">
        <Button variant="weak" onClick={onBack}>
          이전
        </Button>
        <Button
          color="primary"
          variant="fill"
          onClick={handleClickResult}
          disabled={isGenerating}
        >
          {isGenerating ? "식단 생성 중..." : isAdLoaded ? "결과보기 (AD)" : "결과보기"}
        </Button>
      </div>
    </section>
  );
}
