// 기록 탭의 영양 통계 — 최근 7일·30일의 평균 섭취와 식단 계획·목표 비교, 날짜별 섭취 그래프입니다.
// 모든 숫자는 서버가 계산한 값이고, 평균은 한 끼 이상 체크한 날로만 냅니다.
import "./NutritionStatsSection.css";
import "../common/SkeletonList.css";
import { useCallback, useEffect, useState } from "react";
import { getRecords } from "../../api/mealIntakeApi";
import type { NutritionTotals, RecordsResponse } from "../../api/mealIntakeApi";
import { NutritionBarChart } from "./NutritionBarChart";
import { addDays, todayString } from "../../utils/date";

const PERIODS = [
  { key: "week", label: "최근 7일", days: 7 },
  { key: "month", label: "최근 30일", days: 30 },
] as const;

const MACROS: { key: keyof Omit<NutritionTotals, "calories">; label: string }[] = [
  { key: "carbohydrate", label: "탄수화물" },
  { key: "protein", label: "단백질" },
  { key: "fat", label: "지방" },
];

interface NutritionStatsSectionProps {
  // 섭취 체크가 바뀔 때마다 늘어나 통계를 다시 불러오게 한다
  refreshKey: number;
  onError: (message: string) => void;
}

export function NutritionStatsSection({ refreshKey, onError }: NutritionStatsSectionProps) {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("week");
  const [data, setData] = useState<RecordsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const days = PERIODS.find((item) => item.key === period)!.days;
  const to = todayString();
  const from = addDays(to, -(days - 1));

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setData(await getRecords(from, to));
    } catch (error) {
      onError(error instanceof Error ? error.message : "통계를 불러오지 못했어요.");
    } finally {
      setIsLoading(false);
    }
  }, [from, to, onError]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const summary = data?.summary;
  const eaten = summary?.averageEaten ?? null;
  const planned = summary?.averagePlanned ?? null;
  const target = summary?.averageTarget ?? null;

  return (
    <section className="card statsCard" aria-label="영양 통계">
      <div className="statsHead">
        <h2>영양 통계</h2>
      </div>
      <div className="segmented" role="radiogroup" aria-label="기간">
        {PERIODS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="radio"
            aria-checked={period === item.key}
            className={period === item.key ? "isSelected" : undefined}
            onClick={() => setPeriod(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading && data == null ? (
        <span className="fpSkeletonLine statsSkeleton" />
      ) : summary ? (
        <>
          <p className="statsCoverage">
            {summary.totalDays}일 중 <strong>{summary.recordedDays}일</strong> 기록
            {summary.averageCompletionRate != null
              ? ` · 평균 완료율 ${Math.round(summary.averageCompletionRate * 100)}%`
              : ""}
          </p>

          {summary.recordedDays === 0 ? (
            <p className="statsEmpty">
              이 기간에 먹었다고 체크한 끼니가 없어요. 기록이 없는 날은 섭취량 0이 아니라 통계에서 빠져요.
            </p>
          ) : (
            <>
              <dl className="statsCalories">
                <div className="isEaten">
                  <dt>평균 실제 섭취</dt>
                  <dd>{eaten?.calories.toLocaleString()}<small>kcal</small></dd>
                </div>
                <div>
                  <dt>평균 식단 계획</dt>
                  <dd>{planned?.calories.toLocaleString()}<small>kcal</small></dd>
                </div>
                <div>
                  <dt>평균 목표</dt>
                  <dd>{target?.calories.toLocaleString()}<small>kcal</small></dd>
                </div>
              </dl>

              <ul className="statsMacros">
                {MACROS.map((macro) => {
                  const value = eaten?.[macro.key] ?? 0;
                  const goal = target?.[macro.key] ?? 0;
                  const ratio = goal > 0 ? value / goal : 0;
                  return (
                    <li key={macro.key}>
                      <div className="statsMacroText">
                        <span>{macro.label}</span>
                        <strong>
                          {Math.round(value)}g <small>/ 목표 {Math.round(goal)}g</small>
                        </strong>
                      </div>
                      <div
                        className="statsMeter"
                        role="meter"
                        aria-label={`${macro.label} 목표 대비`}
                        aria-valuemin={0}
                        aria-valuemax={150}
                        aria-valuenow={Math.round(ratio * 100)}
                      >
                        <span style={{ width: `${Math.min(ratio, 1.5) * (100 / 1.5)}%` }} />
                        <i style={{ left: `${100 / 1.5}%` }} aria-hidden="true" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {data && (summary.recordedDays > 0 || summary.plannedDays > 0) ? <NutritionBarChart days={data.days} /> : null}
        </>
      ) : null}
    </section>
  );
}
