import { Button, Post } from "@toss/tds-mobile";
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
        <Post.H3 color="#3182f6" typography="t7">1단계</Post.H3>
        <Post.H3>신체정보 입력</Post.H3>
        <Post.Paragraph color="#4a5568" typography="t7">
          감량, 유지, 증량 중 하나를 선택하세요.
        </Post.Paragraph>
      </div>

      <div className="goalList">
        {goals.map((goal) => (
          <Button
            className={goal === selectedGoal ? "goalCard selected" : "goalCard"}
            key={goal}            
            onClick={() => onChange(goal)}
          >
            <strong>{GOAL_LABELS[goal]}</strong>
            <span>{GOAL_DESCRIPTIONS[goal]}</span>
          </Button>
        ))}
      </div>

      <div className="buttonRow">
        <Button variant="weak" onClick={onBack}>
          이전
        </Button>
        <Button variant="fill" onClick={onNext}>
          결과 보기
        </Button>
      </div>
    </section>
  );
}
