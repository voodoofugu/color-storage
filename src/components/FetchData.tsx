import { useEffect } from "react";
import nexus from "../../nexusConfig";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// ограничиваем запросы к серверу
const ONE_DAY = 24 * 60 * 60 * 1000;

function FetchData() {
  async function loadUser() {
    try {
      const res = await fetch(`${backendUrl}/api/auth/me`, {
        credentials: "include", // <-- обязательно
      });
      const data = await res.json();

      if (data.status === "unauthorized") {
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
            nexus.set({
              isPro: true,
              userData: data.user,
            });
          }
          return;
        }

        if (!refresh.ok) {
          nexus.set({ isPro: false, userData: null, timestamp: 0 });
          return;
        }
      }

      if (data.status === "authorized") {
        nexus.set({ isPro: true, userData: data.user });
      } else if (data.status === "unauthorized")
        nexus.set({ isPro: false, userData: null, timestamp: 0 });
    } catch {
      nexus.set({ isPro: false, userData: null, timestamp: 0 });
    }
  }

  useEffect(() => {
    if (Date.now() - nexus.get("timestamp") < ONE_DAY) {
      return;
    }

    console.log("timestamp", nexus.get("timestamp"));
    loadUser();
  }, []);

  return null;
}

export default FetchData;
