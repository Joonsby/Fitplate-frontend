// AI 식단 생성 중 화면과 끼니별 결과 목록을 보여줍니다.
import "../common/FoodRow.css";
import "./MealCard.css";
import "./AiMealPlanPanel.css";
import { useNavigate } from "react-router-dom";
import { Button } from "../common/Button";
import { Spinner } from "../common/Spinner";
import { NutritionPanel } from "../common/NutritionPanel";
import { FoodRow } from "./FoodRow";
import type { AIMealPlanResponse, MealFood, NutritionTarget } from "../../types/fitplate";

const CAUTIONS = [
  "의학적 진단이나 치료 목적의 식단이 아닙니다.",
  "알레르기와 개인 질환이 있다면 전문가와 상담하세요.",
];

const LOADING_STEPS = [
  {
    title: "내 정보 반영",
    description: "신체정보와 목표를 바탕으로 맞춤 식단을 구성하고 있어요.",
  },
  {
    title: "자동으로 저장",
    description: "화면을 닫아도 완성되면 저장 식단에 보관돼요.",
  },
  {
    title: "1~2분 정도 걸려요",
    description: "조금만 기다려 주세요.",
  },
];

const MEAL_TYPE_LABELS = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
} satisfies Record<AIMealPlanResponse["meals"][number]["mealType"], string>;

export interface AiMealPlanPanelProps {
  isAiLoading: boolean;
  aiError: string | null;
  target: NutritionTarget;
  aiMealPlan: AIMealPlanResponse | null;
  favoriteFoodNames: Set<string>;
  onFavoriteFoodToggle: (food: MealFood) => void;
  onRetryAiGenerate: () => void;
}

export function AiMealPlanPanel({
  isAiLoading,
  aiError,
  target,
  aiMealPlan,
  favoriteFoodNames,
  onFavoriteFoodToggle,
  onRetryAiGenerate,
}: AiMealPlanPanelProps) {
  const navigate = useNavigate();

  if (isAiLoading) {
    return (
      <div className="aiLoading">
        <div className="aiLoadingCenter">
          <Spinner size={72} />
          <h1>
            AI가 식단을
            <br />
            만들고 있어요
          </h1>
        </div>

        <ol className="aiLoadingSteps">
          {LOADING_STEPS.map((step, i) => (
            <li key={step.title} style={{ animationDelay: `${0.3 + i * 0.25}s` }}>
              <span className="aiLoadingStepNumber">{i + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <Button className="aiLoadingBack" variant="ghost" block onClick={() => navigate(-1)}>
          뒤로 가기
        </Button>
      </div>
    );
  }

  if (aiError != null) {
    return (
      <section className="card aiPanelError" role="alert">
        <h2>AI 응답에 문제가 있었어요</h2>
        <NutritionPanel target={target} />
        <p>
          {aiError.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <Button block onClick={onRetryAiGenerate}>
          다시 만들기
        </Button>
      </section>
    );
  }

  const hasAiData = (aiMealPlan?.meals.length ?? 0) > 0;

  if (!hasAiData) {
    return (
      <section className="card aiPanelEmpty">
        <h2>AI 응답을 기다리고 있어요</h2>
        <p>식단이 완성되면 여기에 표시돼요.</p>
      </section>
    );
  }

  return (
    <section className="aiResult" aria-label="끼니별 식단">
      <div className="mealList">
        {aiMealPlan!.meals.map((meal) => {
          const mealCalories = meal.foods.reduce((sum, f) => sum + f.calories, 0);
          return (
            <article className="mealCard" key={meal.mealType}>
              <div className="mealCardHeader">
                <strong>{MEAL_TYPE_LABELS[meal.mealType]}</strong>
                <span>{mealCalories.toLocaleString()} kcal</span>
              </div>
              <div className="foodList">
                {meal.foods.map((food, i) => {
                  const mealFood: MealFood = {
                    id: `${meal.mealType}-food${i}`,
                    name: food.name,
                    amount: food.amount,
                    calories: food.calories,
                    shoppingCategory: "vegetable",
                    shoppingKeyword: food.shoppingKeyword,
                    protein: food.protein,
                    carbohydrate: food.carbohydrate,
                    fat: food.fat,
                  };
                  return (
                    <FoodRow
                      food={mealFood}
                      isFavorite={favoriteFoodNames.has(food.name)}
                      key={mealFood.id}
                      onFavoriteFoodToggle={onFavoriteFoodToggle}
                    />
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <ul className="aiCautionList">
        {CAUTIONS.map((caution) => (
          <li key={caution}>{caution}</li>
        ))}
      </ul>
    </section>
  );
}
