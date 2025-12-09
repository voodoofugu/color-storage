interface SafeFetchOptions extends RequestInit {
  timeout?: number; // максимальное время запроса
  retries?: number; // повтор запроса
  retryDelay?: number; // задержка для повтора
}

// type SafeFetchResult<T> =
//   | { status: number; data: T } // успешный JSON или ошибка уровня сервера (400/500), но JSON прочитан
//   | { status: number; error: "bad_json"; data: null } // тело не удалось распарсить
//   | { status: 0; error: "network_error" | "timeout"; data: null }; // сетевые сбои

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// helper для обработки запросов
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeFetch<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<{
  status: number;
  data: T | null;
  error?: string;
}> {
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

      try {
        return { status: res.status, data: (await res.json()) as T };
      } catch {
        return { status: res.status, error: "bad_json", data: null };
      }
    } catch (error: unknown) {
      // если это последняя попытка, удаляем timeout, возвращаем ошибку
      if (attempt === retriesLocal) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return { status: 0, error: "timeout", data: null };
        }

        return { status: 0, error: "network_error", data: null };
      }

      // экспоненциальный ** для повтора
      await new Promise((r) => setTimeout(r, retryDelay * 2 ** attempt));
    } finally {
      clearTimeout(id);
    }
  }

  throw new Error("safeFetch: unexpected end of function");
}

// !!! обработать везде использование api с типами и сделать helper для всего что ниже
const api = {
  // "GET"
  authMe: async <T = any>(retries?: number) => {
    const res = await safeFetch<T>(`${API_URL}/auth/me`, {
      credentials: "include",
      retries,
    });
    return res;
  },

  // "POST"
  authRefresh: async <T = any>() => {
    const res = await safeFetch<T>(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res;
  },

  authMagicLink: async <T = any>(email: string, deviceId: string) => {
    const res = await safeFetch<T>(`${API_URL}/auth/request-magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
    return res;
  },

  logout: async <T = any>() => {
    const res = await safeFetch<T>(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return res;
  },

  emailCheckout: async <T = any>(email: string, deviceId: string) => {
    const res = await safeFetch<T>(`${API_URL}/email-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
    return res;
  },

  startPayment: async <T = any>(email: string, deviceId: string) => {
    const res = await safeFetch<T>(`${API_URL}/start-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
    return res;
  },

  getUserData: async <T = any>(id: string) => {
    const res = await safeFetch<T>(`${API_URL}/get-user-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res;
  },
};

export default api;
