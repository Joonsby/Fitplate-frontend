import { useToast } from "../hooks/useToast";
import { FavoriteFoodsScreen } from "../components/FavoriteFoodsScreen";
import { deleteFavoriteFood } from "../api/favoriteFoodsApi";
import type { FavoriteFood } from "../types/fitplate";

interface FavoriteFoodsPageProps {
  favoriteFoods: FavoriteFood[];
  setFavoriteFoods: React.Dispatch<React.SetStateAction<FavoriteFood[]>>;
  onBack: () => void;
}

export function FavoriteFoodsPage({
  favoriteFoods,
  setFavoriteFoods,
  onBack,
}: FavoriteFoodsPageProps) {
  const { showToast, toastElement } = useToast();

  const handleDeleteFavoriteFood = async (favoriteFoodId: number) => {
    try {
      await deleteFavoriteFood(favoriteFoodId);
    } catch (error) {
      console.error("즐겨찾기 삭제 실패:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "즐겨찾기 삭제 중 알 수 없는 오류가 발생했습니다.",
        "error",
      );
      return;
    }

    setFavoriteFoods((currentFavoriteFoods) =>
      currentFavoriteFoods.filter((favoriteFood) => favoriteFood.favoriteFoodId !== favoriteFoodId),
    );
  };

  return (
    <>
      {toastElement}
      <FavoriteFoodsScreen
        favoriteFoods={favoriteFoods}
        onBack={onBack}
        onDelete={handleDeleteFavoriteFood}
      />
    </>
  );
}