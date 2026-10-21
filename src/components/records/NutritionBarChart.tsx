// 날짜별 실제 섭취 칼로리를 막대 하나 계열로 그리고, 그날 목표를 막대 위 눈금으로 보여줍니다.
// 기록이 없는 날은 0 막대가 아니라 바닥의 빈 점으로만 표시해 섭취 0 으로 읽히지 않게 합니다.
import "./NutritionBarChart.css";
import { useState } from "react";
import type { DailyRecord } from "../../api/mealIntakeApi";
import { formatShortDate } from "../../utils/date";

interface NutritionBarChartProps {
  days: DailyRecord[];
}

const W = 320;
const H = 156;
const PAD = { left: 32, right: 8, top: 12, bottom: 24 };

function compact(value: number) {
  return value >= 1000
    ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`
    : String(value);
}

export function NutritionBarChart({ days }: NutritionBarChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const peak = Math.max(
    1000,
    ...days.map((day) =>
      Math.max(day.eaten?.calories ?? 0, day.target?.calories ?? 0),
    ),
  );
  // 중간 눈금도 깔끔한 수가 되도록 1,000 단위로 올린다
  const max = Math.ceil((peak * 1.1) / 1000) * 1000;
  const plotWidth = W - PAD.left - PAD.right;
  const slot = plotWidth / Math.max(1, days.length);
  const barWidth = Math.min(24, Math.max(3, slot - 2));
  const y = (value: number) =>
    PAD.top + (1 - value / max) * (H - PAD.top - PAD.bottom);
  const baseline = y(0);
  const ticks = [0, max / 2, max];
  const labelEvery = days.length > 10 ? Math.ceil(days.length / 5) : 1;

  const active = activeIndex != null ? days[activeIndex] : null;

  return (
    <div className="nutritionChart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="날짜별 실제 섭취 칼로리와 목표"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              className="nutritionGrid"
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
            />
            <text
              className="nutritionAxis"
              x={PAD.left - 6}
              y={y(tick) + 4}
              textAnchor="end"
            >
              {compact(tick)}
            </text>
          </g>
        ))}

        {days.map((day, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          const eaten = day.eaten?.calories ?? null;
          const top = eaten != null ? y(eaten) : baseline;
          const radius = Math.min(4, barWidth / 2, baseline - top);
          return (
            <g
              key={day.date}
              className={activeIndex === i ? "isActive" : undefined}
            >
              {eaten != null && eaten > 0 ? (
                <path
                  className="nutritionBar"
                  d={`M${cx - barWidth / 2},${baseline} V${top + radius} Q${cx - barWidth / 2},${top} ${cx - barWidth / 2 + radius},${top} H${cx + barWidth / 2 - radius} Q${cx + barWidth / 2},${top} ${cx + barWidth / 2},${top + radius} V${baseline} Z`}
                />
              ) : null}
              {eaten == null && day.status !== "UPCOMING" ? (
                <circle
                  className="nutritionNoRecord"
                  cx={cx}
                  cy={baseline - 4}
                  r={2.5}
                />
              ) : null}
              {day.target ? (
                <line
                  className="nutritionTargetTick"
                  x1={cx - Math.max(barWidth / 2 + 2, 4)}
                  x2={cx + Math.max(barWidth / 2 + 2, 4)}
                  y1={y(day.target.calories)}
                  y2={y(day.target.calories)}
                />
              ) : null}
              {i % labelEvery === 0 || i === days.length - 1 ? (
                <text
                  className="nutritionAxis"
                  x={cx}
                  y={H - 6}
                  textAnchor="middle"
                >
                  {formatShortDate(day.date)}
                </text>
              ) : null}
              <rect
                className="nutritionHit"
                x={PAD.left + slot * i}
                y={0}
                width={slot}
                height={H}
                onPointerDown={() => setActiveIndex(i)}
                onPointerEnter={() => setActiveIndex(i)}
                onPointerLeave={() => setActiveIndex(null)}
              />
            </g>
          );
        })}
      </svg>

      <div className="nutritionLegend">
        <span>
          <i className="nutritionLegendBar" aria-hidden="true" />
          실제 섭취
        </span>
        <span>
          <i className="nutritionLegendTick" aria-hidden="true" />
          그날 목표
        </span>
        <span>
          <i className="nutritionLegendDot" aria-hidden="true" />
          기록 없음
        </span>
      </div>

      {active ? (
        <div
          className="nutritionTooltip"
          style={{
            left: `${Math.min(80, Math.max(20, ((PAD.left + slot * activeIndex! + slot / 2) / W) * 100))}%`,
          }}
          role="status"
        >
          <strong>{formatShortDate(active.date)}</strong>
          <span>
            섭취{" "}
            {active.eaten
              ? `${active.eaten.calories.toLocaleString()} kcal`
              : "기록 없음"}
          </span>
          {active.target ? (
            <span>목표 {active.target.calories.toLocaleString()} kcal</span>
          ) : (
            <span>지정된 식단 없음</span>
          )}
        </div>
      ) : null}

      {/* 표는 너비 제한을 무시하고 늘어나므로 숨김 상자로 감싼다 */}
      <div className="srOnly">
        <table>
          <caption>날짜별 섭취·목표 칼로리 표</caption>
          <thead>
            <tr>
              <th scope="col">날짜</th>
              <th scope="col">실제 섭취(kcal)</th>
              <th scope="col">식단 계획(kcal)</th>
              <th scope="col">목표(kcal)</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.date}>
                <td>{day.date}</td>
                <td>{day.eaten ? day.eaten.calories : "기록 없음"}</td>
                <td>{day.planned ? day.planned.calories : "-"}</td>
                <td>{day.target ? day.target.calories : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
