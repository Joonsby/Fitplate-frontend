// 기록 탭의 체중 카드 — 최근·목표·기간 변화, 기간별 그래프, 기록 목록과 기록·수정·삭제 시트입니다.
import "./WeightSection.css";
import "../common/SkeletonList.css";
import { useCallback, useEffect, useState } from "react";
import { deleteWeight, getWeights, saveTargetWeight, saveWeight } from "../../api/weightApi";
import type { WeightRecord, WeightSummary } from "../../api/weightApi";
import { Button } from "../common/Button";
import { BottomSheet } from "../common/BottomSheet";
import { ChevronRightIcon } from "../common/Icons";
import { WeightChart } from "./WeightChart";
import { addDays, formatDateLabel, todayString } from "../../utils/date";

// 접어 둘 때 보여줄 최근 기록 수
const COLLAPSED_COUNT = 5;

const PERIODS = [
  { key: "week", label: "1주", days: 7 },
  { key: "month", label: "1달", days: 30 },
  { key: "quarter", label: "3달", days: 90 },
] as const;

type PeriodKey = (typeof PERIODS)[number]["key"];

interface WeightSectionProps {
  onError: (message: string) => void;
}

function formatKg(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function WeightSection({ onError }: WeightSectionProps) {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [summary, setSummary] = useState<WeightSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<{ date: string; weight: string; exists: boolean } | null>(null);
  const [targetDraft, setTargetDraft] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [showAll, setShowAll] = useState(false);

  const days = PERIODS.find((item) => item.key === period)!.days;
  const to = todayString();
  const from = addDays(to, -(days - 1));

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setSummary(await getWeights(from, to));
    } catch (error) {
      onError(error instanceof Error ? error.message : "체중 기록을 불러오지 못했어요.");
    } finally {
      setIsLoading(false);
    }
  }, [from, to, onError]);

  useEffect(() => {
    void load();
  }, [load]);

  const openEditor = (record?: WeightRecord) => {
    setFormError("");
    setEditing(
      record
        ? { date: record.date, weight: String(record.weight), exists: true }
        : { date: to, weight: summary?.latest ? String(summary.latest.weight) : "", exists: false },
    );
  };

  const submitWeight = async () => {
    if (!editing) return;
    const weight = Number(editing.weight);
    if (!Number.isFinite(weight) || weight < 20 || weight > 300) {
      setFormError("20~300 사이 숫자로 입력해 주세요.");
      return;
    }
    if (editing.date > to) {
      setFormError("오늘 이후 날짜는 기록할 수 없어요.");
      return;
    }
    setIsSaving(true);
    try {
      await saveWeight(editing.date, weight);
      setEditing(null);
      await load();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "체중을 저장하지 못했어요.");
    } finally {
      setIsSaving(false);
    }
  };

  // 목록에서 먼저 빼고, 실패하면 되돌린다
  const removeWeight = async (date: string) => {
    if (!summary) return;
    const previous = summary;
    setEditing(null);
    setSummary({ ...summary, records: summary.records.filter((record) => record.date !== date) });
    try {
      await deleteWeight(date);
      await load();
    } catch (error) {
      setSummary(previous);
      onError(error instanceof Error ? error.message : "체중 기록을 지우지 못했어요.");
    }
  };

  const submitTarget = async (clear: boolean) => {
    const value = clear ? null : Number(targetDraft);
    if (value != null && (!Number.isFinite(value) || value < 20 || value > 300)) {
      setFormError("20~300 사이 숫자로 입력해 주세요.");
      return;
    }
    setIsSaving(true);
    try {
      await saveTargetWeight(value);
      setTargetDraft(null);
      await load();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "목표 체중을 저장하지 못했어요.");
    } finally {
      setIsSaving(false);
    }
  };

  const latest = summary?.latest ?? null;
  const target = summary?.targetWeight ?? null;
  const toTarget = summary?.toTarget ?? null;
  const change = summary?.changeInRange ?? null;
  // 최신순. 접어 두면 최근 몇 건만, 펼치면 고른 기간의 기록을 모두 보여준다
  const periodRecords = [...(summary?.records ?? [])].reverse();
  const visibleRecords = showAll ? periodRecords : periodRecords.slice(0, COLLAPSED_COUNT);
  const canExpand = periodRecords.length > COLLAPSED_COUNT;

  return (
    <section className="card weightCard" aria-label="체중">
      <div className="weightHead">
        <h2>체중</h2>
        <button
          type="button"
          className="textLink"
          onClick={() => {
            setFormError("");
            setTargetDraft(target != null ? String(target) : "");
          }}
        >
          {target != null ? "목표 바꾸기" : "목표 정하기"}
        </button>
      </div>

      <dl className="weightStats">
        <div>
          <dt>최근</dt>
          <dd>{latest ? <>{formatKg(latest.weight)}<small>kg</small></> : "-"}</dd>
          <span>{latest ? formatDateLabel(latest.date) : "기록 없음"}</span>
        </div>
        <div>
          <dt>목표</dt>
          <dd>{target != null ? <>{formatKg(target)}<small>kg</small></> : "-"}</dd>
          <span>
            {toTarget == null
              ? target == null ? "정하지 않음" : "기록이 필요해요"
              : toTarget === 0 ? "목표 도달" : `${formatKg(Math.abs(toTarget))}kg ${toTarget > 0 ? "남음" : "아래"}`}
          </span>
        </div>
        <div>
          <dt>{PERIODS.find((item) => item.key === period)!.label} 변화</dt>
          <dd>{change != null ? <>{change > 0 ? "+" : ""}{formatKg(change)}<small>kg</small></> : "-"}</dd>
          <span>{change != null ? "첫 기록 대비" : "기록 2개부터"}</span>
        </div>
      </dl>

      <div className="segmented" role="radiogroup" aria-label="기간">
        {PERIODS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="radio"
            aria-checked={period === item.key}
            className={period === item.key ? "isSelected" : undefined}
            onClick={() => {
              setPeriod(item.key);
              setShowAll(false);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading && summary == null ? (
        <span className="fpSkeletonLine weightChartSkeleton" />
      ) : (
        <WeightChart records={summary?.records ?? []} from={from} to={to} targetWeight={target} />
      )}

      <Button variant="secondary" size="medium" block onClick={() => openEditor()}>
        체중 기록하기
      </Button>

      {visibleRecords.length > 0 ? (
        <ul className="weightList" aria-label={showAll ? "기간 체중 기록" : "최근 체중 기록"}>
          {visibleRecords.map((record) => (
            <li key={record.date}>
              <button type="button" onClick={() => openEditor(record)}>
                <span>{formatDateLabel(record.date)}</span>
                <strong>{formatKg(record.weight)}kg</strong>
                <ChevronRightIcon />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {canExpand ? (
        <button
          type="button"
          className="textLink weightListToggle"
          aria-expanded={showAll}
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? "접기" : `${PERIODS.find((item) => item.key === period)!.label} 기록 전체 보기 (${periodRecords.length}건)`}
          <ChevronRightIcon className={showAll ? "isOpen" : undefined} />
        </button>
      ) : null}

      {editing ? (
        <BottomSheet
          title={editing.exists ? "체중 고치기" : "체중 기록하기"}
          description="같은 날짜에 다시 기록하면 그 날짜의 체중이 바뀌어요."
          onClose={() => setEditing(null)}
          locked={isSaving}
        >
          <label className="sheetField">
            <span>날짜</span>
            <input
              className="sheetInput"
              type="date"
              max={to}
              value={editing.date}
              disabled={editing.exists}
              onChange={(event) => setEditing({ ...editing, date: event.target.value })}
            />
          </label>
          <label className="sheetField">
            <span>체중 (kg)</span>
            <input
              className="sheetInput"
              type="text"
              inputMode="decimal"
              placeholder="68.5"
              value={editing.weight}
              onChange={(event) => setEditing({ ...editing, weight: event.target.value })}
              autoFocus
            />
          </label>
          {formError ? <p className="sheetError" role="alert">{formError}</p> : null}
          <div className="sheetActions">
            {editing.exists ? (
              <Button variant="danger" size="medium" disabled={isSaving} onClick={() => void removeWeight(editing.date)}>
                삭제
              </Button>
            ) : (
              <Button variant="ghost" size="medium" disabled={isSaving} onClick={() => setEditing(null)}>
                취소
              </Button>
            )}
            <Button size="medium" disabled={isSaving} onClick={() => void submitWeight()}>
              {isSaving ? "저장 중…" : "저장"}
            </Button>
          </div>
        </BottomSheet>
      ) : null}

      {targetDraft != null ? (
        <BottomSheet
          title="목표 체중"
          description="그래프에 기준선으로 그려지고, 최근 체중과 비교해 보여드려요."
          onClose={() => setTargetDraft(null)}
          locked={isSaving}
        >
          <label className="sheetField">
            <span>목표 체중 (kg)</span>
            <input
              className="sheetInput"
              type="text"
              inputMode="decimal"
              placeholder="65"
              value={targetDraft}
              onChange={(event) => setTargetDraft(event.target.value)}
              autoFocus
            />
          </label>
          {formError ? <p className="sheetError" role="alert">{formError}</p> : null}
          <div className="sheetActions">
            <Button
              variant="ghost"
              size="medium"
              disabled={isSaving || target == null}
              onClick={() => void submitTarget(true)}
            >
              목표 해제
            </Button>
            <Button size="medium" disabled={isSaving || targetDraft.trim() === ""} onClick={() => void submitTarget(false)}>
              {isSaving ? "저장 중…" : "저장"}
            </Button>
          </div>
        </BottomSheet>
      ) : null}
    </section>
  );
}
