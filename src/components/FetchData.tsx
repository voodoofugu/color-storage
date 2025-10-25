import { useEffect } from "react";
import { store } from "../../nexusConfig";

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
              store.setNexus({ isPro: true, userData: data.user });
            }
            return;
          }

          if (!refresh.ok) {
            store.setNexus({ isPro: false, userData: null });
            return;
          }
        }

        const data = await res.json();

        if (data.status === "authorized") {
          store.setNexus({ isPro: true, userData: data.user });
        }
      } catch {
        store.setNexus({ isPro: false, userData: null });
      }
    }

    loadUser();
  }, []);

  return null;
}

export default FetchData;
