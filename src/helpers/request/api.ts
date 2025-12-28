import safeFetch from "../safeFetch";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiMethod = <T = any>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => Promise<{
  status: number;
  resData: T | null;
  error?: string;
}>;

type ApiMap =
  | "authMe"
  | "authRefresh"
  | "authMagicLink"
  | "authLogout"
  | "startPayment"
  | "devicesReset"
  | "updateUserData";

// !!! обработать везде использование api с типами и сделать helper для всего что ниже
const api: { [K in ApiMap]: ApiMethod } = {
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
    return safeFetch(`${API_URL}/auth/magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
  },

  authLogout: async (deviceId: string) => {
    return safeFetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });
  },

  startPayment: async (email: string, deviceId: string) => {
    return safeFetch(`${API_URL}/start-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
  },

  devicesReset: async (deviceId: string) => {
    return safeFetch(`${API_URL}/devices-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });
  },

  updateUserData: async () => {
    return safeFetch(`${API_URL}/update-user-data`, {
      method: "POST",
      credentials: "include",
    });
  },
};

export default api;
