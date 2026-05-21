import { Button, Badge } from "@toss/tds-mobile";
import { GOAL_LABELS } from "../constants/fitplate";
import { SHOPPING_LINKS } from "../data/shoppingLinks";
import { ScreenSectionHeader } from "./ScreenSectionHeader";
import type {
  AIDayMealPlan,
  AIMealPlanResponse,  
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

interface ResultScreenProps {
  profile: UserProfile;
  goal: GoalType;
  target: NutritionTarget;
  mealPlan: MealPlan;  
  favoriteFoods: FavoriteFood[];
  isSavedView: boolean;
  isAiLoading: boolean;
  aiError: string | null;
  aiMealPlanResponse: AIMealPlanResponse | null;
  savedAt?: string;  
  onFavoriteFoodToggle: (food: MealFood) => void;
  onRetryAiGenerate: () => void;
  onBack: () => void;
  onRestart: () => void;  
}



// 결과 화면 컴포넌트입니다.
// 규칙 기반 식단과 AI 응답을 함께 보여줍니다.
export function ResultScreen({
  profile,
  goal,
  target,
  mealPlan,  
  favoriteFoods,
  isSavedView,
  isAiLoading,
  aiError,
  aiMealPlanResponse,
  savedAt,  
  onFavoriteFoodToggle,
  onRetryAiGenerate,
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
  const shouldShowFallbackFailure = !isAiLoading && aiError != null && aiMealPlanResponse == null;  

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
          aiMealPlanResponse={aiMealPlanResponse}
          isAiLoading={isAiLoading}
          onRetryAiGenerate={onRetryAiGenerate}
        />
      ) : null}
      {!isAiLoading && aiMealPlanResponse != null ? (
        <>
          <ScreenSectionHeader
            description={`${profile.heightCm}cm, ${profile.weightKg}kg 기준 목표와 가장 가까운 ${mealPlan.targetCalories.toLocaleString()}kcal 식단입니다.`}
            step={isSavedView ? "저장된 식단" : "3단계"}
            title={`${GOAL_LABELS[goal]} 결과`}
          >
            {savedDate ? (
              <p className="savedAtText">저장 날짜: {savedDate}</p>
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

                <div className="autoSaveNotice">
                  <Badge size="large" color="blue" variant="weak">생성된 식단은 자동으로 저장되었어요.</Badge>
                </div>
              </div>

              <AiMealPlanPanel
                aiError={aiError}
                aiMealPlanResponse={aiMealPlanResponse}
                isAiLoading={isAiLoading}
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

// AI 응답을 보여주는 패널입니다.
// 아직 실제 API를 호출하지 않고, Promise 기반 mock JSON만 렌더링합니다.
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

        <p className="failureReason">{aiError}</p>

        <Button color="dark" onClick={onRetryAiGenerate}>
          다시 생성하기
        </Button>
      </div>
    </section>
  );
}

function AiMealPlanPanel({
  isAiLoading,
  aiError,
  aiMealPlanResponse,
  onRetryAiGenerate,
}: AiMealPlanPanelProps) {
if (isAiLoading) {
  return (
    <section className="loadingPanelSection">
      <div className="aiPanel loadingPanel">
        <div className="loadingSpinner" />

        <h3>AI가 식단을 생성하고 있어요</h3>
        <p>신체정보와 목표를 바탕으로 맞춤 식단을 구성하는 중입니다.</p>

        <div className="adBox">
          <span className="adLabel">AD</span>

          <strong>단백질 식단 준비 중이라면?</strong>

          <p>
            닭가슴살, 현미밥, 샐러드 재료를 미리 준비해보세요.
          </p>

          <button type="button">
            추천 재료 보기
          </button>
        </div>
      </div>
    </section>
  );
}

  if (aiError != null) {
    return (
      <section className="aiPanel error">
        <h3>AI 응답 오류</h3>
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
        <h3>AI 응답 대기</h3>
        <p>결과 보기 버튼을 누르면 AI 응답이 여기에 표시됩니다.</p>
      </section>
    );
  }

  return (
    <section className="aiPanel">
      <div className="aiPanelHeader">
        <div>
          <h3>AI 식단 결과</h3>
          <p>{aiMealPlanResponse.summary}</p>
        </div>
        <span>{aiMealPlanResponse.schemaVersion}</span>
      </div>

      <div className="aiMetaGrid">        
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
          href={SHOPPING_LINKS[item.shoppingCategory]}
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
