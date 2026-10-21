// AI 식단 생성 중 화면과 끼니별 결과 목록을 보여줍니다.
import "../common/FoodRow.css";
import "./MealCard.css";
import "./AiMealPlanPanel.css";
import { Button } from "../common/Button";
import { Spinner } from "../common/Spinner";
import { CheckIcon, RefreshIcon } from "../common/Icons";
import { NutritionPanel } from "../common/NutritionPanel";
import { FoodRow } from "./FoodRow";
import { CoupangDisclosure } from "../common/CoupangDisclosure";
import type { AIFood, AIMealPlanResponse, MealFood, NutritionTarget } from "../../types/fitplate";
import type { FoodPosition } from "../../api/mealPlanEditApi";

const CAUTIONS = [
  "의학적 진단이나 치료 목적의 식단이 아닙니다.",
  "알레르기와 개인 질환이 있다면 전문가와 상담하세요.",
];

const LOADING_STEPS = [
  {
    title: "내 정보 반영",
    description: "신체정보와 목표에 맞춰 하루 칼로리와 영양소를 나누고 있어요.",
  },
  {
    title: "세 끼 구성",
    description: "아침·점심·저녁을 영양 균형에 맞게 짜고 있어요.",
  },
  {
    title: "15~30초 정도 걸려요",
    description: "완성되면 바로 보여 드리고 저장 식단에도 보관할게요.",
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
  onFoodSwap?: (position: FoodPosition, food: AIFood) => void;
  onMealRegenerate?: (mealType: FoodPosition["mealType"]) => void;
  regeneratingMealType?: FoodPosition["mealType"] | null;
  // 날짜가 정해진 식단이고 그날이 지났거나 오늘이면 끼니마다 먹었는지 체크할 수 있다
  intakeEnabled?: boolean;
  onMealIntakeToggle?: (mealType: FoodPosition["mealType"], eaten: boolean) => void;
}

export function AiMealPlanPanel({
  isAiLoading,
  aiError,
  target,
  aiMealPlan,
  favoriteFoodNames,
  onFavoriteFoodToggle,
  onRetryAiGenerate,
  onFoodSwap,
  onMealRegenerate,
  regeneratingMealType = null,
  intakeEnabled = false,
  onMealIntakeToggle,
}: AiMealPlanPanelProps) {
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
          <p>잠시만 이 화면에서 기다려 주세요.</p>
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
      <CoupangDisclosure />
      <div className="mealList">
        {aiMealPlan!.meals.map((meal) => {
          const mealCalories = meal.foods.reduce((sum, f) => sum + f.calories, 0);
          const eaten = meal.eaten === true;
          return (
            <article
              className={`mealCard${regeneratingMealType === meal.mealType ? " isRegenerating" : ""}${eaten ? " isEaten" : ""}`}
              key={meal.mealType}
              aria-busy={regeneratingMealType === meal.mealType}
            >
              <div className="mealCardHeader">
                <strong>{MEAL_TYPE_LABELS[meal.mealType]}</strong>
                <span>{mealCalories.toLocaleString()} kcal</span>
                {onMealRegenerate && !eaten ? (
                  <button
                    type="button"
                    className="mealRegenerateButton"
                    aria-label={`${MEAL_TYPE_LABELS[meal.mealType]} 다시 만들기`}
                    disabled={regeneratingMealType != null}
                    onClick={() => onMealRegenerate(meal.mealType)}
                  >
                    <RefreshIcon />
                  </button>
                ) : null}
              </div>
              {intakeEnabled && onMealIntakeToggle ? (
                <button
                  type="button"
                  className={`mealIntakeToggle${eaten ? " isEaten" : ""}`}
                  aria-pressed={eaten}
                  onClick={() => onMealIntakeToggle(meal.mealType, !eaten)}
                >
                  <span className="mealIntakeBox" aria-hidden="true">
                    {eaten ? <CheckIcon /> : null}
                  </span>
                  {eaten ? "먹었어요" : "먹었으면 체크하세요"}
                </button>
              ) : null}
              {regeneratingMealType === meal.mealType ? (
                <div className="mealRegenerating" role="status">
                  <Spinner size={40} label={`${MEAL_TYPE_LABELS[meal.mealType]}을 다시 만들고 있어요`} />
                </div>
              ) : null}
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
                      onSwap={
                        onFoodSwap && !eaten
                          ? () => onFoodSwap({ mealType: meal.mealType, foodIndex: i }, food)
                          : undefined
                      }
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
