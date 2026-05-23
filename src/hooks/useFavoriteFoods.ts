import { useState } from "react";
import type { FavoriteFood } from "../types/fitplate";

export function useFavoriteFoods() {
  const [favoriteFoods, setFavoriteFoods] = useState<FavoriteFood[]>([]);

  return {
    favoriteFoods,
    setFavoriteFoods,
  };
}