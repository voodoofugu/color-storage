import nexus from "../../nexusConfig";
import api from "../helpers/api";

// ограничиваем запросы к серверу
const ONE_DAY = 24 * 60 * 60 * 1000;
function isTimestampPlausible(time: number) {
  if (!Number.isFinite(time)) return false;

  const now = Date.now();
  if (time > now + ONE_DAY) return false; // будущее
  if (time < now - 2 * ONE_DAY) return false; // прошлое

  return true;
}

const reset = () => {
  nexus.set({ isPro: false, userData: null });
  nexus.acts.syncStatusUpdate("error");
};

async function loadUser() {
  nexus.set({ syncStatus: "pending" });

  try {
    const data = await api.authMe<{
      user: Record<string, string>;
      status: string;
    }>(5); // запускаем при ошибке 5

    if (data.ok) {
      if (data.status === "unauthorized") {
        const refresh = await api.authRefresh();

        if (refresh.ok) {
          const retryData = await api.authMe();

          if (retryData.status === "authorized") {
            nexus.set({ isPro: true, userData: retryData.user });
            nexus.acts.syncStatusUpdate("success");
          } else reset();
        } else reset();
      } else if (data.status === "authorized") {
        nexus.set({ isPro: true, userData: data.user });
        nexus.acts.syncStatusUpdate("success");
      } else reset();
    }
  } catch (err) {
    console.error(err);
    reset();
    nexus.acts.popupOpen("error");
  }
}

async function fetchDataServer() {
  // nexus
  const isPro = nexus.get("isPro");
  const userData = nexus.get("userData");
  const timestamp = nexus.get("timestamp");

  // защита от ручной записи
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

export { fetchDataServer, loadUser };
