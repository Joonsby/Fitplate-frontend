import { useState } from "react";
import { Button, ConfirmDialog } from "@toss/tds-mobile";
import { getShoppingHref } from "../../utils/shoppingHref";
import { ScreenSectionHeader } from "../common/ScreenSectionHeader";
import { EmptyState } from "../common/EmptyState";
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
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  return (
    <>
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="즐겨찾기 삭제"
        description="이 음식을 즐겨찾기에서 삭제하시겠습니까?"
        confirmButton={
          <ConfirmDialog.ConfirmButton
            onClick={() => {
              if (pendingDeleteId !== null) {
                onDelete(pendingDeleteId);
              }
              setPendingDeleteId(null);
            }}
          >
            삭제
          </ConfirmDialog.ConfirmButton>
        }
        cancelButton={
          <ConfirmDialog.CancelButton onClick={() => setPendingDeleteId(null)}>
            취소
          </ConfirmDialog.CancelButton>
        }
        onClose={() => setPendingDeleteId(null)}
      />

      <section className="screen">
        <ScreenSectionHeader
          description="자주 사용하는 음식일수록 목록 위에 표시됩니다."
          step="즐겨찾기"
          title="즐겨찾기 음식"
        />

        <div className="favoriteFoodsContent">
          {favoriteFoods.length === 0 ? (
            <EmptyState
              title="아직 즐겨찾기한 음식이 없어요"
              description="결과 화면에서 음식 옆의 별 버튼을 눌러 추가할 수 있습니다."
            />
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
                      onClick={() => window.open(getShoppingHref(food.shoppingCategory, food.shoppingKeyword), "_blank", "noopener,noreferrer")}
                    >
                      구매하기
                    </Button>
                    <Button
                      size="medium"
                      variant="weak"
                      onClick={() => setPendingDeleteId(food.favoriteFoodId)}
                    >
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
    </>
  );
}
