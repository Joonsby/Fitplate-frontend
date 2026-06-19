// 한 일차 안의 아침·점심·저녁을 좌우 Swiper로 탐색하는 컴포넌트입니다.
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { FoodRow } from "./FoodRow";
import type { Meal, MealFood } from "../../types/fitplate";

interface MealSwiperProps {
  meals: Meal[];
  favoriteFoodNames: Set<string>;
  onFavoriteFoodToggle: (food: MealFood) => void;
}

export function MealSwiper({ meals, favoriteFoodNames, onFavoriteFoodToggle }: MealSwiperProps) {
  const [activeIndex, setActiveIndex] = useState(0);  

  return (
    <div className="mealSwiperRoot">
      <div className="mealSwiperHeader">
        <span className="mealSwiperLabel">          
          <span className="mealSwiperHint">좌우로 밀어 다른 끼니 보기</span>
        </span>
        <div className="mealSwiperNav">
          <span className="mealSwiperPos">{activeIndex + 1} / {meals.length}</span>
        </div>
      </div>

      <Swiper
        className="mealSwiperContainer"
        spaceBetween={12}
        slidesPerView={1}
        autoHeight={true}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
      >
        {meals.map((meal) => (
          <SwiperSlide key={meal.id}>
            <div className="mealCard">
              <div className="mealCardHeader">
                <strong>{meal.title}</strong>
                <span>{meal.calories} kcal</span>
              </div>
              <div className="foodList">
                {meal.foods.map((food) => (
                  <FoodRow
                    key={food.id}
                    food={food}
                    isFavorite={favoriteFoodNames.has(food.name)}
                    onFavoriteFoodToggle={onFavoriteFoodToggle}
                  />
                ))}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mealSwiperDots">
        {meals.map((_, i) => (
          <span key={i} className={`mealSwiperDot${i === activeIndex ? " active" : ""}`} />
        ))}
      </div>
    </div>
  );
}
