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

const reset = (): { status: "error" } => {
  nexus.set({ isPro: false, userData: null });
  nexus.acts.syncStatusUpdate("error");
  return { status: "error" };
};

const setData = (res: {
  status: number;
  resData: {
    status: string;
    userData: Record<string, string>;
  } | null;
  error?: string;
}): { status: "success" } => {
  nexus.set({
    isPro: true,
    userData: res.resData?.userData,
    readyToFetch: false,
  });
  nexus.acts.syncStatusUpdate("success");

  return { status: "success" };
};

async function loadUser(): Promise<{ status: "success" | "error" }> {
  nexus.set({ syncStatus: "pending" });

  try {
    const resMe = await api.authMe<{
      status: string;
      userData: Record<string, string>;
    }>(4); // запускаем при ошибке до 4-x раз

    if (resMe.resData?.status !== "success") {
      const resRefresh = await api.authRefresh<{ status: string }>();

      if (resRefresh.resData?.status !== "success") return reset();

      // повторный запрос после обновления токена
      const resMe2 = await api.authMe<{
        status: string;
        userData: Record<string, string>;
      }>();

      if (resMe2.resData?.status !== "success") {
        nexus.acts.popupOpen({ text: "error" });
        return reset();
      }

      return setData(resMe2);
    }

    return setData(resMe);
  } catch (err) {
    console.error(err);
    nexus.acts.popupOpen({ text: "error" });
    return reset();
  }
}

async function fetchDataServer() {
  // nexus
  const isPro = nexus.get("isPro");
  const userData = nexus.get("userData");
  const timestamp = nexus.get("timestamp");

  // защита от ручной записи
  if (!isPro || !userData || (userData && Object.keys(userData).length === 0)) {
    nexus.set({ isPro: false, userData: null });
    return;
  }

  const now = Date.now();

  if (!isTimestampPlausible(timestamp) || now - timestamp >= ONE_DAY) {
    nexus.set({ timestamp: now });
    await loadUser();
  }
}

export { fetchDataServer, loadUser };
