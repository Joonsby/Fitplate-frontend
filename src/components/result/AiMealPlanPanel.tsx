// AI 식단 로딩/에러/결과 상태를 보여주는 패널 컴포넌트입니다.
import { Loader } from "@toss/tds-mobile";
import { NutritionPanel } from "../common/NutritionPanel";
import { AiDayCard } from "./AiDayCard";
import type { MealPlan, NutritionTarget } from "../../types/fitplate";

const CAUTIONS = [
  "의학적 진단이나 치료 목적의 식단이 아닙니다.",
  "알레르기와 개인 질환이 있다면 전문가와 상담하세요.",
];

export interface AiMealPlanPanelProps {
  isAiLoading: boolean;
  aiError: string | null;
  target: NutritionTarget;
  mealPlan: MealPlan;
  onRetryAiGenerate: () => void;
}

export function AiMealPlanPanel({
  isAiLoading,
  aiError,
  target,
  mealPlan,
  onRetryAiGenerate,
}: AiMealPlanPanelProps) {
  if (isAiLoading) {
    return (
      <main className="appShell" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <Loader size="large" />
        <h3>AI가 식단을 생성하고 있어요</h3>
        <p>신체정보와 목표를 바탕으로 맞춤 식단을 구성하는 중입니다.</p>
      </main>
    );
  }

  if (aiError != null) {
    return (
      <section className="aiPanel error">
        <h3>AI 응답 오류</h3>

        <NutritionPanel target={target} />

        <p>
          {aiError.split("\n").map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </p>
        <button type="button" onClick={onRetryAiGenerate}>
          다시 생성하기
        </button>
      </section>
    );
  }

  const hasAiData = mealPlan.days.length > 0 && mealPlan.days[0].meals[0]?.name != null;

  if (!hasAiData) {
    return (
      <section className="aiPanel">
        <h3>AI 응답 대기</h3>
        <p>결과 보기 버튼을 누르면 AI 응답이 여기에 표시됩니다.</p>
      </section>
    );
  }

  return (
    <section className="aiPanel">
      <div className="aiPanelHeader">
        <h3>AI 식단 결과 요약</h3>
        <p>
          {target.calories.toLocaleString()}kcal 목표에 맞춰 AI가 생성한{" "}
          {mealPlan.durationDays}일 식단입니다.
        </p>
      </div>

      <div className="aiMetaGrid">
        <div>
          <span>기간</span>
          <strong>{mealPlan.durationDays}일</strong>
        </div>
        <div>
          <span>목표</span>
          <strong>{target.calories.toLocaleString()} kcal</strong>
        </div>
      </div>

      <div className="aiDayList">
        {mealPlan.days.map((dayMeal) => (
          <AiDayCard dayMeal={dayMeal} key={dayMeal.id} />
        ))}
      </div>

      <ul className="aiCautionList">
        {CAUTIONS.map((caution) => (
          <li key={caution}>{caution}</li>
        ))}
      </ul>
    </section>
  );
}
