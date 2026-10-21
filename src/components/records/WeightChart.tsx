// 기간 안 체중 변화를 선 하나로 그리고, 목표 체중을 이름 붙은 기준선으로 보여줍니다.
// 계열이 하나라 범례 대신 카드 제목이 이름을 맡고, 누르거나 올리면 가장 가까운 날의 값을 띄웁니다.
import "./WeightChart.css";
import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { WeightRecord } from "../../api/weightApi";
import { formatShortDate, parseDateString } from "../../utils/date";

interface WeightChartProps {
  records: WeightRecord[];
  from: string;
  to: string;
  targetWeight: number | null;
}

const W = 320;
const H = 176;
const PAD = { left: 36, right: 16, top: 16, bottom: 26 };

function dayIndex(from: string, date: string) {
  return Math.round(
    (parseDateString(date).getTime() - parseDateString(from).getTime()) /
      86400000,
  );
}

export function WeightChart({
  records,
  from,
  to,
  targetWeight,
}: WeightChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalDays = Math.max(1, dayIndex(from, to));
  const values = records.map((record) => record.weight);
  if (targetWeight != null) values.push(targetWeight);
  const low = values.length ? Math.floor(Math.min(...values) - 0.5) : 60;
  const high = values.length ? Math.ceil(Math.max(...values) + 0.5) : 70;
  const min = high - low < 2 ? low - 1 : low;
  const max = high - low < 2 ? high + 1 : high;

  const x = (date: string) =>
    PAD.left + (dayIndex(from, date) / totalDays) * (W - PAD.left - PAD.right);
  const y = (weight: number) =>
    PAD.top + ((max - weight) / (max - min)) * (H - PAD.top - PAD.bottom);
  const ticks = [min, (min + max) / 2, max];
  const points = records.map((record) => ({
    ...record,
    cx: x(record.date),
    cy: y(record.weight),
  }));
  const path = points
    .map(
      (point, i) =>
        `${i === 0 ? "M" : "L"}${point.cx.toFixed(1)},${point.cy.toFixed(1)}`,
    )
    .join(" ");

  const handlePointer = (event: PointerEvent<SVGRectElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || points.length === 0) return;
    const svgX = ((event.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    points.forEach((point, i) => {
      if (Math.abs(point.cx - svgX) < Math.abs(points[nearest].cx - svgX))
        nearest = i;
    });
    setActiveIndex(nearest);
  };

  const active = activeIndex != null ? points[activeIndex] : null;
  const latest = points[points.length - 1];

  if (records.length === 0) {
    return <p className="weightChartEmpty">이 기간에 체중 기록이 없어요. 기록하면 변화가 그래프로 보여요.</p>;
  }

  return (
    <div className="weightChart">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={
          records.length
            ? `${formatShortDate(from)}부터 ${formatShortDate(to)}까지 체중 ${records.length}개 기록, 최근 ${latest?.weight}kg`
            : "이 기간에 체중 기록이 없어요"
        }
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              className="weightGrid"
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
            />
            <text
              className="weightAxis"
              x={PAD.left - 6}
              y={y(tick) + 4}
              textAnchor="end"
            >
              {Number.isInteger(tick) ? tick : tick.toFixed(1)}
            </text>
          </g>
        ))}
        <text className="weightAxis" x={PAD.left} y={H - 6}>
          {formatShortDate(from)}
        </text>
        <text
          className="weightAxis"
          x={W - PAD.right}
          y={H - 6}
          textAnchor="end"
        >
          {formatShortDate(to)}
        </text>

        {targetWeight != null ? (
          <g>
            <line
              className="weightTarget"
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(targetWeight)}
              y2={y(targetWeight)}
            />
            <text
              className="weightTargetLabel"
              x={W - PAD.right}
              y={y(targetWeight) - 5}
              textAnchor="end"
            >
              목표 {targetWeight}kg
            </text>
          </g>
        ) : null}

        {points.length > 1 ? <path className="weightLine" d={path} /> : null}
        {points.map((point, i) =>
          // 점이 많으면 테두리 때문에 선이 끊겨 보이므로 마지막 점과 누른 점만 찍는다
          points.length > 8 &&
          i !== points.length - 1 &&
          i !== activeIndex ? null : (
            <circle
              key={point.date}
              className={`weightDot${i === activeIndex ? " isActive" : ""}`}
              cx={point.cx}
              cy={point.cy}
              r={i === activeIndex || i === points.length - 1 ? 5 : 4}
            />
          ),
        )}
        {latest && activeIndex == null ? (
          <text
            className="weightEndLabel"
            x={Math.min(latest.cx, W - PAD.right)}
            y={latest.cy - 10}
            textAnchor="end"
          >
            {latest.weight}kg
          </text>
        ) : null}

        {active ? (
          <line
            className="weightCrosshair"
            x1={active.cx}
            x2={active.cx}
            y1={PAD.top}
            y2={H - PAD.bottom}
          />
        ) : null}

        <rect
          className="weightHit"
          x={PAD.left}
          y={0}
          width={W - PAD.left - PAD.right}
          height={H}
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          onPointerLeave={() => setActiveIndex(null)}
        />
      </svg>

      {active ? (
        <div
          className="weightTooltip"
          style={{
            left: `${(active.cx / W) * 100}%`,
            top: `${(active.cy / H) * 100}%`,
          }}
          role="status"
        >
          <span>{formatShortDate(active.date)}</span>
          <strong>{active.weight}kg</strong>
        </div>
      ) : null}

      {records.length < 2 ? (
        <p className="weightChartHint">
          기록이 2개 이상이면 변화 선이 그려져요.
        </p>
      ) : null}

      <table className="srOnly">
        <caption>체중 기록 표</caption>
        <thead>
          <tr>
            <th scope="col">날짜</th>
            <th scope="col">체중(kg)</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.date}>
              <td>{record.date}</td>
              <td>{record.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
