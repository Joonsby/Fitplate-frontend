import { useState, useEffect } from "react";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { useToast } from "../hooks/useToast";
import { useNavigate } from "react-router-dom";
import { SavedMealPlansScreen } from "../components/screens/SavedMealPlansScreen";
import { deleteSavedMealPlanById } from "../api/mealPlanStorageApi";
import type { SavedMealPlan } from "../types/fitplate";
import { formatDateLabel } from "../utils/date";
import { TextInputSheet } from "../components/common/TextInputSheet";
import { PlanDateSheet } from "../components/result/PlanDateSheet";

interface SavedMealPlansPageProps {
  savedMealPlans: SavedMealPlan[];
  setSavedMealPlans: React.Dispatch<React.SetStateAction<SavedMealPlan[]>>;
  setViewingSavedMealPlan: React.Dispatch<
    React.SetStateAction<SavedMealPlan | null>
  >;
  isLoading: boolean;
  onCreate: () => void;
  pendingScheduleDate: string | null;
  onCancelPendingSchedule: () => void;
  onRename: (mealPlanId: string, title: string | null) => Promise<void>;
  onSchedule: (mealPlanId: string, planDate: string, replace: boolean) => Promise<unknown>;
}

export function SavedMealPlansPage({
  savedMealPlans,
  setSavedMealPlans,
  setViewingSavedMealPlan,
  isLoading,
  onCreate,
  pendingScheduleDate,
  onCancelPendingSchedule,
  onRename,
  onSchedule,
}: SavedMealPlansPageProps) {
  const navigate = useNavigate();
  const { showToast, toastElement } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<SavedMealPlan | null>(null);
  const [dateTarget, setDateTarget] = useState<SavedMealPlan | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDeleteSavedMealPlan = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    if (pendingDeleteId == null) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);

    try {
      await deleteSavedMealPlanById(id);
    } catch (error) {
      console.error("식단 삭제 실패:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "식단 삭제 중 알 수 없는 오류가 발생했습니다.",
        "error",
      );
      return;
    }

    setSavedMealPlans((currentSavedMealPlans) =>
      currentSavedMealPlans.filter((savedMealPlan) => savedMealPlan.id !== id),
    );
    showToast("식단이 삭제되었습니다.", "success");
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const handleViewSavedMealPlan = (savedMealPlan: SavedMealPlan) => {
    setViewingSavedMealPlan(savedMealPlan);
    navigate("/result", { state: { source: "savedMealPlan" } });
  };

  return (
    <>
      {toastElement}
      <ConfirmDialog
        open={confirmOpen}
        title="저장된 식단을 삭제할까요?"
        description={
          savedMealPlans.find((plan) => plan.id === pendingDeleteId)?.planDate
            ? "이 식단으로 남긴 섭취 기록도 함께 지워지고 되돌릴 수 없어요."
            : "삭제한 식단은 되돌릴 수 없어요."
        }
        confirmLabel="삭제"
        onConfirm={() => void handleConfirmDelete()}
        onCancel={handleCancelDelete}
      />
      {pendingScheduleDate ? (
        <div className="pendingScheduleBanner" role="status">
          <span>
            <strong>{formatDateLabel(pendingScheduleDate)}</strong>에 먹을 식단을 골라 주세요
          </span>
          <button type="button" className="textLink" onClick={onCancelPendingSchedule}>
            그만두기
          </button>
        </div>
      ) : null}
      <SavedMealPlansScreen
        savedMealPlans={savedMealPlans}
        isLoading={isLoading}
        onCreate={onCreate}
        onDelete={handleDeleteSavedMealPlan}
        onView={handleViewSavedMealPlan}
        onRename={setRenameTarget}
        onPickDate={setDateTarget}
      />
      {renameTarget ? (
        <TextInputSheet
          title="식단 이름 변경"
          label="식단 이름"
          initialValue={renameTarget.title}
          maxLength={30}
          onSave={(title) => onRename(renameTarget.id, title)}
          onClose={() => setRenameTarget(null)}
        />
      ) : null}
      {dateTarget ? (
        <PlanDateSheet
          planTitle={dateTarget.title}
          onSchedule={(planDate, replace) => onSchedule(dateTarget.id, planDate, replace)}
          onDone={(planDate) => showToast(`${formatDateLabel(planDate)} 식단으로 정했어요.`, "success")}
          onClose={() => setDateTarget(null)}
        />
      ) : null}
    </>
  );
}