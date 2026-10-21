import { useEffect } from "react";
import { useToast } from "../hooks/useToast";
import { FavoriteFoodsScreen } from "../components/screens/FavoriteFoodsScreen";
import { deleteFavoriteFood } from "../api/favoriteFoodsApi";
import type { FavoriteFood } from "../types/fitplate";

interface FavoriteFoodsPageProps {
  favoriteFoods: FavoriteFood[];
  setFavoriteFoods: React.Dispatch<React.SetStateAction<FavoriteFood[]>>;
  isLoading: boolean;
}

export function FavoriteFoodsPage({
  favoriteFoods,
  setFavoriteFoods,
  isLoading,
}: FavoriteFoodsPageProps) {
  const { showToast, toastElement } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 목록에서 먼저 빼고, 실패하면 원래 자리로 되돌린다.
  const handleDeleteFavoriteFood = async (favoriteFoodId: number) => {
    const index = favoriteFoods.findIndex((f) => f.favoriteFoodId === favoriteFoodId);
    const removed = favoriteFoods[index];
    setFavoriteFoods((current) => current.filter((f) => f.favoriteFoodId !== favoriteFoodId));

    try {
      await deleteFavoriteFood(favoriteFoodId);
    } catch (error) {
      if (removed) {
        setFavoriteFoods((current) => [...current.slice(0, index), removed, ...current.slice(index)]);
      }
      console.error("즐겨찾기 삭제 실패:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "즐겨찾기 삭제 중 알 수 없는 오류가 발생했습니다.",
        "error",
      );
    }
  };

  return (
    <>
      {toastElement}
      <FavoriteFoodsScreen
        favoriteFoods={favoriteFoods}
        isLoading={isLoading}
        onDelete={handleDeleteFavoriteFood}
      />
    </>
  );
}