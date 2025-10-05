import { useEffect } from "react";
import { state } from "../../nexusConfig";
import isExtensionEnv from "../extension/isExtensionEnv";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function FetchData() {
  useEffect(() => {
    if (!isExtensionEnv()) return;

    async function loadUser() {
      try {
        const res = await fetch(`${backendUrl}/api/auth/me`, {
          credentials: "include",
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
              state.setNexus({ isPro: true, userData: data.user });
            }
          }

          return;
        }

        if (!res.ok) return;

        const data = await res.json();

        if (data.status === "authorized") {
          state.setNexus({ isPro: true, userData: data.user });
        }
      } catch {
        state.setNexus({ isPro: false });
      }
    }

    loadUser();
  }, []);

  return null;
}

export default FetchData;
