// 목록을 불러오는 동안 카드 모양 자리표시를 보여줍니다.
import "./SkeletonList.css";

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="fpSkeletonList" aria-busy="true" aria-label="불러오는 중">
      {Array.from({ length: count }, (_, i) => (
        <div className="fpSkeletonCard" key={i}>
          <span className="fpSkeletonLine" style={{ width: "42%" }} />
          <span className="fpSkeletonLine" style={{ width: "68%" }} />
          <span className="fpSkeletonLine isShort" style={{ width: "30%" }} />
        </div>
      ))}
    </div>
  );
}
