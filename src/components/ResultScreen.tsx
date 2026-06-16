import { Button, Post, Loader } from "@toss/tds-mobile";
import { GOAL_LABELS } from "../types/fitplate";
import { SHOPPING_LINKS } from "../data/shoppingLinks";
import { ScreenSectionHeader } from "./ScreenSectionHeader";
import type {
  DayMeal,
  FavoriteFood,
  GoalType,
  MealFood,
  MealPlan,
  NutritionTarget,
  ShoppingListItem,
  UserProfile,
} from "../types/fitplate";
import { aggregateShoppingList } from "../utils/shoppingListAggregator";

const CAUTIONS = [
  "의학적 진단이나 치료 목적의 식단이 아닙니다.",
  "알레르기와 개인 질환이 있다면 전문가와 상담하세요.",
];

interface ResultScreenProps {
  profile: UserProfile;
  goal: GoalType;
  target: NutritionTarget;
  mealPlan: MealPlan;
  favoriteFoods: FavoriteFood[];
  isSavedView: boolean;
  isAiLoading: boolean;
  aiError: string | null;
  savedAt?: string;
  onLoginRequired: () => void;
  onSaveMealPlan?: () => void;
  onFavoriteFoodToggle: (food: MealFood) => void;
  onRetryAiGenerate: () => void;
  onBack: () => void;
  onRestart: () => void;
}

