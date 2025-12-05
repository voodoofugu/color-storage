import nexus from "../../nexusConfig";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// ограничиваем запросы к серверу
const ONE_DAY = 24 * 60 * 60 * 1000;
function isTimestampPlausible(ts: any) {
  if (typeof ts !== "number" || !Number.isFinite(ts)) return false;

  const now = Date.now();
  if (ts > now + ONE_DAY) return false; // будущее
  if (ts < now - 2 * ONE_DAY) return false; // прошлое

  return true;
}

async function loadUser() {
  nexus.set({ syncStatus: "pending" });

  try {
    const res = await fetch(`${backendUrl}/api/auth/me`, {
      credentials: "include",
    });
    const data = await res.json();

    if (data.status === "unauthorized") {
      const refresh = await fetch(`${backendUrl}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refresh.ok) {
        const retry = await fetch(`${backendUrl}/api/auth/me`, {
          credentials: "include",
        });
        const retryData = await retry.json();

        if (retryData.status === "authorized") {
          nexus.set({ isPro: true, userData: retryData.user });
          nexus.acts.syncStatusUpdate("success");
        } else {
          nexus.set({ isPro: false, userData: null });
          nexus.acts.syncStatusUpdate("error");
        }
      } else {
        nexus.set({ isPro: false, userData: null });
        nexus.acts.syncStatusUpdate("error");
      }
    } else if (data.status === "authorized") {
      nexus.set({ isPro: true, userData: data.user });
      nexus.acts.syncStatusUpdate("success");
    } else {
      nexus.set({ isPro: false, userData: null });
      nexus.acts.syncStatusUpdate("error");
    }
  } catch (err) {
    console.error(err);
    nexus.set({ isPro: false, userData: null });
    nexus.acts.syncStatusUpdate("error");
    nexus.acts.popupOpen("error");
  }
}

async function fetchDataServer() {
  // nexus
  const isPro = nexus.get("isPro");
  const userData = nexus.get("userData");
  const timestamp = nexus.get("timestamp");
  // const syncStatus = nexus.get("syncStatus");

  // !!! придумать как запускать проверку авторизации
  // проверка от ручной записи
  if (!isPro || !userData || (userData && Object.keys(userData).length === 0)) {
    nexus.set({ isPro: false, userData: null, timestamp: 0 });
    return;
  }

  const now = Date.now();

  if (!isTimestampPlausible(timestamp) || now - timestamp >= ONE_DAY) {
    nexus.set({ timestamp: now });
    await loadUser();
  }
}

export default fetchDataServer;
