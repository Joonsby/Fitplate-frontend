// 기록 탭 — 날짜별 끼니 섭취 체크와 완료율, 영양 통계, 체중 기록을 모아 보여줍니다.
import "../styles/layout.css";
import { useCallback, useEffect, useState } from "react";
import { ScreenSectionHeader } from "../components/common/ScreenSectionHeader";
import { WeekStrip } from "../components/records/WeekStrip";
import { DayRecordCard } from "../components/records/DayRecordCard";
import { WeightSection } from "../components/records/WeightSection";
import { NutritionStatsSection } from "../components/records/NutritionStatsSection";
import { getRecords } from "../api/mealIntakeApi";
import type { DailyRecord, MealType } from "../api/mealIntakeApi";
import { addDays, startOfWeek, todayString } from "../utils/date";

interface RecordsPageProps {
  onToggleMealIntake: (mealPlanId: string, mealType: MealType, eaten: boolean) => Promise<boolean>;
  onOpenMealPlan: (mealPlanId: string) => void;
  onPickPlanForDate: (date: string) => void;
  // date 는 기록 탭에서 고른 날짜. 그 날짜로 먹을 새 식단을 만든다
  onCreate: (date: string) => void;
  onError: (message: string) => void;
}

// 서버 응답 전에 화면에 먼저 보여줄 체크 결과. 영양 합계는 서버 응답으로 다시 채운다.
function withLocalToggle(record: DailyRecord, mealType: MealType, eaten: boolean): DailyRecord {
  const meals = record.meals.map((meal) => (meal.mealType === mealType ? { ...meal, eaten } : meal));
  const eatenMeals = meals.filter((meal) => meal.eaten).length;
  return {
    ...record,
    meals,
    eatenMeals,
    completionRate: record.plannedMeals === 0 ? null : eatenMeals / record.plannedMeals,
    status: eatenMeals === 0 ? "NOT_RECORDED" : eatenMeals === record.plannedMeals ? "COMPLETE" : "PARTIAL",
  };
}

export function RecordsPage({
  onToggleMealIntake,
  onOpenMealPlan,
  onPickPlanForDate,
  onCreate,
  onError,
}: RecordsPageProps) {
  const [selectedDate, setSelectedDate] = useState(todayString());
  const [weekStart, setWeekStart] = useState(startOfWeek(todayString()));
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

  const replaceRecords = (fresh: DailyRecord[]) => {
    setRecords((current) => {
      const byDate = new Map(current.map((record) => [record.date, record]));
      fresh.forEach((record) => byDate.set(record.date, record));
      return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const loadWeek = useCallback(async (start: string) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await getRecords(start, addDays(start, 6));
      replaceRecords(response.days);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "기록을 불러오지 못했어요.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWeek(weekStart);
  }, [weekStart, loadWeek]);

  const selectedRecord = records.find((record) => record.date === selectedDate);

  const handleToggle = async (mealType: MealType, eaten: boolean) => {
    const record = selectedRecord;
    if (record?.mealPlanId == null) return;
    replaceRecords([withLocalToggle(record, mealType, eaten)]);
    const ok = await onToggleMealIntake(String(record.mealPlanId), mealType, eaten);
    if (!ok) {
      replaceRecords([record]);
      return;
    }
    setStatsRefreshKey((key) => key + 1);
    // 영양 합계와 완료율은 서버 계산값으로 맞춘다
    try {
      const response = await getRecords(record.date, record.date);
      replaceRecords(response.days);
    } catch {
      // 다음에 주를 다시 읽을 때 맞춰진다
    }
  };

  return (
    <section className="screen">
      <ScreenSectionHeader title="기록" description="먹은 끼니를 체크하면 하루 섭취량이 쌓여요." />

      <WeekStrip
        weekStart={weekStart}
        selectedDate={selectedDate}
        records={records}
        onSelect={setSelectedDate}
        onMoveWeek={(offset) => {
          const nextStart = addDays(weekStart, offset);
          setWeekStart(nextStart);
          setSelectedDate(nextStart <= todayString() && todayString() <= addDays(nextStart, 6) ? todayString() : nextStart);
        }}
      />

      {loadError ? (
        <p className="recordsError" role="alert">
          {loadError}{" "}
          <button type="button" className="textLink" onClick={() => void loadWeek(weekStart)}>
            다시 불러오기
          </button>
        </p>
      ) : null}

      <DayRecordCard
        record={selectedRecord}
        date={selectedDate}
        isLoading={isLoading}
        onToggle={(mealType, eaten) => void handleToggle(mealType, eaten)}
        onOpenMealPlan={onOpenMealPlan}
        onPickPlan={() => onPickPlanForDate(selectedDate)}
        onCreate={() => onCreate(selectedDate)}
      />

      <NutritionStatsSection refreshKey={statsRefreshKey} onError={onError} />

      <WeightSection onError={onError} />
    </section>
  );
}
