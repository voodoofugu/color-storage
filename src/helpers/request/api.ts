import safeFetch from "../safeFetch";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponse<T = any> = {
  status: number;
  resData: T | null;
  error?: string;
};

// Helper для преобразования простого типа функции в ApiMethod с generic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsApiMethod<F extends (...args: any[]) => any> = <R = any>(
  ...args: Parameters<F>
) => Promise<ApiResponse<R>>;

type ApiMethods = {
  authMe: AsApiMethod<(retries?: number) => void>;
  authRefresh: AsApiMethod<() => void>;
  authMagicLink: AsApiMethod<(email: string, deviceId: string) => void>;
  authLogout: AsApiMethod<(deviceId: string) => void>;
  startPayment: AsApiMethod<(email: string, deviceId: string) => void>;
  devicesReset: AsApiMethod<(deviceId: string) => void>;
};

// !!! обработать везде использование api с типами и сделать helper для всего что ниже
const api: ApiMethods = {
  authMe: async (retries) => {
    return safeFetch(`${API_URL}/auth/me`, {
      credentials: "include", // нужен для кук
      retries,
    });
  },

  authRefresh: async () => {
    return safeFetch(`${API_URL}/auth/refresh`, {
      credentials: "include",
    });
  },

  authMagicLink: async (email, deviceId) => {
    return safeFetch(`${API_URL}/auth/magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
  },

  authLogout: async (deviceId) => {
    return safeFetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // нужен для кук
      body: JSON.stringify({ deviceId }),
    });
  },

  startPayment: async (email, deviceId) => {
    return safeFetch(`${API_URL}/start-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
  },

  devicesReset: async (deviceId) => {
    return safeFetch(`${API_URL}/devices-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // нужен для куки так передаются токены
      body: JSON.stringify({ deviceId }),
    });
  },
};

export default api;
