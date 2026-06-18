// 목표 칼로리, BMR, TDEE, 3대 영양소를 한 블록으로 보여주는 컴포넌트입니다.
import { MetricItem } from "./MetricItem";
import { MacroItem } from "./MacroItem";
import type { NutritionTarget } from "../../types/fitplate";

export interface NutritionPanelProps {
  target: NutritionTarget;
}

export function NutritionPanel({ target }: NutritionPanelProps) {
  return (
    <>
      <div className="caloriePanel">
        <span>목표 칼로리</span>
        <strong>{target.calories.toLocaleString()} kcal</strong>
      </div>

      <div className="metricGrid">
        <MetricItem label="BMR" value={target.bmr} unit="kcal" />
        <MetricItem label="TDEE" value={target.tdee} unit="kcal" />
      </div>

      <div className="macroGrid">
        <MacroItem label="단백질" value={target.proteinGram} />
        <MacroItem label="탄수화물" value={target.carbsGram} />
        <MacroItem label="지방" value={target.fatGram} />
      </div>
    </>
  );
}
