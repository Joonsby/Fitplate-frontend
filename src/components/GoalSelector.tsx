import { Button, Post } from "@toss/tds-mobile";
import { GOAL_DESCRIPTIONS, GOAL_LABELS } from "../constants/fitplate";
import type { GoalType } from "../types/fitplate";

interface GoalSelectorProps {
  selectedGoal: GoalType;
  onChange: (goal: GoalType) => void;
  onBack: () => void;
  onNext: () => void;
}

const GOALS: GoalType[] = ["lose", "maintain", "gain"];

export function GoalSelector({
  selectedGoal,
  onChange,
  onBack,
  onNext,
}: GoalSelectorProps) {
  return (
    <section className="screen goalSelectorScreen">
      <div className="sectionHeader goalSelectorHeader">
        <Post.H3 color="#3182f6" typography="t7">2단계</Post.H3>
        <Post.H3>신체정보 입력</Post.H3>
        <Post.Paragraph color="#4a5568" typography="t7">
          감량, 유지, 증량 중 하나를 선택하세요.
        </Post.Paragraph>
      </div>

      <div className="goalList">
        {GOALS.map((goal) => (
          <button
            aria-pressed={goal === selectedGoal}
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
        <Button color="primary" variant="fill" onClick={onNext}>
          결과 보기
        </Button>
      </div>
    </section>
  );
}
