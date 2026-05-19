import { Button } from "@toss/tds-mobile";
import { GOAL_LABELS } from "../constants/fitplate";
import { SHOPPING_LINKS } from "../data/shoppingLinks";
import type {
  AIDayMealPlan,
  AIMealPlanResponse,
  DayMeal,
  FavoriteFood,
  GoalType,
  MealFood,
  MealPlan,
  NutritionTarget,
  PlanDuration,
  ShoppingListItem,
  UserProfile,
} from "../types/fitplate";
import { createFavoriteFoodId } from "../utils/favoriteFoodStorage";
import { aggregateShoppingList } from "../utils/shoppingListAggregator";

interface ResultScreenProps {
  profile: UserProfile;
  goal: GoalType;
  target: NutritionTarget;
  mealPlan: MealPlan;
  planDuration: PlanDuration;
  favoriteFoods: FavoriteFood[];
  isSavedView: boolean;
  isAiLoading: boolean;
  aiError: string | null;
  aiMealPlanResponse: AIMealPlanResponse | null;
  savedAt?: string;
  onDurationChange: (duration: PlanDuration) => void;
  onFavoriteFoodToggle: (food: MealFood) => void;
  onRetryAiGenerate: () => void;
  onBack: () => void;
  onRestart: () => void;
  onSave?: () => void;
}

const PLAN_DURATIONS: PlanDuration[] = [3, 7, 14];

// 결과 화면 컴포넌트입니다.
// 규칙 기반 식단과 mock AI 응답을 함께 보여줍니다.
export function ResultScreen({
  profile,
  goal,
  target,
  mealPlan,
  planDuration,
  favoriteFoods,
  isSavedView,
  isAiLoading,
  aiError,
  aiMealPlanResponse,
  savedAt,
  onDurationChange,
  onFavoriteFoodToggle,
  onRetryAiGenerate,
  onBack,
  onRestart,
  onSave,
}: ResultScreenProps) {
  const shoppingList = aggregateShoppingList(mealPlan);
  const favoriteFoodIds = new Set(
    favoriteFoods.map((favoriteFood) => favoriteFood.id),
  );
  const savedDate =
    savedAt == null
      ? null
      : new Date(savedAt).toLocaleString("ko-KR", {
          dateStyle: "medium",
          timeStyle: "short",
        });

  return (
    <section className="screen">
      <div className="sectionHeader">
        <p className="stepText">{isSavedView ? "저장된 식단" : "3단계"}</p>
        <h2>{GOAL_LABELS[goal]} 결과</h2>
        <p>
          {profile.heightCm}cm, {profile.weightKg}kg 기준 목표와 가장 가까운{" "}
          {mealPlan.targetCalories.toLocaleString()}kcal 식단입니다.
        </p>
        {savedDate ? <p className="savedAtText">저장 날짜: {savedDate}</p> : null}
      </div>

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

      {onSave ? (
        <Button color="dark" disabled={isAiLoading} onClick={onSave}>
          이 식단 저장하기
        </Button>
      ) : null}

      <AiMealPlanPanel
        aiError={aiError}
        aiMealPlanResponse={aiMealPlanResponse}
        isAiLoading={isAiLoading}
        onRetryAiGenerate={onRetryAiGenerate}
      />

      <div className="durationPanel">
        <h3>식단 기간</h3>
        <div className="durationButtons" aria-label="식단 기간 선택">
          {PLAN_DURATIONS.map((duration) => (
            <button
              className={
                duration === planDuration
                  ? "durationButton selected"
                  : "durationButton"
              }
              disabled={isSavedView || isAiLoading}
              key={duration}
              type="button"
              onClick={() => onDurationChange(duration)}
            >
              {duration}일
            </button>
          ))}
        </div>
      </div>

      <div className="mealList">
        <div className="mealListHeader">
          <h3>날짜별 식단</h3>
          <span>평균 {mealPlan.averageCalories.toLocaleString()} kcal</span>
        </div>

        {mealPlan.days.map((dayMeal) => (
          <DayMealCard
            dayMeal={dayMeal}
            favoriteFoodIds={favoriteFoodIds}
            key={dayMeal.id}
            onFavoriteFoodToggle={onFavoriteFoodToggle}
          />
        ))}
      </div>

      <div className="shoppingList">
        <div className="mealListHeader">
          <h3>장보기 리스트</h3>
          <span>{shoppingList.length}개 재료</span>
        </div>

        {shoppingList.map((item) => (
          <ShoppingListRow item={item} key={item.id} />
        ))}
      </div>

      <div className="buttonRow">
        <Button variant="weak" onClick={onBack}>
          {isSavedView ? "목록으로" : "목표 다시 선택"}
        </Button>
        <Button variant="weak" onClick={onRestart}>
          처음부터
        </Button>
      </div>
    </section>
  );
}

