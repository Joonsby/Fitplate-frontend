// 좋아하는 음식·빼고 싶은 음식·알레르기 분류를 칩으로 고르게 합니다. 한 묶음에서 고르면 다른 묶음에서는 빠집니다.
import "./FoodPreferencePicker.css";
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS } from "../../types/fitplate";
import type { FoodCategory } from "../../types/fitplate";
import { CheckIcon } from "../common/Icons";

export interface FoodPreferenceSelection {
  preferred: FoodCategory[];
  excluded: FoodCategory[];
  allergies: FoodCategory[];
}

type PreferenceKind = keyof FoodPreferenceSelection;

interface FoodPreferencePickerProps {
  value: FoodPreferenceSelection;
  onChange: (next: FoodPreferenceSelection) => void;
}

const GROUPS: { kind: PreferenceKind; title: string; description: string }[] = [
  {
    kind: "preferred",
    title: "좋아하는 음식",
    description: "가능하면 식단에 넣어 드려요.",
  },
  {
    kind: "excluded",
    title: "빼고 싶은 음식",
    description: "식단에 넣지 않아요.",
  },
  {
    kind: "allergies",
    title: "알레르기",
    description:
      "소스·가공품까지 더 엄격하게 빼요. 다만 AI가 모든 성분을 걸러낼 수는 없으니 드시기 전에 성분표를 꼭 확인해 주세요.",
  },
];

export function FoodPreferencePicker({ value, onChange }: FoodPreferencePickerProps) {
  const toggle = (kind: PreferenceKind, category: FoodCategory) => {
    const adding = !value[kind].includes(category);
    const next: FoodPreferenceSelection = {
      preferred: value.preferred.filter((c) => c !== category),
      excluded: value.excluded.filter((c) => c !== category),
      allergies: value.allergies.filter((c) => c !== category),
    };
    if (adding) next[kind] = [...next[kind], category];
    onChange(next);
  };

  return (
    <section className="profileCard foodPrefCard" aria-label="음식 취향">
      {GROUPS.map((group) => (
        <fieldset className={`foodPrefGroup foodPrefGroup--${group.kind}`} key={group.kind}>
          <legend>{group.title}</legend>
          <p>{group.description}</p>
          <div className="foodPrefChips">
            {FOOD_CATEGORIES.map((category) => {
              const selected = value[group.kind].includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  className={`foodPrefChip foodPrefChip--${group.kind}${selected ? " isSelected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => toggle(group.kind, category)}
                >
                  {selected ? <CheckIcon /> : null}
                  {FOOD_CATEGORY_LABELS[category]}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </section>
  );
}
