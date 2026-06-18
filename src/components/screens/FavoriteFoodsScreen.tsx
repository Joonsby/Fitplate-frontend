import { Button } from "@toss/tds-mobile";
import { SHOPPING_LINKS } from "../../data/shoppingLinks";
import { ScreenSectionHeader } from "../common/ScreenSectionHeader";
import type { FavoriteFood } from "../../types/fitplate";

interface FavoriteFoodsScreenProps {
  favoriteFoods: FavoriteFood[];
  onBack: () => void;
  onDelete: (id: number) => void;
}

export function FavoriteFoodsScreen({
  favoriteFoods,
  onBack,
  onDelete,
}: FavoriteFoodsScreenProps) {
  console.log(JSON.stringify(favoriteFoods,null,2));
  return (
    <section className="screen">
      <ScreenSectionHeader
        description="자주 사용하는 음식일수록 목록 위에 표시됩니다."
        step="즐겨찾기"
        title="즐겨찾기 음식"
      />

      <div className="favoriteFoodsContent">
        {favoriteFoods.length === 0 ? (
          <div className="emptySavedList">
            <strong>아직 즐겨찾기한 음식이 없어요</strong>
            <p>결과 화면에서 음식 옆의 별 버튼을 눌러 추가할 수 있습니다.</p>
          </div>
        ) : (
          <div className="favoriteFoodList">
            {favoriteFoods.map((food) => (
              <div className="foodRow" key={food.favoriteFoodId}>
                <div>
                  <strong>{food.name}</strong>
                  <span>
                    {food.amount} · {food.calories} kcal
                  </span>
                </div>
                <div className="foodRowActions">
                  <Button
                    size="medium"
                    onClick={() => window.open(SHOPPING_LINKS[food.shoppingCategory], "_blank", "noopener,noreferrer")}
                  >
                    구매하기
                  </Button>
                  <Button
                    size="medium"
                    variant="weak"
                    onClick={() => onDelete(food.favoriteFoodId)}>
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button variant="weak" onClick={onBack}>
          돌아가기
        </Button>
      </div>
    </section>
  );
}