interface AiMealPlanPanelProps {
  isAiLoading: boolean;
  aiError: string | null;
  aiMealPlanResponse: AIMealPlanResponse | null;
  onRetryAiGenerate: () => void;
}

// mock AI 응답을 보여주는 패널입니다.
// 아직 실제 API를 호출하지 않고, Promise 기반 mock JSON만 렌더링합니다.
function AiMealPlanPanel({
  isAiLoading,
  aiError,
  aiMealPlanResponse,
  onRetryAiGenerate,
}: AiMealPlanPanelProps) {
  if (isAiLoading) {
    return (
      <section className="aiPanel">
        <h3>mock AI 식단 생성 중</h3>
        <p>정해둔 JSON 구조에 맞춰 응답을 준비하고 있습니다.</p>
      </section>
    );
  }

  if (aiError != null) {
    return (
      <section className="aiPanel error">
        <h3>mock AI 응답 오류</h3>
        <p>{aiError}</p>
        <button type="button" onClick={onRetryAiGenerate}>
          다시 생성하기
        </button>
      </section>
    );
  }

  if (aiMealPlanResponse == null) {
    return (
      <section className="aiPanel">
        <h3>mock AI 응답 대기</h3>
        <p>결과 보기 버튼을 누르면 mock AI 응답이 여기에 표시됩니다.</p>
      </section>
    );
  }

  return (
    <section className="aiPanel">
      <div className="aiPanelHeader">
        <div>
          <h3>mock AI 응답</h3>
          <p>{aiMealPlanResponse.summary}</p>
        </div>
        <span>{aiMealPlanResponse.schemaVersion}</span>
      </div>

      <div className="aiMetaGrid">
        <div>
          <span>source</span>
          <strong>{aiMealPlanResponse.source}</strong>
        </div>
        <div>
          <span>기간</span>
          <strong>{aiMealPlanResponse.durationDays}일</strong>
        </div>
        <div>
          <span>목표</span>
          <strong>{aiMealPlanResponse.targetCalories.toLocaleString()} kcal</strong>
        </div>
      </div>

      <div className="aiDayList">
        {aiMealPlanResponse.days.map((day) => (
          <AiDayCard day={day} key={day.day} />
        ))}
      </div>

      <ul className="aiCautionList">
        {aiMealPlanResponse.cautions.map((caution) => (
          <li key={caution}>{caution}</li>
        ))}
      </ul>
    </section>
  );
}

interface AiDayCardProps {
  day: AIDayMealPlan;
}

// AI JSON 응답 중 하루 식단을 간단히 보여주는 카드입니다.
function AiDayCard({ day }: AiDayCardProps) {
  return (
    <article className="aiDayCard">
      <div className="dayMealHeader">
        <strong>{day.title}</strong>
        <span>{day.totalCalories.toLocaleString()} kcal</span>
      </div>
      {day.meals.map((meal) => (
        <p key={`${day.day}-${meal.mealType}`}>
          {meal.title}: {meal.foods.map((food) => food.name).join(", ")}
        </p>
      ))}
    </article>
  );
}

