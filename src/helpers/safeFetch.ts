// helper для обработки запросов

interface SafeFetchOptions extends RequestInit {
  timeout?: number | null; // максимальное время запроса
  retries?: number; // повтор запроса можно добавить
  retryDelay?: number; // задержка для повтора
  onProgress?: (loaded: number, total: number | null) => void;
  progressThrottle?: number;
  responseType?: "json" | "text" | "blob" | "stream"; // тип ответа
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeFetch<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<{
  status: number;
  resData: T | null;
  error?: string;
}> {
  const responseType = options.responseType || "json";
  const {
    timeout,
    retryDelay,
    retries,
    onProgress,
    progressThrottle,
    responseType: _rt,
    ...fetchOptions
  } = {
    timeout:
      responseType === "stream" && options.timeout === undefined ? null : 8000, // если stream, то без таймаута
    retries: 0,
    retryDelay: 1000,
    progressThrottle: 100,
    ...options,
  };

  // защита retry только для GET
  const method = fetchOptions.method?.toUpperCase() || "GET";
  const retriesLocal = method === "GET" ? Math.max(0, retries ?? 0) : 0;

  for (let attempt = 0; attempt <= retriesLocal; attempt++) {
    const controller = new AbortController();
    const id = timeout ? setTimeout(() => controller.abort(), timeout) : null;

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      try {
        if (responseType === "stream") {
          if (!res.body) {
            return { status: res.status, resData: null, error: "no_body" };
          }

          const [streamForProgress, streamForReturn] = res.body.tee();

          (async () => {
            try {
              const total = Number(res.headers.get("content-length") || 0) || 0;
              const reader = streamForProgress.getReader();
              let loaded = 0;
              const throttleMs =
                progressThrottle === 0 ? 0 : progressThrottle ?? 100;
              let lastEmit = 0;
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  if (onProgress) onProgress(loaded, total || null);
                  break;
                }
                if (value) {
                  loaded += value.length ?? 0;
                  if (onProgress) {
                    const now = Date.now();
                    if (throttleMs === 0 || now - lastEmit >= throttleMs) {
                      onProgress(loaded, total || null);
                      lastEmit = now;
                    }
                  }
                }
              }
            } catch {
              // ignore
            }
          })();

          return {
            status: res.status,
            resData: streamForReturn as unknown as T,
          };
        }

        const contentType = (
          res.headers.get("content-type") || ""
        ).toLowerCase();

        if (res.status === 204) return { status: res.status, resData: null };

        if (responseType === "blob") {
          const b = await res.blob();
          return { status: res.status, resData: b as unknown as T };
        }

        if (responseType === "text") {
          const t = await res.text();
          return { status: res.status, resData: t as unknown as T };
        }

        if (
          contentType.includes("application/json") ||
          responseType === "json"
        ) {
          try {
            const json = (await res.json()) as T;
            return { status: res.status, resData: json };
          } catch {
            return { status: res.status, error: "bad_json", resData: null };
          }
        }

        try {
          const txt = await res.text();
          return { status: res.status, resData: txt as unknown as T };
        } catch {
          return { status: res.status, error: "bad_response", resData: null };
        }
      } catch {
        return { status: res.status, error: "bad_json", resData: null };
      }
    } catch (error: unknown) {
      // если это последняя попытка, удаляем timeout, возвращаем ошибку
      if (attempt === retriesLocal) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return { status: 0, error: "timeout", resData: null };
        }

        return { status: 0, error: "network_error", resData: null };
      }

      // экспоненциальный ** для повтора
      await new Promise((r) => setTimeout(r, retryDelay * 2 ** attempt));
    } finally {
      if (id) clearTimeout(id);
    }
  }

  throw new Error("safeFetch: unexpected end of function");
}

export default safeFetch;
