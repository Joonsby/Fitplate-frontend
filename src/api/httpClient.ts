// 공통 HTTP 요청 유틸리티
import { getAccessToken } from "./authToken";

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  withAuth?: boolean;
  networkErrorMessage?: string;
  httpErrorMessage?: string;
}

// 네트워크 오류 try/catch + 인증 헤더 주입 후 원시 Response 반환
export async function apiFetchRaw(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const {
    method = "GET",
    body,
    headers = {},
    withAuth = true,
    networkErrorMessage = "서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.",
  } = options;

  const requestHeaders: Record<string, string> = { ...headers };
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (withAuth) {
    const token = getAccessToken();
    if (token) requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    return await fetch(url, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    console.error(`[API] 네트워크 오류 (${method} ${url}):`, error);
    throw new Error(networkErrorMessage);
  }
}

// JSON 응답을 반환하는 요청 — response.ok 실패 시 에러 로그 + throw
export async function apiFetch<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    httpErrorMessage = "요청에 실패했습니다. 잠시 후 다시 시도해주세요.",
  } = options;

  const response = await apiFetchRaw(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API] 호출 실패 (${method} ${url}):`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(httpErrorMessage);
  }

  return response.json() as Promise<T>;
}

// 응답 바디가 없는 요청 (DELETE 등) — response.ok 실패 시 에러 로그 + throw
export async function apiFetchVoid(
  url: string,
  options: RequestOptions = {}
): Promise<void> {
  const {
    method = "DELETE",
    httpErrorMessage = "요청에 실패했습니다. 잠시 후 다시 시도해주세요.",
  } = options;

  const response = await apiFetchRaw(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API] 호출 실패 (${method} ${url}):`, {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(httpErrorMessage);
  }
}
