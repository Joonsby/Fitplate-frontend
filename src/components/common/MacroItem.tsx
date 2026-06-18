// 단백질, 탄수화물, 지방 값을 같은 모양으로 보여주는 작은 컴포넌트입니다.
export interface MacroItemProps {
  label: string;
  value: number;
}

export function MacroItem({ label, value }: MacroItemProps) {
  return (
    <div className="macroItem">
      <span>{label}</span>
      <strong>{value}g</strong>
    </div>
  );
}
