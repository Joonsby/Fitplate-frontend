import { useNavigate } from "react-router-dom";
import { SavedMealPlansScreen } from "../components/SavedMealPlansScreen";
import { deleteSavedMealPlanById } from "../api/mealPlanStorageApi";
import type { AIMealPlanResponse, SavedMealPlan } from "../types/fitplate";

interface SavedMealPlansPageProps {
  savedMealPlans: SavedMealPlan[];
  setSavedMealPlans: React.Dispatch<React.SetStateAction<SavedMealPlan[]>>;
  setViewingSavedMealPlan: React.Dispatch<
    React.SetStateAction<SavedMealPlan | null>
  >;
  restoreAiMealPlan: (response: AIMealPlanResponse | null) => void;
  onBack: () => void;
}

export function SavedMealPlansPage({
  savedMealPlans,
  setSavedMealPlans,
  setViewingSavedMealPlan,
  restoreAiMealPlan,
  onBack,
}: SavedMealPlansPageProps) {
  const navigate = useNavigate();

  const handleDeleteSavedMealPlan = async (id: string) => {
    try {
      await deleteSavedMealPlanById(id);
    } catch (error) {
      console.error("식단 삭제 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "식단 삭제 중 알 수 없는 오류가 발생했습니다.",
      );
      return;
    }

    setSavedMealPlans((currentSavedMealPlans) =>
      currentSavedMealPlans.filter((savedMealPlan) => savedMealPlan.id !== id),
    );
  };

  const handleViewSavedMealPlan = (savedMealPlan: SavedMealPlan) => {
    setViewingSavedMealPlan(savedMealPlan);
    restoreAiMealPlan(savedMealPlan.aiResponse ?? null);
    navigate("/result");
  };

  return (
    <SavedMealPlansScreen
      savedMealPlans={savedMealPlans}
      onBack={onBack}
      onDelete={handleDeleteSavedMealPlan}
      onView={handleViewSavedMealPlan}
    />
  );
}