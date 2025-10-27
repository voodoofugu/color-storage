import { useEffect } from "react";
import nexus from "../../nexusConfig";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function FetchData() {
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch(`${backendUrl}/api/auth/me`, {
          credentials: "include", // <-- обязательно
        });

        if (res.status === 401) {
          // access истёк → обновляем
          const refresh = await fetch(`${backendUrl}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });

          if (refresh.ok) {
            const retry = await fetch(`${backendUrl}/api/auth/me`, {
              credentials: "include",
            });
            const data = await retry.json();
            if (data.status === "authorized") {
              nexus.set({ isPro: true, userData: data.user });
            }
            return;
          }

          if (!refresh.ok) {
            nexus.set({ isPro: false, userData: null });
            return;
          }
        }

        const data = await res.json();

        if (data.status === "authorized") {
          nexus.set({ isPro: true, userData: data.user });
        }
      } catch {
        nexus.set({ isPro: false, userData: null });
      }
    }

    loadUser();
  }, []);

  return null;
}

export default FetchData;
