import { Button } from "@toss/tds-mobile";
import { SHOPPING_LINKS } from "../data/shoppingLinks";
import type { FavoriteFood } from "../types/fitplate";

interface FavoriteFoodsScreenProps {
  favoriteFoods: FavoriteFood[];
  onBack: () => void;
  onDelete: (id: string) => void;
}

// 즐겨찾기 음식 목록 화면입니다.
// favoriteFoods는 App state에서 내려받고, 여기서는 화면 표시만 담당합니다.
export function FavoriteFoodsScreen({
  favoriteFoods,
  onBack,
  onDelete,
}: FavoriteFoodsScreenProps) {
  return (
    <section className="screen">
      <div className="sectionHeader">
        <p className="stepText">즐겨찾기</p>
        <h2>즐겨찾기 음식</h2>
        <p>자주 사용하는 음식일수록 목록 위에 표시됩니다.</p>
      </div>

      {favoriteFoods.length === 0 ? (
        <div className="emptySavedList">
          <strong>아직 즐겨찾기한 음식이 없어요</strong>
          <p>결과 화면에서 음식 옆의 별 버튼을 눌러 추가할 수 있습니다.</p>
        </div>
      ) : (
        <div className="favoriteFoodList">
          {favoriteFoods.map((favoriteFood) => (
            <article className="favoriteFoodCard" key={favoriteFood.id}>
              <div>
                <strong>{favoriteFood.name}</strong>
                <p>사용 {favoriteFood.useCount}회</p>
              </div>

              <div className="favoriteFoodActions">
                <a
                  href={SHOPPING_LINKS[favoriteFood.shoppingCategory]}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  구매하기
                </a>
                <button type="button" onClick={() => onDelete(favoriteFood.id)}>
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Button variant="weak" onClick={onBack}>
        돌아가기
      </Button>
    </section>
  );
}
