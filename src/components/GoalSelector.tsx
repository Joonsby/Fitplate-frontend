import { Button } from "@toss/tds-mobile";
import { GOAL_DESCRIPTIONS, GOAL_LABELS } from "../constants/fitplate";
import { ScreenSectionHeader } from "./ScreenSectionHeader";
import type { GoalType, PlanDuration } from "../types/fitplate";

interface GoalSelectorProps {
  selectedGoal: GoalType;
  selectedDuration: PlanDuration;
  onGoalChange: (goal: GoalType) => void;
  onDurationChange: (duration: PlanDuration) => void;
  onBack: () => void;
  onNext: () => void;
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
}: GoalSelectorProps) {
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
        <Button color="primary" variant="fill" onClick={onNext}>
          결과 보기
        </Button>
      </div>
    </section>
  );
}
