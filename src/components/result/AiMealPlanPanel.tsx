import { useNavigate } from "react-router-dom";
import { Button, Loader, BottomCTA, Stepper, StepperRow } from "@toss/tds-mobile";
import logo from "../../assets/images/logo.png";
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
  const navigate = useNavigate();  
  if (isAiLoading) {
    return (
      <main className="appShell aiLoadingShell">
        <img src={logo} alt="Fitplate" className="aiLoadingLogo" />

        <div className="aiLoadingCenter">
          <Loader size="large" label="AI가 식단을 생성하고 있어요" />
        </div>

        <div className="aiLoadingSteps">
          <Stepper delay={1}>
            <StepperRow
              left={<StepperRow.NumberIcon number={1} />}
              center={
                <StepperRow.Texts
                  type="A"
                  title="사용자 프로필 반영"
                  description="신체정보와 목표를 바탕으로 맞춤 식단을 구성하는 중입니다."
                />
              }
            />
            <StepperRow
              left={<StepperRow.NumberIcon number={2} />}
              center={
                <StepperRow.Texts
                  type="A"
                  title="AI 식단 자동 생성﹒저장"
                  description="화면을 닫아도 생성이 완료되면 저장된 식단에 보관돼요."
                />
              }
            />
            <StepperRow
              left={<StepperRow.NumberIcon number={3} />}
              center={
                <StepperRow.Texts
                  type="A"
                  title="식단 생성 소요시간" 
                  description="식단 생성은 1~2분 정도 소요될수 있어요."
                />
              }
              hideLine
            />
          </Stepper>
        </div>

        <div className="aiLoadingCtaWrap">
          <BottomCTA.Single onClick={() => navigate(-1)}>뒤로 가기</BottomCTA.Single>
        </div>
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
        <Button color="danger" variant="fill" onClick={onRetryAiGenerate}>다시 생성하기</Button>
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
