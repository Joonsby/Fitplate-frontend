// AI 식단 생성 완전 실패 시 보여주는 전체 화면 컴포넌트입니다.
import "./AiMealPlanFailureScreen.css";
import { Button } from "../common/Button";
import { AlertIcon } from "../common/Icons";
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
    <section className="aiFailure" role="alert">
      <div className="aiFailureHead">
        <span className="aiFailureIcon" aria-hidden="true">
          <AlertIcon />
        </span>
        <h1>식단을 만들지 못했어요</h1>
        <p>
          일시적인 오류가 생겼어요. 입력한 정보와 목표는 그대로 있으니 다시
          시도해 주세요.
        </p>
        <p className="failureReason">
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
      </div>

      <NutritionPanel target={target} />
    </section>
  );
}
