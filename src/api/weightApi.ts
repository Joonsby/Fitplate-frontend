// 날짜별 체중 기록과 목표 체중 API 함수 모음
import { getApiUrl } from "./apiConfig";
import { apiFetch, apiFetchVoid } from "./httpClient";

export interface WeightRecord {
  date: string;
  weight: number;
}

export interface WeightSummary {
  records: WeightRecord[];
  latest: WeightRecord | null;
  targetWeight: number | null;
  // 기간 안 마지막 - 첫 기록. 기록이 2개 미만이면 null
  changeInRange: number | null;
  // 최근 체중 - 목표 체중. 둘 중 하나라도 없으면 null
  toTarget: number | null;
}

export async function getWeights(from: string, to: string): Promise<WeightSummary> {
  return apiFetch<WeightSummary>(getApiUrl(`/api/weights?from=${from}&to=${to}`), {
    networkErrorMessage: "체중 기록을 불러오지 못했어요.",
    httpErrorMessage: "체중 기록을 불러오지 못했어요.",
  });
}

// 같은 날짜에 기록이 있으면 서버가 덮어쓴다
export async function saveWeight(date: string, weight: number): Promise<WeightRecord> {
  return apiFetch<WeightRecord>(getApiUrl(`/api/weights/${date}`), {
    method: "PUT",
    body: { weight },
    networkErrorMessage: "체중을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
    httpErrorMessage: "체중을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
  });
}

export async function deleteWeight(date: string): Promise<void> {
  return apiFetchVoid(getApiUrl(`/api/weights/${date}`), {
    method: "DELETE",
    networkErrorMessage: "체중 기록을 지우지 못했어요.",
    httpErrorMessage: "체중 기록을 지우지 못했어요.",
  });
}

export async function saveTargetWeight(targetWeight: number | null): Promise<number | null> {
  const data = await apiFetch<{ targetWeight: number | null }>(getApiUrl("/api/weights/target"), {
    method: "PUT",
    body: { targetWeight },
    networkErrorMessage: "목표 체중을 저장하지 못했어요.",
    httpErrorMessage: "목표 체중을 저장하지 못했어요.",
  });
  return data.targetWeight;
}
