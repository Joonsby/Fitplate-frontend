// AI 식단 생성 완전 실패 시 보여주는 전체 화면 컴포넌트입니다.
import { Button } from "@toss/tds-mobile";
import { NutritionPanel } from "../common/NutritionPanel";
import type { NutritionTarget } from "../../types/fitplate";

export interface AiMealPlanFailureScreenProps {
  aiError: string;
  target: NutritionTarget;
  onRetryAiGenerate: () => void;
}

export function AiMealPlanFailureScreen({
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

        <NutritionPanel target={target} />

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
