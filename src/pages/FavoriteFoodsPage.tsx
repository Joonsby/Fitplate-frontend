import { useEffect } from "react";
import { useToast } from "../hooks/useToast";
import { FavoriteFoodsScreen } from "../components/screens/FavoriteFoodsScreen";
import { deleteFavoriteFood } from "../api/favoriteFoodsApi";
import type { FavoriteFood } from "../types/fitplate";

interface FavoriteFoodsPageProps {
  favoriteFoods: FavoriteFood[];
  setFavoriteFoods: React.Dispatch<React.SetStateAction<FavoriteFood[]>>;
  isLoading: boolean;
  onBack: () => void;
}

export function FavoriteFoodsPage({
  favoriteFoods,
  setFavoriteFoods,
  isLoading,
  onBack,
}: FavoriteFoodsPageProps) {
  const { showToast, toastElement } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDeleteFavoriteFood = async (favoriteFoodId: number) => {
    const foodName = favoriteFoods.find((f) => f.favoriteFoodId === favoriteFoodId)?.name;

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
    if (foodName) showToast(`${foodName}을 즐겨찾는 음식에서 삭제하였습니다.`, "error");
  };

  return (
    <>
      {toastElement}
      <FavoriteFoodsScreen
        favoriteFoods={favoriteFoods}
        isLoading={isLoading}
        onBack={onBack}
        onDelete={handleDeleteFavoriteFood}
      />
    </>
  );
}