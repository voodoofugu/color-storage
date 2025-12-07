const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const api = {
  logout: async () => {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return res.json();
  },

  authMe: async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });
    return res.json();
  },

  authRefresh: async () => {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.json();
  },

  authMagicLink: async (email: string, deviceId: string) => {
    const res = await fetch(`${API_URL}/auth/request-magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
    return res.json();
  },

  emailCheckout: async (email: string, deviceId: string) => {
    const res = await fetch(`${API_URL}/email-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
    return res.json();
  },

  startPayment: async (email: string, deviceId: string) => {
    const res = await fetch(`${API_URL}/start-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, deviceId }),
    });
    return res.json();
  },

  getUserData: async (id: string) => {
    const res = await fetch(`${API_URL}/get-user-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res.json();
  },
};

export default api;