interface DayMealCardProps {
  dayMeal: DayMeal;
  favoriteFoodIds: Set<string>;
  onFavoriteFoodToggle: (food: MealFood) => void;
}

// 하루치 식단을 카드로 보여주는 컴포넌트입니다.
function DayMealCard({
  dayMeal,
  favoriteFoodIds,
  onFavoriteFoodToggle,
}: DayMealCardProps) {
  return (
    <article className="dayMealCard">
      <div className="dayMealHeader">
        <strong>{dayMeal.title}</strong>
        <span>{dayMeal.totalCalories.toLocaleString()} kcal</span>
      </div>

      {dayMeal.meals.map((meal) => (
        <div className="mealCard" key={meal.id}>
          <div className="mealCardHeader">
            <strong>{meal.title}</strong>
            <span>{meal.calories} kcal</span>
          </div>

          <div className="foodList">
            {meal.foods.map((food) => (
              <FoodRow
                food={food}
                isFavorite={favoriteFoodIds.has(createFavoriteFoodId(food))}
                key={food.id}
                onFavoriteFoodToggle={onFavoriteFoodToggle}
              />
            ))}
          </div>
        </div>
      ))}
    </article>
  );
}

interface FoodRowProps {
  food: MealFood;
  isFavorite: boolean;
  onFavoriteFoodToggle: (food: MealFood) => void;
}

// 식단 안의 음식 한 줄을 보여주는 컴포넌트입니다.
// 별 버튼은 localStorage 기반 즐겨찾기 토글에 연결됩니다.
function FoodRow({ food, isFavorite, onFavoriteFoodToggle }: FoodRowProps) {
  return (
    <div className="foodRow">
      <div>
        <strong>{food.name}</strong>
        <span>
          {food.amount} · {food.calories} kcal
        </span>
      </div>
      <div className="foodRowActions">
        <button
          aria-label={`${food.name} 즐겨찾기`}
          className={
            isFavorite ? "favoriteFoodButton selected" : "favoriteFoodButton"
          }
          type="button"
          onClick={() => onFavoriteFoodToggle(food)}
        >
          ★
        </button>
        <a
          className="buyFoodButton"
          href={SHOPPING_LINKS[food.shoppingCategory]}
          rel="noopener noreferrer"
          target="_blank"
        >
          구매하기
        </a>
      </div>
    </div>
  );
}

interface ShoppingListRowProps {
  item: ShoppingListItem;
}

// 중복 재료를 합친 장보기 리스트 한 줄입니다.
function ShoppingListRow({ item }: ShoppingListRowProps) {
  return (
    <div className="shoppingListRow">
      <div>
        <strong>{item.name}</strong>
        <span>
          {item.amountText} · {item.servingCount}회 ·{" "}
          {item.totalCalories.toLocaleString()} kcal
        </span>
      </div>
      <a
        className="buyFoodButton"
        href={SHOPPING_LINKS[item.shoppingCategory]}
        rel="noopener noreferrer"
        target="_blank"
      >
        구매하기
      </a>
    </div>
  );
}

interface MetricItemProps {
  label: string;
  value: number;
  unit: string;
}

// BMR, TDEE처럼 계산 과정의 중간값을 보여주는 작은 컴포넌트입니다.
function MetricItem({ label, value, unit }: MetricItemProps) {
  return (
    <div className="metricItem">
      <span>{label}</span>
      <strong>
        {value.toLocaleString()} {unit}
      </strong>
    </div>
  );
}

interface MacroItemProps {
  label: string;
  value: number;
}

// 단백질, 탄수화물, 지방 값을 같은 모양으로 보여주는 작은 컴포넌트입니다.
function MacroItem({ label, value }: MacroItemProps) {
  return (
    <div className="macroItem">
      <span>{label}</span>
      <strong>{value}g</strong>
    </div>
  );
}
