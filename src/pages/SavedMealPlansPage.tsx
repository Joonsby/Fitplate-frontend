import { useState, useEffect } from "react";
import { ConfirmDialog } from "@toss/tds-mobile";
import { useToast } from "../hooks/useToast";
import { useNavigate } from "react-router-dom";
import { SavedMealPlansScreen } from "../components/screens/SavedMealPlansScreen";
import { deleteSavedMealPlanById } from "../api/mealPlanStorageApi";
import type { SavedMealPlan } from "../types/fitplate";

interface SavedMealPlansPageProps {
  savedMealPlans: SavedMealPlan[];
  setSavedMealPlans: React.Dispatch<React.SetStateAction<SavedMealPlan[]>>;
  setViewingSavedMealPlan: React.Dispatch<
    React.SetStateAction<SavedMealPlan | null>
  >;
  isLoading: boolean;
  onBack: () => void;
}

export function SavedMealPlansPage({
  savedMealPlans,
  setSavedMealPlans,
  setViewingSavedMealPlan,
  isLoading,
  onBack,
}: SavedMealPlansPageProps) {
  const navigate = useNavigate();
  const { showToast, toastElement } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
        title={<ConfirmDialog.Title>저장된 식단을 삭제하시겠습니까?</ConfirmDialog.Title>}
        description={
          <ConfirmDialog.Description>
            {'식단을 삭제 하시면 되돌릴수 없습니다.'}
          </ConfirmDialog.Description>
        }
        cancelButton={<ConfirmDialog.CancelButton onClick={handleCancelDelete}>취소</ConfirmDialog.CancelButton>}
        confirmButton={<ConfirmDialog.ConfirmButton onClick={() => void handleConfirmDelete()}>확인</ConfirmDialog.ConfirmButton>}
        onClose={handleCancelDelete}
      />
      <SavedMealPlansScreen
        savedMealPlans={savedMealPlans}
        isLoading={isLoading}
        onBack={onBack}
        onDelete={handleDeleteSavedMealPlan}
        onView={handleViewSavedMealPlan}
      />
    </>
  );
}