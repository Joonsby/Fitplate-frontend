// 단백질, 탄수화물, 지방 값을 같은 모양으로 보여주는 작은 컴포넌트입니다.
import "./MacroItem.css";
export interface MacroItemProps {
  label: string;
  value: number;
  tone: "carbs" | "protein" | "fat";
}

export function MacroItem({ label, value, tone }: MacroItemProps) {
  return (
    <div className="macroItem">
      <span>
        <i className={`macroTone--${tone}`} aria-hidden="true" />
        {label}
      </span>
      <strong>
        {value}
        <small>g</small>
      </strong>
    </div>
  );
}
