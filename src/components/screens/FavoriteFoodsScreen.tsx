// 즐겨찾기한 음식 목록을 보여주고 구매·삭제를 연결합니다.
import "../../styles/layout.css";
import "../common/FoodRow.css";
import "./FavoriteFoodsScreen.css";
import { useState } from "react";
import { getShoppingHref } from "../../utils/shoppingHref";
import { CoupangDisclosure } from "../common/CoupangDisclosure";
import { ScreenSectionHeader } from "../common/ScreenSectionHeader";
import { EmptyState } from "../common/EmptyState";
import { SkeletonList } from "../common/SkeletonList";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { Button } from "../common/Button";
import { CartIcon, StarIcon } from "../common/Icons";
import type { FavoriteFood } from "../../types/fitplate";

interface FavoriteFoodsScreenProps {
  favoriteFoods: FavoriteFood[];
  isLoading: boolean;
  onDelete: (id: number) => void;
}

export function FavoriteFoodsScreen({
  favoriteFoods,
  isLoading,
  onDelete,
}: FavoriteFoodsScreenProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  return (
    <>
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="즐겨찾기에서 뺄까요?"
        description="식단 결과 화면에서 별을 눌러 다시 추가할 수 있어요."
        confirmLabel="삭제"
        onConfirm={() => {
          if (pendingDeleteId !== null) {
            onDelete(pendingDeleteId);
          }
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />

      <section className="screen">
        <ScreenSectionHeader
          title="즐겨찾기"
          description="자주 찾는 음식일수록 위에 보여요."
        />

        {isLoading && favoriteFoods.length === 0 ? (
          <SkeletonList />
        ) : favoriteFoods.length === 0 ? (
          <EmptyState
            icon={<StarIcon />}
            title="아직 즐겨찾기한 음식이 없어요"
            description="식단 결과에서 음식 옆의 별을 누르면 여기에 모여요."
          />
        ) : (
          <>
            <CoupangDisclosure />
            <div className="card favoriteFoodCard">
              <div className="foodList">
                {favoriteFoods.map((food) => (
                  <div className="foodRow" key={food.favoriteFoodId}>
                    <div className="foodRowInfo">
                      <strong>{food.name}</strong>
                      <span>
                        {food.amount} · {food.calories} kcal
                      </span>
                    </div>
                    <div className="foodRowActions">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() =>
                          window.open(
                            getShoppingHref(
                              food.shoppingCategory,
                              food.shoppingKeyword,
                              food.name,
                            ),
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                      >
                        <CartIcon />
                        구매
                      </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        onClick={() => setPendingDeleteId(food.favoriteFoodId)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
