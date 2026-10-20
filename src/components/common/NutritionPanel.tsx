// 목표 칼로리, BMR, TDEE, 3대 영양소를 한 블록으로 보여주는 컴포넌트입니다.
import "./NutritionPanel.css";
import { MetricItem } from "./MetricItem";
import { MacroItem } from "./MacroItem";
import type { NutritionTarget } from "../../types/fitplate";

export interface NutritionPanelProps {
  target: NutritionTarget;
}

export function NutritionPanel({ target }: NutritionPanelProps) {
  const macros = [
    { label: "탄수화물", value: target.carbsGram, kcal: target.carbsGram * 4, tone: "carbs" },
    { label: "단백질", value: target.proteinGram, kcal: target.proteinGram * 4, tone: "protein" },
    { label: "지방", value: target.fatGram, kcal: target.fatGram * 9, tone: "fat" },
  ] as const;
  const macroKcal = macros.reduce((sum, macro) => sum + macro.kcal, 0) || 1;

  return (
    <div className="nutritionPanel">
      <div className="caloriePanel">
        <span>하루 목표 칼로리</span>
        <strong>
          {target.calories.toLocaleString()}
          <small>kcal</small>
        </strong>
        <div className="metricGrid">
          <MetricItem label="기초대사량" abbr="BMR" value={target.bmr} unit="kcal" />
          <MetricItem label="총소비량" abbr="TDEE" value={target.tdee} unit="kcal" />
        </div>
      </div>

      <div className="card macroCard">
        <div className="macroBar" aria-hidden="true">
          {macros.map((macro) => (
            <span
              key={macro.tone}
              className={`macroTone--${macro.tone}`}
              style={{ width: `${(macro.kcal / macroKcal) * 100}%` }}
            />
          ))}
        </div>
        <div className="macroGrid">
          {macros.map((macro) => (
            <MacroItem
              key={macro.tone}
              label={macro.label}
              value={macro.value}
              tone={macro.tone}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