// 결과 화면 컴포넌트입니다.
// 규칙 기반 식단과 AI 응답을 함께 보여줍니다.
export function ResultScreen({
  aiError,
  favoriteFoods,
  goal,
  isAiLoading,
  isSavedView,
  mealPlan,
  profile,
  savedAt,
  target,
  onFavoriteFoodToggle,
  onRetryAiGenerate,
  onSaveMealPlan,
  onBack,
  onRestart,
}: ResultScreenProps) {
  const shoppingList = aggregateShoppingList(mealPlan);
  const favoriteFoodNames = new Set(
    favoriteFoods.map((favoriteFood) => favoriteFood.name),
  );
  const savedDate =
    savedAt == null
      ? null
      : new Date(savedAt).toLocaleString("ko-KR", {
          dateStyle: "medium",
          timeStyle: "short",
        });

  // meal.name 존재 여부로 AI 병합 완료 여부 판단 (aiMealPlanResponse 대체)
  const hasAiData = mealPlan.days.length > 0 && mealPlan.days[0].meals[0]?.name != null;
  const shouldShowFallbackFailure = !isAiLoading && aiError != null && !hasAiData;

  return (
    <section className="screen">
      {shouldShowFallbackFailure ? (
        <AiMealPlanFailureScreen
          aiError={aiError}
          target={target}
          onRetryAiGenerate={onRetryAiGenerate}
        />
      ) : null}

      {!shouldShowFallbackFailure && (isAiLoading || aiError != null) ? (
        <AiMealPlanPanel
          aiError={aiError}
          isAiLoading={isAiLoading}
          target={target}
          mealPlan={mealPlan}
          onRetryAiGenerate={onRetryAiGenerate}
        />
      ) : null}

      {!isAiLoading && hasAiData ? (
        <>
          <ScreenSectionHeader
            description={`${profile.height}cm, ${profile.weight}kg 기준 목표와 가장 가까운 ${mealPlan.targetCalories.toLocaleString()}kcal 식단입니다.`}
            step={isSavedView ? "저장된 식단" : "3단계"}
            title={`${GOAL_LABELS[goal]} 결과`}
          >
            {savedDate ? (
              <Post.H3 color="#3182f6" typography="t7" className="savedAtText">저장 날짜: {savedDate}</Post.H3>
            ) : null}
          </ScreenSectionHeader>

          <section className="mealPlanSummary">
            <div className="mealPlanSummaryInner">
              <div className="nutritionSummary">
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

                <Button onClick={onSaveMealPlan}>식단 저장하기</Button>
              </div>

              <AiMealPlanPanel
                aiError={aiError}
                isAiLoading={isAiLoading}
                target={target}
                mealPlan={mealPlan}
                onRetryAiGenerate={onRetryAiGenerate}
              />

              <div className="mealList">
                <div className="mealListHeader">
                  <h3>날짜별 식단</h3>
                  <span>평균 {mealPlan.averageCalories.toLocaleString()} kcal</span>
                </div>

                {mealPlan.days.map((dayMeal) => (
                  <DayMealCard
                    dayMeal={dayMeal}
                    favoriteFoodNames={favoriteFoodNames}
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
                  <ShoppingListRow
                    isFavorite={favoriteFoodNames.has(item.name)}
                    item={item}
                    key={item.id}
                    onFavoriteFoodToggle={onFavoriteFoodToggle}
                  />
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {!isAiLoading ? (
        <div className="buttonRow">
          <Button variant="weak" onClick={onBack}>
            {isSavedView ? "목록으로" : "목표 다시 선택"}
          </Button>
          <Button variant="weak" onClick={onRestart}>
            처음부터
          </Button>
        </div>
      ) : null}
    </section>
  );
}

interface AiMealPlanPanelProps {
  isAiLoading: boolean;
  aiError: string | null;
  target: NutritionTarget;
  mealPlan: MealPlan;
  onRetryAiGenerate: () => void;
}

interface AiMealPlanFailureScreenProps {
  aiError: string;
  target: NutritionTarget;
  onRetryAiGenerate: () => void;
}

function AiMealPlanFailureScreen({
  aiError,
  target,
  onRetryAiGenerate,
}: AiMealPlanFailureScreenProps) {
  return (
    <section className="aiFailureSection">
      <div className="aiFailureScreen" role="alert">
        <div>
          <p className="stepText">AI 식단 생성 실패</p>
          <h2>식단을 불러오지 못했어요</h2>
          <p>
            서버 응답이 없거나 일시적인 오류가 발생했습니다. 입력한 신체정보와
            목표는 유지되니 다시 시도할 수 있어요.
          </p>
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

        <p className="failureReason">
          {aiError.split("\n").map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </p>

        <Button color="dark" onClick={onRetryAiGenerate}>
          다시 생성하기
        </Button>
      </div>
    </section>
  );
}

// aiMealPlanResponse 대신 mealPlan.days에서 AI 데이터를 읽어 렌더링합니다.
function AiMealPlanPanel({
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
        <h3>AI 식단 결과</h3>
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

interface AiDayCardProps {
  dayMeal: DayMeal;
}

// 통합된 DayMeal에서 AI 식사명을 읽어 하루 식단을 요약합니다.
function AiDayCard({ dayMeal }: AiDayCardProps) {
  const breakfast = dayMeal.meals.find((m) => m.mealType === "breakfast");
  const lunch = dayMeal.meals.find((m) => m.mealType === "lunch");
  const dinner = dayMeal.meals.find((m) => m.mealType === "dinner");

  return (
    <article className="aiDayCard">
      <div className="dayMealHeader">
        <strong>{dayMeal.day}일차</strong>
        <span>{dayMeal.totalCalories.toLocaleString()} kcal</span>
      </div>

      <p>아침: {breakfast?.name ?? "-"}</p>
      <p>점심: {lunch?.name ?? "-"}</p>
      <p>저녁: {dinner?.name ?? "-"}</p>
    </article>
  );
}

interface DayMealCardProps {
  dayMeal: DayMeal;
  favoriteFoodNames: Set<string>;
  onFavoriteFoodToggle: (food: MealFood) => void;
}

// 하루치 식단을 카드로 보여주는 컴포넌트입니다.
function DayMealCard({
  dayMeal,
  favoriteFoodNames,
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
                isFavorite={favoriteFoodNames.has(food.name)}
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
function FoodRow({ food, isFavorite, onFavoriteFoodToggle }: FoodRowProps) {
  const shoppingHref = food.shoppingKeyword != null
    ? `https://www.coupang.com/np/search?q=${encodeURIComponent(food.shoppingKeyword)}`
    : SHOPPING_LINKS[food.shoppingCategory];
  console.log(food);
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
          href={shoppingHref}
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
  isFavorite: boolean;
  item: ShoppingListItem;
  onFavoriteFoodToggle: (food: MealFood) => void;
}

// 중복 재료를 합친 장보기 리스트 한 줄입니다.
function ShoppingListRow({
  isFavorite,
  item,
  onFavoriteFoodToggle,
}: ShoppingListRowProps) {
  const favoriteFood: MealFood = {
    id: item.id,
    name: item.name,
    amount: item.amountText,
    calories: item.totalCalories,
    shoppingCategory: item.shoppingCategory,
  };

  return (
    <div className="shoppingListRow">
      <div>
        <strong>{item.name}</strong>
        <span>
          {item.amountText} · {item.servingCount}회 ·{" "}
          {item.totalCalories.toLocaleString()} kcal
        </span>
      </div>
      <div className="foodRowActions">
        <button
          aria-label={`${item.name} 즐겨찾기`}
          className={
            isFavorite ? "favoriteFoodButton selected" : "favoriteFoodButton"
          }
          type="button"
          onClick={() => onFavoriteFoodToggle(favoriteFood)}
        >
          ★
        </button>
        <a
          className="buyFoodButton"
          href={
            item.shoppingKeyword != null
              ? `https://www.coupang.com/np/search?q=${encodeURIComponent(item.shoppingKeyword)}`
              : SHOPPING_LINKS[item.shoppingCategory]
          }
          rel="noopener noreferrer"
          target="_blank"
        >
          구매하기
        </a>
      </div>
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
