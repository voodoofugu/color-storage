import nexus from "../../../nexusConfig";
import api from "./api";

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

const setData = (res: {
  status: number;
  resData: {
    user: Record<string, string>;
    status: string;
  } | null;
  error?: string;
}) => {
  nexus.set({
    isPro: true,
    userData: res.resData?.user,
    readyToFetch: false,
  });
  nexus.acts.syncStatusUpdate("success");
};

async function loadUser() {
  nexus.set({ syncStatus: "pending" });

  try {
    const resMe = await api.authMe<{
      user: Record<string, string>;
      status: string;
    }>(5); // запускаем при ошибке до 5 раз

    if ("error" in resMe) return reset();

    if (resMe.resData?.status === "unauthorized") {
      const resRefresh = await api.authRefresh<{ ok: boolean }>();

      if ("error" in resRefresh) return reset();
      if (!resRefresh.resData?.ok) return reset();

      // повторный запрос после обновления токена
      const resMe2 = await api.authMe<{
        user: Record<string, string>;
        status: string;
      }>();

      if ("error" in resMe2) return reset();

      if (resMe2.resData?.status === "authorized") setData(resMe2);
      else reset();
    } else if (resMe.resData?.status === "authorized") setData(resMe);
    else reset();
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
