import { Button } from "@toss/tds-mobile";
import { GOAL_DESCRIPTIONS, GOAL_LABELS } from "../constants/fitplate";
import type { GoalType } from "../types/fitplate";

interface GoalSelectorProps {
  selectedGoal: GoalType;
  onChange: (goal: GoalType) => void;
  onBack: () => void;
  onNext: () => void;
}

// 목표 선택 컴포넌트입니다.
// 목표 값도 App의 state로 관리하고, 여기서는 선택 이벤트만 App으로 전달합니다.
export function GoalSelector({
  selectedGoal,
  onChange,
  onBack,
  onNext,
}: GoalSelectorProps) {
  const goals = Object.keys(GOAL_LABELS) as GoalType[];

  return (
    <section className="screen">
      <div className="sectionHeader">
        <p className="stepText">2단계</p>
        <h2>목표 선택</h2>
        <p>감량, 유지, 증량 중 하나를 선택하세요.</p>
      </div>

      <div className="goalList">
        {goals.map((goal) => (
          <button
            className={goal === selectedGoal ? "goalCard selected" : "goalCard"}
            key={goal}
            type="button"
            onClick={() => onChange(goal)}
          >
            <strong>{GOAL_LABELS[goal]}</strong>
            <span>{GOAL_DESCRIPTIONS[goal]}</span>
          </button>
        ))}
      </div>

      <div className="buttonRow">
        <Button variant="weak" onClick={onBack}>
          이전
        </Button>
        <Button color="dark" onClick={onNext}>
          결과 보기
        </Button>
      </div>
    </section>
  );
}
