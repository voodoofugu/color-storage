const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

interface SafeFetchOptions extends RequestInit {
  timeout?: number | null; // максимальное время запроса
  retries?: number; // повтор запроса
  retryDelay?: number; // задержка для повтора
}

// helper для обработки запросов
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeFetch<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<{
  status: number;
  resData: T | null;
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
    const id = timeout ? setTimeout(() => controller.abort(), timeout) : null;

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      try {
        return { status: res.status, resData: (await res.json()) as T };
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiMethod = <T = any>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => Promise<{
  status: number;
  resData: T | null;
  error?: string;
}>;
// !!! обработать везде использование api с типами и сделать helper для всего что ниже
const api: Record<string, ApiMethod> = {
  // "GET"
  authMe: async (retries?: number) => {
    return safeFetch(`${API_URL}/auth/me`, {
      credentials: "include",
      retries,
    });
  },

  // "POST"
  authRefresh: async () => {
    return safeFetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
  },

  authMagicLink: async (email: string, deviceId: string) => {
    return safeFetch(`${API_URL}/auth/request-magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
  },

  logout: async () => {
    return safeFetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  },

  emailCheckout: async (email: string, deviceId: string) => {
    return safeFetch(`${API_URL}/email-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
  },

  startPayment: async (email: string, deviceId: string) => {
    return safeFetch(`${API_URL}/start-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
  },

  getUserData: async (id: string) => {
    return safeFetch(`${API_URL}/get-user-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  },
};

export default api;
