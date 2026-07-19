const inflightRequests = new Map<string, Promise<any>>();
const responseCache = new Map<string, { data: any; timestamp: number }>();

const DEFAULT_TTL = 5000;

export function getCacheKey(url: string, params?: Record<string, any>): string {
  if (!params) return url;
  const sorted = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return sorted ? `${url}?${sorted}` : url;
}

export function getCached<T>(key: string, ttlMs = DEFAULT_TTL): T | null {
  const entry = responseCache.get(key);
  if (entry && Date.now() - entry.timestamp < ttlMs) {
    return entry.data as T;
  }
  responseCache.delete(key);
  return null;
}

export function setCached(key: string, data: any): void {
  responseCache.set(key, { data, timestamp: Date.now() });
}

export function invalidate(key: string | RegExp): void {
  if (typeof key === 'string') {
    responseCache.delete(key);
  } else {
    for (const k of [...responseCache.keys()]) {
      if (key.test(k)) responseCache.delete(k);
    }
  }
}

export async function deduplicatedFetch<T>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
  ttlMs = DEFAULT_TTL,
): Promise<T> {
  const cached = getCached<T>(key, ttlMs);
  if (cached !== null) return cached;

  const inflight = inflightRequests.get(key) as Promise<T> | undefined;
  if (inflight) return inflight;

  const controller = new AbortController();
  const promise = fetcher(controller.signal)
    .then((data) => {
      setCached(key, data);
      inflightRequests.delete(key);
      return data;
    })
    .catch((err) => {
      inflightRequests.delete(key);
      throw err;
    });

  inflightRequests.set(key, promise);
  return promise;
}

export function cancelRequest(key: string): void {
  inflightRequests.delete(key);
}

export function clearCache(): void {
  responseCache.clear();
  Array.from(inflightRequests.keys()).forEach((k) => inflightRequests.delete(k));
}
