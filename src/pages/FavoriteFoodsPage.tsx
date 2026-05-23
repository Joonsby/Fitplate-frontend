import { FavoriteFoodsScreen } from "../components/FavoriteFoodsScreen";
import { deleteMealPlanFavorite } from "../api/mealPlanStorageApi";
import type { FavoriteFood } from "../types/fitplate";

interface FavoriteFoodsPageProps {
  favoriteFoods: FavoriteFood[];
  setFavoriteFoods: React.Dispatch<React.SetStateAction<FavoriteFood[]>>;
  fallbackMealPlanId: string;
  onBack: () => void;
}

export function FavoriteFoodsPage({
  favoriteFoods,
  setFavoriteFoods,
  fallbackMealPlanId,
  onBack,
}: FavoriteFoodsPageProps) {
  const handleDeleteFavoriteFood = async (id: string) => {
    const mealPlanId = id.includes(":") ? id.split(":")[0] : fallbackMealPlanId;

    try {
      await deleteMealPlanFavorite(mealPlanId);
    } catch (error) {
      console.error("즐겨찾기 삭제 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "즐겨찾기 삭제 중 알 수 없는 오류가 발생했습니다.",
      );
      return;
    }

    setFavoriteFoods((currentFavoriteFoods) =>
      currentFavoriteFoods.filter((favoriteFood) => favoriteFood.id !== id),
    );
  };

  return (
    <FavoriteFoodsScreen
      favoriteFoods={favoriteFoods}
      onBack={onBack}
      onDelete={handleDeleteFavoriteFood}
    />
  );
}