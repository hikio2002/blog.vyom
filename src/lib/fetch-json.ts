/**
 * Safely parse a fetch Response as JSON.
 * Handles empty bodies, non-JSON responses (HTML error pages, 204 No Content,
 * network-level failures, etc.) without throwing "Unexpected end of JSON input".
 */
export async function safeJson<T = any>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Fetch + safely parse JSON, throwing a readable Error if the request failed.
 */
export async function fetchJson<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await safeJson<T>(res);

  if (!res.ok) {
    const message = (data as any)?.error || `Request failed (${res.status} ${res.statusText})`;
    throw new Error(message);
  }

  if (data === null) {
    throw new Error('Server returned an empty response');
  }

  return data;
}
