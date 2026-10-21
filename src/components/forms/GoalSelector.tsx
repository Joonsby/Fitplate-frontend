// 목표(감량·유지·증량)를 고르고 AI 식단 생성을 시작하는 화면입니다.
import "../../styles/layout.css";
import "./GoalSelector.css";
import { GOAL_DESCRIPTIONS, GOAL_LABELS } from "../../types/fitplate";
import { ScreenSectionHeader } from "../common/ScreenSectionHeader";
import { StepProgress } from "../common/StepProgress";
import { Button } from "../common/Button";
import { SparkleIcon, TrendIcon } from "../common/Icons";
import type { GenerationStatus, GoalType } from "../../types/fitplate";
import type { GenerationQuota } from "../../api/mealPlanApi";
import { useState } from "react";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { PlanDatePicker } from "./PlanDatePicker";
import { formatDateLabel } from "../../utils/date";

interface GoalSelectorProps {
  selectedGoal: GoalType;
  goalCalories: Record<GoalType, number>;
  isOnboarding: boolean;
  onGoalChange: (goal: GoalType) => void;
  // replaceDate 가 true 면 그날 있던 식단 대신 새 식단을 넣는다
  onNext: (replaceDate: boolean) => void;
  planDate: string | null;
  takenDates: ReadonlySet<string>;
  onPlanDateChange: (planDate: string | null) => void;
  generationStatus: GenerationStatus;
  onStartGenerating: () => void;
  isAdLoaded: boolean;
  showAd: (onComplete?: (wasWatched: boolean) => void) => void;
  // null 이면 아직 모르거나 불러오지 못한 것. 그때는 광고를 보여준다
  quota: GenerationQuota | null;
}

const GOALS: GoalType[] = ["lose", "maintain", "gain"];

const GOAL_TREND = {
  lose: "down",
  maintain: "flat",
  gain: "up",
} as const satisfies Record<GoalType, "down" | "flat" | "up">;

export function GoalSelector({
  selectedGoal,
  goalCalories,
  isOnboarding,
  onGoalChange,
  onNext,
  generationStatus,
  onStartGenerating,
  isAdLoaded,
  showAd,
  quota,
  planDate,
  takenDates,
  onPlanDateChange,
}: GoalSelectorProps) {
  const [confirmReplace, setConfirmReplace] = useState(false);
  const dateTaken = planDate != null && takenDates.has(planDate);
  const isGenerating = generationStatus === "generating";
  const noneLeft = quota != null && quota.remaining === 0;
  // 하루 첫 생성과 실패한 뒤 다시 만들 때는 광고를 보여주지 않는다
  const showsAd = isAdLoaded && (quota?.adRequired ?? true) && generationStatus !== "failed";
  const quotaNote =
    quota == null
      ? null
      : noneLeft
        ? "오늘은 다 만들었어요. 저장한 식단을 다른 날에 다시 쓰거나 끼니를 바꿔 보세요."
        : !quota.adRequired
          ? "오늘 첫 식단은 광고 없이 만들어요."
          : `오늘 ${quota.remaining}번 더 만들 수 있어요.`;

  // 광고를 기다리지 않고 바로 생성을 시작한다. 광고는 그 위에 띄워 생성 시간과 겹친다
  const startGenerating = (replaceDate: boolean) => {
    setConfirmReplace(false);
    onStartGenerating();
    onNext(replaceDate);
    if (showsAd) showAd();
  };

  // 그날 식단이 이미 있으면 AI 를 부르기 전에 바꿀지 묻는다
  const handleClickResult = () => {
    if (isGenerating || noneLeft) return;
    if (dateTaken) {
      setConfirmReplace(true);
      return;
    }
    startGenerating(false);
  };

  return (
    <section className="screen goalScreen">
      <ScreenSectionHeader
        step={isOnboarding ? <StepProgress current={2} total={2} /> : undefined}
        title={
          <>
            어떤 목표로
            <br />
            식단을 짤까요?
          </>
        }
        description="고른 목표에 맞춰 하루 칼로리가 정해져요."
      />

      <div className="goalList" role="radiogroup" aria-label="목표">
        {GOALS.map((goal) => {
          const selected = goal === selectedGoal;
          return (
            <button
              key={goal}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`goalCard${selected ? " isSelected" : ""}`}
              onClick={() => onGoalChange(goal)}
            >
              <span className="goalIcon" aria-hidden="true">
                <TrendIcon direction={GOAL_TREND[goal]} />
              </span>
              <span className="goalText">
                <strong>{GOAL_LABELS[goal]}</strong>
                <span>{GOAL_DESCRIPTIONS[goal]}</span>
              </span>
              <span className="goalKcal">
                <strong>{goalCalories[goal].toLocaleString()}</strong>
                kcal
              </span>
            </button>
          );
        })}
      </div>

      <p className="goalNote">
        TDEE는 현재 활동량을 기준으로 하루에 쓰는 총 칼로리예요.
      </p>

      <PlanDatePicker planDate={planDate} takenDates={takenDates} onChange={onPlanDateChange} />

      {quotaNote ? (
        <p className={`goalQuota${noneLeft ? " isEmpty" : ""}`} role="status">
          {quotaNote}
        </p>
      ) : null}

      <Button
        className={`goalSubmit${quotaNote ? " hasQuota" : ""}`}
        block
        onClick={handleClickResult}
        disabled={isGenerating || noneLeft}
      >
        {isGenerating ? (
          "식단 만드는 중…"
        ) : noneLeft ? (
          "오늘은 다 만들었어요"
        ) : (
          <>
            <SparkleIcon />
            AI 식단 만들기
            {showsAd ? " (AD)" : null}
          </>
        )}
      </Button>
      <ConfirmDialog
        open={confirmReplace}
        title={`${planDate ? formatDateLabel(planDate) : ""}에는 다른 식단이 있어요`}
        description="새 식단으로 바꿀까요? 기존 식단은 날짜 지정만 풀리고 저장 식단에는 남아요."
        confirmLabel="새 식단으로 바꾸기"
        confirmVariant="primary"
        onConfirm={() => startGenerating(true)}
        onCancel={() => setConfirmReplace(false)}
      />
    </section>
  );
}
