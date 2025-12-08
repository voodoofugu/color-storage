interface SafeFetchOptions extends RequestInit {
  timeout?: number; // максимальное время запроса
  retries?: number; // повтор запроса
  retryDelay?: number; // задержка для повтора
}

type SafeFetchResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; status: number | string };

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// helper для обработки запросов
async function safeFetch<T = unknown>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResult<T>> {
  const { timeout, retryDelay, retries, ...fetchOptions } = {
    timeout: 8000,
    retries: 0,
    retryDelay: 1000,
    ...options,
  };

  // защита retry только для GET
  const method = fetchOptions.method?.toUpperCase() || "GET";
  const retriesLocal = method === "GET" ? Math.max(0, retries ?? 0) : 0;

  for (let attempt = 0; attempt <= retriesLocal; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      // если это 5xx — можно повторить
      if (!res.ok) {
        if (res.status >= 500 && attempt < retriesLocal) continue;
        return { ok: false, status: res.status };
      }

      try {
        return { ok: true, data: (await res.json()) as T, status: res.status };
      } catch {
        return { ok: false, status: "bad_json" };
      }
    } catch (error: unknown) {
      // если это последняя попытка, удаляем timeout, возвращаем ошибку
      if (attempt === retriesLocal) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return { ok: false, status: "timeout" };
        }

        return { ok: false, status: "network_error" };
      }

      // экспоненциальный ** для повтора
      await new Promise((r) => setTimeout(r, retryDelay * 2 ** attempt));
    } finally {
      clearTimeout(id);
    }
  }

  throw new Error("safeFetch: unexpected end of function");
}

const api = {
  authMe: async <T = unknown>(retries?: number) => {
    const res = await safeFetch<T>(`${API_URL}/auth/me`, {
      credentials: "include",
      retries,
    });
    return res;
  },

  // "POST"
  authRefresh: async () => {
    const res = await safeFetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res;
  },

  authMagicLink: async (email: string, deviceId: string) => {
    const res = await safeFetch(`${API_URL}/auth/request-magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
    return res;
  },

  logout: async () => {
    const res = await safeFetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return res;
  },

  emailCheckout: async (email: string, deviceId: string) => {
    const res = await safeFetch(`${API_URL}/email-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
    return res;
  },

  startPayment: async (email: string, deviceId: string) => {
    const res = await safeFetch(`${API_URL}/start-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
    return res;
  },

  getUserData: async (id: string) => {
    const res = await safeFetch(`${API_URL}/get-user-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res;
  },
};

export default api;
